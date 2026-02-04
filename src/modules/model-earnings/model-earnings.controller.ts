import {
  createModelEarningBodySchema,
  listModelEarningsQuerySchema,
  parseDateRange,
} from "./model-earnings.schemas";
import {
  createModelEarning,
  listModelEarnings,
  listModels,
  listPlatforms,
} from "./model-earnings.service";

export async function listModelEarningsController(req: Request) {
  const url = new URL(req.url);

  const parsed = listModelEarningsQuerySchema.safeParse({
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    modelId: url.searchParams.get("modelId") ?? undefined,
    platformId: url.searchParams.get("platformId") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
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
    listModelEarnings({
      from: range.from,
      to: range.to,
      modelId: parsed.data.modelId,
      platformId: parsed.data.platformId,
      limit: parsed.data.limit,
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

export async function createModelEarningController(req: Request) {
  const body = await req.json().catch(() => null);

  const parsed = createModelEarningBodySchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      body: { error: "Invalid body", details: parsed.error.flatten() },
    };
  }

  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) {
    return { ok: false as const, status: 400, body: { error: "Invalid date" } };
  }

  const created = await createModelEarning({
    modelId: parsed.data.modelId,
    platformId: parsed.data.platformId,
    date,
    quantityToken: parsed.data.quantityToken,
  });

  return {
    ok: true as const,
    status: 201,
    body: { ok: true, id: created.id },
  };
}
