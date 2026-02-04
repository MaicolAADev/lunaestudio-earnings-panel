import {
  dailyEarningsQuerySchema,
  parseDateRange,
} from "./daily-earnings.schemas";
import {
  getDailyEarningsByPeriod,
  listModels,
  listPlatforms,
} from "./daily-earnings.service";

export async function getDailyEarningsReportController(req: Request) {
  const url = new URL(req.url);

  const parsed = dailyEarningsQuerySchema.safeParse({
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

  const [platforms, models, data] = await Promise.all([
    listPlatforms(),
    listModels(),
    getDailyEarningsByPeriod({
      from: range.from,
      to: range.to,
      modelId: parsed.data.modelId,
      platformId: parsed.data.platformId,
    }),
  ]);

  return {
    ok: true as const,
    status: 200,
    body: {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      platforms,
      models,
      data,
    },
  };
}
