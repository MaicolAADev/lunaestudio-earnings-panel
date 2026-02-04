"use client";

import { useMemo, useState } from "react";

import {
  getLastNDaysRange,
  getMonthHalfRange,
  getPreviousMonthRange,
  getThisMonthRange,
  getTodayRange,
} from "../lib/date";

type Props = {
  onApply: (range: { from: string; to: string }) => void;
  disabled?: boolean;
};

function monthValueFromNow() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function DatePresets({ onApply, disabled }: Props) {
  const defaultMonth = useMemo(() => monthValueFromNow(), []);
  const [month, setMonth] = useState(defaultMonth);
  const [half, setHalf] = useState<"H1" | "H2">("H1");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApply(getTodayRange())}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:bg-black dark:text-zinc-100 dark:hover:bg-white/5"
        >
          Hoy
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApply(getLastNDaysRange(7))}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:bg-black dark:text-zinc-100 dark:hover:bg-white/5"
        >
          Últimos 7 días
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApply(getLastNDaysRange(30))}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:bg-black dark:text-zinc-100 dark:hover:bg-white/5"
        >
          Últimos 30 días
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApply(getThisMonthRange())}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:bg-black dark:text-zinc-100 dark:hover:bg-white/5"
        >
          Este mes
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApply(getPreviousMonthRange())}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:bg-black dark:text-zinc-100 dark:hover:bg-white/5"
        >
          Mes anterior
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Mes
          </span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={disabled}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Quincena
          </span>
          <select
            value={half}
            disabled={disabled}
            onChange={(e) => setHalf(e.target.value as "H1" | "H2")}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
          >
            <option value="H1">1 - 15</option>
            <option value="H2">16 - fin</option>
          </select>
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const range = getMonthHalfRange(month, half);
            if (range) onApply(range);
          }}
          className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
