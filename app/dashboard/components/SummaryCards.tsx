import { formatMoneyUSD } from "../lib/format";

type Props = {
  tokens: number;
  dollars: number;
};

export function SummaryCards({ tokens, dollars }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-xl bg-zinc-50 px-4 py-2 dark:bg-white/5">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Total tokens
        </div>
        <div className="text-lg font-semibold">{tokens}</div>
      </div>
      <div className="rounded-xl bg-zinc-50 px-4 py-2 dark:bg-white/5">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Total USD
        </div>
        <div className="text-lg font-semibold">{formatMoneyUSD(dollars)}</div>
      </div>
    </div>
  );
}
