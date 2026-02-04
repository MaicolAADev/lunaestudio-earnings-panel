"use client";

import { useEffect, useState } from "react";

import { DateRangeControls } from "./components/DateRangeControls";
import { DatePresets } from "./components/DatePresets";
import { ModelSelect } from "./components/ModelSelect";
import { ModelsEarningsTable } from "./components/ModelsEarningsTable";
import { PlatformSelect } from "./components/PlatformSelect";
import { SummaryCards } from "./components/SummaryCards";
import { useModelEarnings } from "./hooks/useModelEarnings";

export function EarningsDashboard() {
  const {
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
    models,
    totals,
    refresh,
    contentVersion,
  } = useModelEarnings();

  const [tableAnimKey, setTableAnimKey] = useState(0);

  useEffect(() => {
    setTableAnimKey((k) => k + 1);
  }, [contentVersion]);

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-4">
          <DatePresets
            disabled={loading}
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
              onRefresh={() => void refresh()}
              loading={loading}
            />
            <PlatformSelect
              platforms={platforms}
              value={platformId}
              onChange={setPlatformId}
              disabled={loading}
            />
            <ModelSelect
              models={models}
              value={modelId}
              onChange={setModelId}
              disabled={loading}
            />
          </div>

          <SummaryCards tokens={totals.tokens} dollars={totals.dollars} />
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
      </section>

      <div
        key={tableAnimKey}
        className={
          loading
            ? "animate-fade-in opacity-70 transition-opacity"
            : "animate-fade-in"
        }
      >
        <ModelsEarningsTable
          rows={rows}
          loading={loading}
          platforms={platforms}
        />
      </div>
    </div>
  );
}
