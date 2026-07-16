/**
 * AnalyticsEvent Repository — implements IAnalyticsEventRepository using AnalyticsEventService.
 */
import type {
  IAnalyticsEventRepository,
  AnalyticsEventListParams,
  AnalyticsEventListResult,
  AnalyticsDailyMetricResponse,
} from "../../domain/interfaces/IAnalyticsEventRepository";
import type { IAnalyticsEventService } from "../../domain/interfaces/IAnalyticsEventService";
import { AnalyticsEventMapper } from "../mappers/AnalyticsEventMapper";

export class AnalyticsEventRepository implements IAnalyticsEventRepository {
  constructor(private readonly service: IAnalyticsEventService) {}

  async getAll(params: AnalyticsEventListParams): Promise<AnalyticsEventListResult> {
    const result = await this.service.getAll(params);
    return {
      items: (result.items ?? []).map((model) => AnalyticsEventMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  async getDailyMetrics(params: {
    eventName: string;
    from: string;
    to: string;
  }): Promise<AnalyticsDailyMetricResponse[]> {
    const models = await this.service.getDailyMetrics(params);
    return (models ?? []).map((model) => ({
      date: model.date,
      eventName: model.eventName,
      count: model.count,
      sum: model.sum,
    }));
  }
}
