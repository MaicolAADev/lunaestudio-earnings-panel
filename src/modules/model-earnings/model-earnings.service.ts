import { pool } from "@/src/db/pool";
import { listPlatforms } from "@/src/modules/earnings/earnings.service";

import type {
  CreateModelEarningInput,
  ListModelEarningsParams,
  ModelEarningRow,
  ModelOption,
} from "./model-earnings.types";

type DbListRow = {
  id: number;
  date: Date;
  model_id: number;
  model_name: string | null;
  platform_id: number;
  platform_name: string;
  quantity_token: number;
  dollars: number;
};

type ModelRow = {
  id: number;
  name: string | null;
  active: boolean | null;
};

type InsertRow = {
  id: number;
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

export async function listModelEarnings(
  params: ListModelEarningsParams
): Promise<ModelEarningRow[]> {
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

  const limit = Math.min(params.limit ?? 200, 500);
  values.push(limit);
  const limitParam = `$${values.length}`;

  const sql = `
    SELECT
      me.id,
      (me.date AT TIME ZONE 'UTC') AS date,
      m.id AS model_id,
      m.name AS model_name,
      p.id AS platform_id,
      p.name AS platform_name,
      me.quantity_token,
      (me.quantity_token * p.dollar_conversion)::float8 AS dollars
    FROM model_earnings me
    JOIN model m ON m.id = me.model_id
    JOIN platform p ON p.id = me.platform_id
    WHERE (me.date AT TIME ZONE 'UTC') >= $1::timestamptz
      AND (me.date AT TIME ZONE 'UTC') <= $2::timestamptz
      ${modelFilterSql}
      ${platformFilterSql}
    ORDER BY me.date DESC, me.id DESC
    LIMIT ${limitParam};
  `;

  const result = await pool.query(sql, values);
  const rows = result.rows as unknown as DbListRow[];

  return rows.map((r) => ({
    id: r.id,
    date: new Date(r.date).toISOString(),
    model_id: r.model_id,
    model_name: r.model_name,
    platform_id: r.platform_id,
    platform_name: r.platform_name,
    quantity_token: r.quantity_token,
    dollars: r.dollars,
  }));
}

export async function createModelEarning(input: CreateModelEarningInput) {
  const result = await pool.query<InsertRow>(
    `
      INSERT INTO model_earnings (model_id, platform_id, date, quantity_token)
      VALUES (
        $1::int,
        $2::int,
        ($3::timestamptz AT TIME ZONE 'UTC'),
        $4::int
      )
      RETURNING id;
    `,
    [input.modelId, input.platformId, input.date, input.quantityToken]
  );

  return { id: result.rows[0]?.id as number };
}
