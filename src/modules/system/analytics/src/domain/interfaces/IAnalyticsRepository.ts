/**
 * Analytics Repository Interface
 *
 * Contract for the analytics data repository.
 * Returns domain entities (not raw DTOs).
 */
import type {
  AnalyticsSummary,
  DistributionData,
  ComparisonDataPoint,
} from "../entities/AnalyticsEntities";

export interface IAnalyticsRepository {
  getSummary(): Promise<AnalyticsSummary>;
  getEventDistribution(days?: number): Promise<DistributionData[]>;
  getLoginActivity(days?: number): Promise<ComparisonDataPoint[]>;
}
