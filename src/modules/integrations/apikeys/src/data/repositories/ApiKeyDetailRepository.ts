import type { IApiKeyDetailService, ChartParams, ActivityParams } from "../../domain/interfaces/IApiKeyDetailService";
import { ApiKeyDetail } from "../../domain/entities/ApiKeyDetail";
import type { UpdateApiKeyDetailRequest } from "../../domain/entities/ApiKeyDetail";
import { ApiKeyStats } from "../../domain/entities/ApiKeyStats";
import type { ApiKeyChartDataPoint } from "../../domain/entities/ApiKeyChartData";
import type { ApiKeyActivityEntry } from "../../domain/entities/ApiKeyActivity";
import type { CreateApiKeyResult } from "../../domain/entities/ApiKey";
import { ApiKeyDetailMapper } from "../mappers/ApiKeyDetailMapper";

export class ApiKeyDetailRepository {
  constructor(private readonly service: IApiKeyDetailService) {}

  async getById(id: string): Promise<ApiKeyDetail> {
    const dto = await this.service.getById(id);
    return new ApiKeyDetail(ApiKeyDetailMapper.toDetailEntity(dto));
  }

  async update(id: string, request: UpdateApiKeyDetailRequest): Promise<void> {
    await this.service.update(id, request);
  }

  async rotate(id: string): Promise<CreateApiKeyResult> {
    return this.service.rotate(id);
  }

  async getStats(id: string): Promise<ApiKeyStats> {
    const dto = await this.service.getStats(id);
    return new ApiKeyStats(ApiKeyDetailMapper.toStatsEntity(dto));
  }

  async getChartData(id: string, params: ChartParams): Promise<ApiKeyChartDataPoint[]> {
    const dtos = await this.service.getChartData(id, params);
    return dtos.map(d => ApiKeyDetailMapper.toChartPoint(d));
  }

  async getActivity(id: string, params: ActivityParams): Promise<{ items: ApiKeyActivityEntry[]; totalCount: number }> {
    const result = await this.service.getActivity(id, params);
    return {
      items: result.items.map(d => ApiKeyDetailMapper.toActivityEntry(d)),
      totalCount: result.totalCount,
    };
  }
}
