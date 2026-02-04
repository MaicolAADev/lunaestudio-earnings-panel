export type EarningsItem = {
  date: string;
  platform_id: number;
  platform_name: string;
  tokens: number;
  dollars: number;
};

export type Platform = {
  id: number;
  name: string;
  link: string | null;
  image: string | null;
  dollar_conversion: number;
};

export type ModelEarnings = {
  model_id: number;
  model_name: string | null;
  phone: string | null;
  email: string | null;
  active: boolean | null;
  total_tokens: number;
  total_dollars: number;
  earnings: EarningsItem[];
};

export type EarningsApiResponse = {
  from: string;
  to: string;
  platforms: Platform[];
  data: ModelEarnings[];
};
