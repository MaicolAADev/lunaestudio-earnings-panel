import { pool } from "@/src/db/pool";
import { listPlatforms } from "@/src/modules/earnings/earnings.service";

import type {
  DailyEarningsRow,
  GetDailyEarningsParams,
  ModelOption,
} from "./daily-earnings.types";

type DbRow = {
  day_utc: Date;
  model_id: number;
  model_name: string | null;
  platform_id: number;
  platform_name: string;
  tokens: number;
  dollars: number;
};

type ModelRow = {
  id: number;
  name: string | null;
  active: boolean | null;
};

export { listPlatforms };

export async function listModels(): Promise<ModelOption[]> {
  const result = await pool.query<ModelRow>(
    `
      SELECT id, name, active
      FROM model
      ORDER BY name ASC;
    `
  );

  return result.rows.map((m) => ({ id: m.id, name: m.name, active: m.active }));
}

export async function getDailyEarningsByPeriod(
  params: GetDailyEarningsParams
): Promise<DailyEarningsRow[]> {
  const values: Array<string | number | Date> = [params.from, params.to];
  let modelFilterSql = "";
  let platformFilterSql = "";

  if (params.modelId) {
    values.push(params.modelId);
    modelFilterSql = ` AND me.model_id = $${values.length} `;
  }

  if (params.platformId) {
    values.push(params.platformId);
    platformFilterSql = ` AND me.platform_id = $${values.length} `;
  }

  const sql = `
    SELECT
      date_trunc('day', (me.date AT TIME ZONE 'UTC')) AS day_utc,
      m.id AS model_id,
      m.name AS model_name,
      p.id AS platform_id,
      p.name AS platform_name,
      COALESCE(SUM(me.quantity_token), 0)::int AS tokens,
      COALESCE(SUM(me.quantity_token * p.dollar_conversion), 0)::float8 AS dollars
    FROM model_earnings me
    JOIN model m ON m.id = me.model_id
    JOIN platform p ON p.id = me.platform_id
    WHERE (me.date AT TIME ZONE 'UTC') >= $1::timestamptz
      AND (me.date AT TIME ZONE 'UTC') <= $2::timestamptz
      ${modelFilterSql}
      ${platformFilterSql}
    GROUP BY date_trunc('day', (me.date AT TIME ZONE 'UTC')), m.id, m.name, p.id, p.name
    ORDER BY day_utc DESC, tokens DESC, m.name ASC, p.name ASC;
  `;

  const result = await pool.query(sql, values);
  const rows = result.rows as unknown as DbRow[];

  return rows.map((r) => ({
    date: new Date(r.day_utc).toISOString().slice(0, 10),
    model_id: r.model_id,
    model_name: r.model_name,
    platform_id: r.platform_id,
    platform_name: r.platform_name,
    tokens: r.tokens,
    dollars: r.dollars,
  }));
}
