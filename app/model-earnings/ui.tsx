"use client";

import { useEffect, useMemo, useState } from "react";

import { DatePresets } from "../dashboard/components/DatePresets";
import { DateRangeControls } from "../dashboard/components/DateRangeControls";
import { ModelSelect } from "../dashboard/components/ModelSelect";
import { PlatformSelect } from "../dashboard/components/PlatformSelect";
import { SummaryCards } from "../dashboard/components/SummaryCards";

import { formatMoneyUSD } from "../dashboard/lib/format";
import { makeUtcRangeFromDateInputs, toLocalDateInputValue } from "../dashboard/lib/date";

import type { ListModelEarningsResponse, ModelEarningRow } from "./types";

function isoToLocalDateInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return toLocalDateInputValue(d);
}

export function ModelEarningsEntryPanel() {
  const now = useMemo(() => new Date(), []);

  const [refreshTick, setRefreshTick] = useState(0);

  const [from, setFrom] = useState(() => {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return toLocalDateInputValue(d);
  });
  const [to, setTo] = useState(() => toLocalDateInputValue(now));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<ListModelEarningsResponse["platforms"]>([]);
  const [models, setModels] = useState<ListModelEarningsResponse["models"]>([]);
  const [rows, setRows] = useState<ModelEarningRow[]>([]);

  const [filterPlatformId, setFilterPlatformId] = useState<number | "all">("all");
  const [filterModelId, setFilterModelId] = useState<number | "all">("all");

  const [formModelId, setFormModelId] = useState<number | "all">("all");
  const [formPlatformId, setFormPlatformId] = useState<number | "all">("all");
  const [formDate, setFormDate] = useState(() => toLocalDateInputValue(now));
  const [formTokens, setFormTokens] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.tokens += r.quantity_token ?? 0;
        acc.dollars += r.dollars ?? 0;
        return acc;
      },
      { tokens: 0, dollars: 0 }
    );
  }, [rows]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { fromDate, toDate } = makeUtcRangeFromDateInputs(from, to);
        const params = new URLSearchParams({
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          limit: "200",
        });

        if (filterPlatformId !== "all") params.set("platformId", String(filterPlatformId));
        if (filterModelId !== "all") params.set("modelId", String(filterModelId));

        const res = await fetch(`/api/model-earnings?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }

        const json = (await res.json()) as ListModelEarningsResponse;
        if (cancelled) return;

        setPlatforms(json.platforms ?? []);
        setModels(json.models ?? []);
        setRows(json.data ?? []);
        setContentVersion((v) => v + 1);

        if (formModelId === "all" && json.models?.length) {
          setFormModelId(json.models[0].id);
        }
        if (formPlatformId === "all" && json.platforms?.length) {
          setFormPlatformId(json.platforms[0].id);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Error desconocido");
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, filterPlatformId, filterModelId, refreshTick]);

  async function onSubmit() {
    if (formModelId === "all" || formPlatformId === "all") {
      setError("Selecciona modelo y plataforma");
      return;
    }

    const quantityToken = Number(formTokens);
    if (!Number.isFinite(quantityToken) || quantityToken < 0) {
      setError("Tokens inválidos");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dateIso = new Date(`${formDate}T00:00:00.000Z`).toISOString();

      const res = await fetch(`/api/model-earnings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          modelId: formModelId,
          platformId: formPlatformId,
          date: dateIso,
          quantityToken,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      // refresh list
      const { fromDate, toDate } = makeUtcRangeFromDateInputs(from, to);
      const params = new URLSearchParams({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        limit: "200",
      });
      if (filterPlatformId !== "all") params.set("platformId", String(filterPlatformId));
      if (filterModelId !== "all") params.set("modelId", String(filterModelId));

      const listRes = await fetch(`/api/model-earnings?${params.toString()}`, { cache: "no-store" });
      const json = (await listRes.json()) as ListModelEarningsResponse;
      setRows(json.data ?? []);
      setContentVersion((v) => v + 1);

      setFormTokens("0");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  const [tableAnimKey, setTableAnimKey] = useState(0);
  useEffect(() => {
    setTableAnimKey((k) => k + 1);
  }, [contentVersion]);

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-4">
          <DatePresets
            disabled={loading || submitting}
            onApply={(range) => {
              setFrom(range.from);
              setTo(range.to);
            }}
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <DateRangeControls
              from={from}
              to={to}
              onChangeFrom={setFrom}
              onChangeTo={setTo}
              onRefresh={() => {
                setRefreshTick((t) => t + 1);
              }}
              loading={loading}
            />
            <PlatformSelect
              platforms={platforms}
              value={filterPlatformId}
              onChange={setFilterPlatformId}
              disabled={loading || submitting}
            />
            <ModelSelect
              models={models}
              value={filterModelId}
              onChange={setFilterModelId}
              disabled={loading || submitting}
            />
          </div>

          <SummaryCards tokens={totals.tokens} dollars={totals.dollars} />
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-3 text-sm font-semibold">Nuevo registro</div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <ModelSelect
            models={models}
            value={formModelId}
            onChange={setFormModelId}
            disabled={submitting}
          />
          <PlatformSelect
            platforms={platforms}
            value={formPlatformId}
            onChange={setFormPlatformId}
            disabled={submitting}
          />
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Fecha
            </span>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Tokens
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={formTokens}
              onChange={(e) => setFormTokens(e.target.value)}
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {submitting ? "Guardando..." : "Guardar"}
          </button>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Se guarda como UTC: {formDate ? `${formDate}T00:00:00.000Z` : "—"}
          </div>
        </div>
      </section>

      <section
        key={tableAnimKey}
        className={
          loading
            ? "animate-fade-in opacity-70 transition-opacity"
            : "animate-fade-in"
        }
      >
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-white/10">
            Registros recientes
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Plataforma</th>
                  <th className="px-4 py-3">Tokens</th>
                  <th className="px-4 py-3">USD</th>
                  <th className="px-4 py-3">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{isoToLocalDateInput(r.date)}</td>
                    <td className="px-4 py-3">{r.model_name ?? `Modelo ${r.model_id}`}</td>
                    <td className="px-4 py-3">{r.platform_name}</td>
                    <td className="px-4 py-3 font-medium">{r.quantity_token}</td>
                    <td className="px-4 py-3 font-medium">{formatMoneyUSD(r.dollars)}</td>
                    <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{r.id}</td>
                  </tr>
                ))}

                {rows.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      No hay registros.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
