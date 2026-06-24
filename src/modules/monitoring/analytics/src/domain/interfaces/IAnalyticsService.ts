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
 * Interface defining operations for the Analytics network service.
 */
export interface IAnalyticsService {
  getSummary(): Promise<AnalyticsSummary>;
  getEventDistribution(days?: number): Promise<DistributionData[]>;
  getLoginActivity(days?: number): Promise<ComparisonDataPoint[]>;
}
