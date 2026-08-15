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

// Matches the backend's AnalyticsDailyMetricResponse field-for-field (see
// AnalyticsEventModel.ts's AnalyticsDailyMetricJson for the wire-level contract).
export interface AnalyticsDailyMetricResponse {
  eventName: string;
  bucketDateUtc: string;
  count: number;
  valueSum: number;
  valueMin?: number | null;
  valueMax?: number | null;
  lastEventAt: string;
}

export interface IAnalyticsEventRepository {
  getAll(params: AnalyticsEventListParams): Promise<AnalyticsEventListResult>;
  getDailyMetrics(params: {
    eventName: string;
    from: string;
    to: string;
  }): Promise<AnalyticsDailyMetricResponse[]>;
}
