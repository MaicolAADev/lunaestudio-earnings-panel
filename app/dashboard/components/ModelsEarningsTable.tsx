import type { ModelEarnings, Platform } from "../types";
import { formatMoneyUSD } from "../lib/format";

type Props = {
  rows: ModelEarnings[];
  loading: boolean;
  platforms: Platform[];
};

export function ModelsEarningsTable({ rows, loading, platforms }: Props) {
  const platformById = new Map(platforms.map((p) => [p.id, p] as const));

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-white/10">
        Ganancias por modelo
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Activa</th>
              <th className="px-4 py-3">Tokens</th>
              <th className="px-4 py-3">USD</th>
              <th className="px-4 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
            {rows.map((r) => (
              <tr key={r.model_id} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-semibold">{r.model_name ?? "—"}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    ID: {r.model_id}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {r.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      r.active
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-white/5 dark:text-zinc-300"
                    }`}
                  >
                    {r.active ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{r.total_tokens}</td>
                <td className="px-4 py-3 font-medium">
                  {formatMoneyUSD(r.total_dollars)}
                </td>
                <td className="px-4 py-3">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-white dark:decoration-white/30 dark:hover:decoration-white/60">
                      Ver
                    </summary>
                    <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black">
                      {r.earnings.length === 0 ? (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Sin registros en el período.
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {r.earnings.map((e) => (
                            <li
                                key={`${r.model_id}-${e.platform_id}-${e.date}`}
                              className="flex items-center justify-between gap-6 text-xs"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                  {(() => {
                                    const p = platformById.get(e.platform_id);
                                    if (!p?.image) return null;
                                    return (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={p.image}
                                        alt={p.name}
                                        className="h-5 w-5 shrink-0 rounded"
                                      />
                                    );
                                  })()}
                                  <div className="min-w-0">
                                    <div className="truncate font-medium">
                                      {e.platform_name}
                                    </div>
                                    <div className="text-zinc-600 dark:text-zinc-400">
                                      {e.date}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-zinc-600 dark:text-zinc-400">
                                  {e.tokens} tokens
                                </div>
                                <div className="font-semibold">
                                  {formatMoneyUSD(e.dollars)}
                                </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                </td>
              </tr>
            ))}

            {rows.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400"
                >
                  No hay modelos o no hay datos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
