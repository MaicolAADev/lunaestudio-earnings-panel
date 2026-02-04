import { z } from "zod";

export const earningsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  modelId: z.coerce.number().int().positive().optional(),
  platformId: z.coerce.number().int().positive().optional(),
});

export function defaultFromTo() {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth(), 1);
  return { from, to };
}

export function parseDateRange(input: { from?: string; to?: string }) {
  const fallback = defaultFromTo();
  const from = input.from ? new Date(input.from) : fallback.from;
  const to = input.to ? new Date(input.to) : fallback.to;

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return { ok: false as const, error: "Invalid from/to datetime" };
  }
  if (from > to) {
    return { ok: false as const, error: "'from' must be <= 'to'" };
  }

  return { ok: true as const, from, to };
}
