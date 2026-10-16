/**
 * Analytics Service Interface
 *
 * Contract for HTTP API calls to analytics-related endpoints.
 */
import type {
  AnalyticsSummaryDto,
  DistributionDataDto,
  ComparisonDataPointDto,
  SubscriptionDashboardDto,
  TenantListResponseDto,
  FeatureModuleDto,
} from "../../data/models/AnalyticsModels";

/**
 * Http API network service for analytics.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IAnalyticsService {
  getSummary(): Promise<AnalyticsSummaryDto>;
  getEventDistribution(days?: number): Promise<DistributionDataDto[]>;
  getLoginActivity(days?: number): Promise<ComparisonDataPointDto[]>;
  getSubscriptions(): Promise<SubscriptionDashboardDto>;
  getTenants(search?: string, page?: number, pageSize?: number): Promise<TenantListResponseDto>;
  getGroupedFeatures(): Promise<FeatureModuleDto[]>;
}
