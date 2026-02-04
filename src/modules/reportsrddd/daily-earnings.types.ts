export type DailyEarningsRow = {
  date: string; // YYYY-MM-DD (UTC)
  model_id: number;
  model_name: string | null;
  platform_id: number;
  platform_name: string;
  tokens: number;
  dollars: number;
};

export type ModelOption = {
  id: number;
  name: string | null;
  active: boolean | null;
};

export type GetDailyEarningsParams = {
  from: Date;
  to: Date;
  modelId?: number;
  platformId?: number;
};
