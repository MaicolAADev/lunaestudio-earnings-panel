import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { EarningsApiResponse, ModelEarnings, Platform } from "../types";
import { makeUtcRangeFromDateInputs, toLocalDateInputValue } from "../lib/date";

export function useModelEarnings() {
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const initialRange = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth(), 1);
    return {
      from: toLocalDateInputValue(from),
      to: toLocalDateInputValue(to),
    };
  }, []);

  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [platformId, setPlatformId] = useState<number | "all">("all");
  const [modelId, setModelId] = useState<number | "all">("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ModelEarnings[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [contentVersion, setContentVersion] = useState(0);

  const refresh = useCallback(async () => {
    requestSeq.current += 1;
    const seq = requestSeq.current;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const { fromDate, toDate } = makeUtcRangeFromDateInputs(from, to);

      const params = new URLSearchParams({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });

      if (platformId !== "all") {
        params.set("platformId", String(platformId));
      }

      if (modelId !== "all") {
        params.set("modelId", String(modelId));
      }

      const res = await fetch(`/api/models/earnings?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      const json = (await res.json()) as EarningsApiResponse;

      if (seq !== requestSeq.current) return;

      setPlatforms(json.platforms ?? []);
      setRows(json.data ?? []);
      setContentVersion((v) => v + 1);
    } catch (e) {
      if (seq !== requestSeq.current) return;

      if (e instanceof DOMException && e.name === "AbortError") {
        return;
      }

      setRows([]);
      setPlatforms([]);
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      if (seq !== requestSeq.current) return;
      setLoading(false);
    }
  }, [from, to, platformId, modelId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.tokens += r.total_tokens ?? 0;
        acc.dollars += r.total_dollars ?? 0;
        return acc;
      },
      { tokens: 0, dollars: 0 }
    );
  }, [rows]);

  const models = useMemo(() => {
    return rows
      .map((r) => ({
        id: r.model_id,
        name: r.model_name,
        active: r.active,
      }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [rows]);

  return {
    from,
    to,
    setFrom,
    setTo,
    platformId,
    setPlatformId,
    modelId,
    setModelId,
    loading,
    error,
    rows,
    platforms,
    contentVersion,
    models,
    totals,
    refresh,
  };
}
