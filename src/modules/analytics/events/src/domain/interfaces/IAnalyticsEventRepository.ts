/**
 * IAnalyticsEventRepository Interface
 *
 * Defines the contract for Analytics Event data access.
 */
import type { AnalyticsEvent } from "../entities/AnalyticsEvent";

export interface AnalyticsEventListParams {
  page: number;
  pageSize: number;
  eventName?: string;
}

export interface AnalyticsEventListResult {
  items: AnalyticsEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AnalyticsDailyMetricResponse {
  date: string;
  eventName: string;
  count: number;
  sum?: number;
}

export interface IAnalyticsEventRepository {
  getAll(params: AnalyticsEventListParams): Promise<AnalyticsEventListResult>;
  getDailyMetrics(params: { eventName: string; from: string; to: string }): Promise<AnalyticsDailyMetricResponse[]>;
}
