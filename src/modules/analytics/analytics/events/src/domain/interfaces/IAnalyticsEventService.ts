/**
 * IAnalyticsEventService Interface
 *
 * Defines the contract for Analytics Event API operations.
 */
import type {
  AnalyticsEventModel,
  AnalyticsDailyMetricModel,
} from "../../data/models/AnalyticsEventModel";

export interface AnalyticsEventServiceListResult {
  items: AnalyticsEventModel[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface IAnalyticsEventService {
  getAll(params: {
    page: number;
    pageSize: number;
    eventName?: string;
  }): Promise<AnalyticsEventServiceListResult>;
  getDailyMetrics(params: {
    eventName: string;
    from: string;
    to: string;
  }): Promise<AnalyticsDailyMetricModel[]>;
}
