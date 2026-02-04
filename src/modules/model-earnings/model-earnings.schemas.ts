import { z } from "zod";
import { parseDateRange } from "@/src/modules/earnings/earnings.schemas";

export const listModelEarningsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  modelId: z.coerce.number().int().positive().optional(),
  platformId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
});

export const createModelEarningBodySchema = z.object({
  modelId: z.coerce.number().int().positive(),
  platformId: z.coerce.number().int().positive(),
  date: z.string().datetime(),
  quantityToken: z.coerce.number().int().nonnegative(),
});

export { parseDateRange };
