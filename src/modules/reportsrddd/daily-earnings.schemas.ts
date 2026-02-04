import { z } from "zod";
import { parseDateRange } from "@/src/modules/earnings/earnings.schemas";

export const dailyEarningsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  modelId: z.coerce.number().int().positive().optional(),
  platformId: z.coerce.number().int().positive().optional(),
});

export { parseDateRange };
