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

export interface IAnalyticsService {
  getSummary(): Promise<AnalyticsSummary>;
  getEventDistribution(days?: number): Promise<DistributionData[]>;
  getLoginActivity(days?: number): Promise<ComparisonDataPoint[]>;
}
