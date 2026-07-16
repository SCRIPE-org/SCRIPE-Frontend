import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IApiKeyDetailService, ChartParams, ActivityParams } from "../../domain/interfaces/IApiKeyDetailService";
import type { ApiKeyDetailDto, ApiKeyStatsDto, ApiKeyChartDataPointDto, ApiKeyActivityEntryDto } from "../models/ApiKeyDetailDto";
import type { UpdateApiKeyDetailRequest } from "../../domain/entities/ApiKeyDetail";
import type { CreateApiKeyResult } from "../../domain/entities/ApiKey";

export class ApiKeyDetailService implements IApiKeyDetailService {
  constructor(private readonly api: IApiService) {}

  async getById(id: string): Promise<ApiKeyDetailDto> {
    return this.api.get(API_ENDPOINTS.API_KEYS.GET_BY_ID(id));
  }

  async update(id: string, request: UpdateApiKeyDetailRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.API_KEYS.UPDATE(id), request);
  }

  async rotate(id: string): Promise<CreateApiKeyResult> {
    return this.api.post(API_ENDPOINTS.API_KEYS.ROTATE(id), {});
  }

  async getStats(id: string): Promise<ApiKeyStatsDto> {
    return this.api.get(API_ENDPOINTS.API_KEYS.STATS(id));
  }

  async getChartData(id: string, params: ChartParams): Promise<ApiKeyChartDataPointDto[]> {
    const url = buildUrl(
      API_ENDPOINTS.API_KEYS.CHART_DATA(id),
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get(url);
  }

  async getActivity(id: string, params: ActivityParams): Promise<{ items: ApiKeyActivityEntryDto[]; totalCount: number }> {
    const url = buildUrl(
      API_ENDPOINTS.API_KEYS.ACTIVITY(id),
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get(url);
  }

  async deletePermanently(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.API_KEYS.DELETE_PERMANENT(id));
  }
}
