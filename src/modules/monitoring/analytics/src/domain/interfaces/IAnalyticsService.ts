/**
 * Analytics Service Interface
 *
 * Contract for HTTP API calls to analytics-related endpoints.
 */
import type {
  AnalyticsSummary,
  DistributionData,
  ComparisonDataPoint,
} from "../entities/AnalyticsEntities";

/**
 * Http API network service for i analytics.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IAnalyticsService {
  getSummary(): Promise<AnalyticsSummary>;
  getEventDistribution(days?: number): Promise<DistributionData[]>;
  getLoginActivity(days?: number): Promise<ComparisonDataPoint[]>;
}
