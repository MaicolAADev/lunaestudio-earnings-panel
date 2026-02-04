export type ModelOption = {
  id: number;
  name: string | null;
  active: boolean | null;
};

export type Platform = {
  id: number;
  name: string;
  link: string | null;
  image: string | null;
  dollar_conversion: number;
};

export type ModelEarningRow = {
  id: number;
  date: string; // ISO string (UTC) for UI
  model_id: number;
  model_name: string | null;
  platform_id: number;
  platform_name: string;
  quantity_token: number;
  dollars: number;
};

export type ListModelEarningsParams = {
  from: Date;
  to: Date;
  modelId?: number;
  platformId?: number;
  limit?: number;
};

export type CreateModelEarningInput = {
  modelId: number;
  platformId: number;
  date: Date; // treated as UTC instant
  quantityToken: number;
};
