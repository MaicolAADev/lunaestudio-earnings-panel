export type Platform = {
  id: number;
  name: string;
  link: string | null;
  image: string | null;
  dollar_conversion: number;
};

export type ModelOption = {
  id: number;
  name: string | null;
  active: boolean | null;
};

export type ModelEarningRow = {
  id: number;
  date: string; // ISO
  model_id: number;
  model_name: string | null;
  platform_id: number;
  platform_name: string;
  quantity_token: number;
  dollars: number;
};

export type ListModelEarningsResponse = {
  from: string;
  to: string;
  platforms: Platform[];
  models: ModelOption[];
  data: ModelEarningRow[];
};
