type Props = {
  from: string;
  to: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
};

export function DateRangeControls({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onRefresh,
  loading,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Desde
        </span>
        <input
          type="date"
          value={from}
          onChange={(e) => onChangeFrom(e.target.value)}
          className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Hasta
        </span>
        <input
          type="date"
          value={to}
          onChange={(e) => onChangeTo(e.target.value)}
          className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
        />
      </label>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-black"
      >
        {loading ? "Cargando…" : "Actualizar"}
      </button>
    </div>
  );
}
