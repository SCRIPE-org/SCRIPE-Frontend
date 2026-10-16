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
  SubscriptionAnalytics,
  TenantAnalyticsListItem,
  FeatureModuleGroup,
} from "../entities/AnalyticsEntities";

/**
 * Repository layer implementing client request queries for analytics.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IAnalyticsRepository {
  readonly exportEndpoint: string;
  getSummary(): Promise<AnalyticsSummary>;
  getEventDistribution(days?: number): Promise<DistributionData[]>;
  getLoginActivity(days?: number): Promise<ComparisonDataPoint[]>;
  getSubscriptions(): Promise<SubscriptionAnalytics>;
  getTenants(
    search?: string,
    page?: number,
    pageSize?: number
  ): Promise<{ items: TenantAnalyticsListItem[]; totalCount: number }>;
  getGroupedFeatures(): Promise<FeatureModuleGroup[]>;
}
