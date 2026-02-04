import { earningsQuerySchema, parseDateRange } from "./earnings.schemas";
import { getModelEarningsByPeriod, listPlatforms } from "./earnings.service";

export async function getModelEarningsController(req: Request) {
  const url = new URL(req.url);

  const parsed = earningsQuerySchema.safeParse({
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    modelId: url.searchParams.get("modelId") ?? undefined,
    platformId: url.searchParams.get("platformId") ?? undefined,
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      body: { error: "Invalid query params", details: parsed.error.flatten() },
    };
  }

  const range = parseDateRange({ from: parsed.data.from, to: parsed.data.to });
  if (!range.ok) {
    return { ok: false as const, status: 400, body: { error: range.error } };
  }

  const data = await getModelEarningsByPeriod({
    from: range.from,
    to: range.to,
    modelId: parsed.data.modelId,
    platformId: parsed.data.platformId,
  });

  const platforms = await listPlatforms();

  return {
    ok: true as const,
    status: 200,
    body: {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      platforms,
      data,
    },
  };
}
