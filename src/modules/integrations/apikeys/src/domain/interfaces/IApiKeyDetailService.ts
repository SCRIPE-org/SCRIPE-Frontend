import type { ApiKeyDetailData, UpdateApiKeyDetailRequest } from "../entities/ApiKeyDetail";
import type { ApiKeyStatsData } from "../entities/ApiKeyStats";
import type { ApiKeyChartDataPoint } from "../entities/ApiKeyChartData";
import type { ApiKeyActivityEntry } from "../entities/ApiKeyActivity";
import type { CreateApiKeyResult } from "../entities/ApiKey";

export interface ChartParams {
  granularity: "hourly" | "daily";
  startDate?: string;
  endDate?: string;
  endpoint?: string;
  statusCodeGroup?: string;
}

export interface ActivityParams {
  page: number;
  pageSize: number;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  startDate?: string;
  endDate?: string;
}

export interface IApiKeyDetailService {
  getById(id: string): Promise<ApiKeyDetailData>;
  update(id: string, request: UpdateApiKeyDetailRequest): Promise<void>;
  rotate(id: string): Promise<CreateApiKeyResult>;
  getStats(id: string): Promise<ApiKeyStatsData>;
  getChartData(id: string, params: ChartParams): Promise<ApiKeyChartDataPoint[]>;
  getActivity(id: string, params: ActivityParams): Promise<{ items: ApiKeyActivityEntry[]; totalCount: number }>;
  deletePermanently(id: string): Promise<void>;
}
