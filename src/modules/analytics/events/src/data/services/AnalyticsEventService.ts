/**
 * AnalyticsEvent Service — handles all API calls for the Analytics module.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@core/config/api-endpoints";
import {
  AnalyticsEventModel,
  AnalyticsDailyMetricModel,
  type AnalyticsEventListResponseJson,
  type AnalyticsDailyMetricJson,
} from "../models/AnalyticsEventModel";
import type {
  IAnalyticsEventService,
  AnalyticsEventServiceListResult,
} from "../../domain/interfaces/IAnalyticsEventService";

const BASE_URL = "/v1/analytics";

export class AnalyticsEventService implements IAnalyticsEventService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    eventName?: string;
  }): Promise<AnalyticsEventServiceListResult> {
    const url = buildUrl(`${BASE_URL}/events`, {
      page: params.page,
      pageSize: params.pageSize,
      eventName: params.eventName,
    });

    const response = await this.api.get<AnalyticsEventListResponseJson>(url);

    return {
      items: (response.items ?? []).map((json) => AnalyticsEventModel.fromJson(json)),
      totalCount: response.totalCount ?? 0,
      page: response.page ?? params.page,
      pageSize: response.pageSize ?? params.pageSize,
    };
  }

  async getDailyMetrics(params: {
    eventName: string;
    from: string;
    to: string;
  }): Promise<AnalyticsDailyMetricModel[]> {
    const url = buildUrl(`${BASE_URL}/daily-metrics`, {
      eventName: params.eventName,
      from: params.from,
      to: params.to,
    });

    const response = await this.api.get<AnalyticsDailyMetricJson[]>(url);

    return (response ?? []).map((json) => AnalyticsDailyMetricModel.fromJson(json));
  }
}
