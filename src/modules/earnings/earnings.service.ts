import { pool } from "@/src/db/pool";

import type {
  GetModelEarningsParams,
  ModelEarnings,
  Platform,
} from "./earnings.types";

type DbRow = {
  model_id: number;
  model_name: string | null;
  phone: string | null;
  email: string | null;
  active: boolean | null;
  earnings: unknown;
  total_tokens: number;
  total_dollars: number;
};

type PlatformRow = {
  id: number;
  name: string;
  link: string | null;
  image: string | null;
  dollar_conversion: number;
};

export async function listPlatforms(): Promise<Platform[]> {
  const result = await pool.query<PlatformRow>(
    `
      SELECT id, name, link, image, dollar_conversion::float8 AS dollar_conversion
      FROM platform
      ORDER BY name ASC;
    `
  );

  return result.rows.map((p) => ({
    id: p.id,
    name: p.name,
    link: p.link,
    image: p.image,
    dollar_conversion: p.dollar_conversion,
  }));
}

export async function getModelEarningsByPeriod(
  params: GetModelEarningsParams
): Promise<ModelEarnings[]> {
  const values: Array<string | number | Date> = [params.from, params.to];
  let modelFilterSql = "";
  let platformJoinFilterSql = "";

  if (params.modelId) {
    values.push(params.modelId);
    modelFilterSql = ` AND m.id = $${values.length} `;
  }

  if (params.platformId) {
    values.push(params.platformId);
    platformJoinFilterSql = ` AND me.platform_id = $${values.length} `;
  }

  const sql = `
    WITH earnings_by_day_platform AS (
      SELECT
        m.id AS model_id,
        date_trunc('day', (me.date AT TIME ZONE 'UTC')) AS day_utc,
        p.id AS platform_id,
        p.name AS platform_name,
        COALESCE(SUM(me.quantity_token), 0)::int AS tokens,
        COALESCE(SUM(me.quantity_token * p.dollar_conversion), 0)::float8 AS dollars
      FROM model m
      LEFT JOIN model_earnings me
        ON me.model_id = m.id
        AND (me.date AT TIME ZONE 'UTC') >= $1::timestamptz
        AND (me.date AT TIME ZONE 'UTC') <= $2::timestamptz
        ${platformJoinFilterSql}
      LEFT JOIN platform p
        ON p.id = me.platform_id
      WHERE 1=1
        ${modelFilterSql}
      GROUP BY m.id, date_trunc('day', (me.date AT TIME ZONE 'UTC')), p.id, p.name
    ),
    models AS (
      SELECT id, name, phone, email, active
      FROM model m
      WHERE 1=1
        ${modelFilterSql}
    )
    SELECT
      m.id AS model_id,
      m.name AS model_name,
      m.phone,
      m.email,
      m.active,
      COALESCE(
        json_agg(
          json_build_object(
            'date', to_char(e.day_utc AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
            'platform_id', e.platform_id,
            'platform_name', e.platform_name,
            'tokens', e.tokens,
            'dollars', e.dollars
          )
          ORDER BY e.day_utc
        ) FILTER (WHERE e.day_utc IS NOT NULL AND e.platform_id IS NOT NULL),
        '[]'::json
      ) AS earnings,
      COALESCE(SUM(e.tokens), 0)::int AS total_tokens,
      COALESCE(SUM(e.dollars), 0)::float8 AS total_dollars
    FROM models m
    LEFT JOIN earnings_by_day_platform e
      ON e.model_id = m.id
    GROUP BY m.id, m.name, m.phone, m.email, m.active
    ORDER BY total_tokens DESC, m.name ASC;
  `;

  const result = await pool.query(sql, values);
  const rows = result.rows as DbRow[];

  return rows.map((row) => ({
    model_id: row.model_id,
    model_name: row.model_name,
    phone: row.phone,
    email: row.email,
    active: row.active,
    total_tokens: row.total_tokens,
    total_dollars: row.total_dollars,
    earnings: Array.isArray(row.earnings) ? (row.earnings as any) : [],
  }));
}
