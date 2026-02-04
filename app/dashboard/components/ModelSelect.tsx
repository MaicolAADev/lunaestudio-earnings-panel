type ModelOption = {
  id: number;
  name: string | null;
  active: boolean | null;
};

type Props = {
  models: ModelOption[];
  value: number | "all";
  onChange: (value: number | "all") => void;
  disabled?: boolean;
};

export function ModelSelect({ models, value, onChange, disabled }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Modelo
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
        {models.map((m) => (
          <option key={m.id} value={String(m.id)}>
            {(m.name ?? `Modelo ${m.id}`) + (m.active ? "" : " (inactiva)")}
          </option>
        ))}
      </select>
    </label>
  );
}
