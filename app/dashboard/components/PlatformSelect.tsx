import type { Platform } from "../types";

type Props = {
  platforms: Platform[];
  value: number | "all";
  onChange: (value: number | "all") => void;
  disabled?: boolean;
};

export function PlatformSelect({ platforms, value, onChange, disabled }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Plataforma
      </span>
      <select
        value={String(value)}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next === "all" ? "all" : Number(next));
        }}
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
      >
        <option value="all">Todas</option>
        {platforms.map((p) => (
          <option key={p.id} value={String(p.id)}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
