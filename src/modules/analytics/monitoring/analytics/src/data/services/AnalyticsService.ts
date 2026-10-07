/**
 * Analytics Service
 *
 * Handles all HTTP API calls for analytics-related data.
 * Pure HTTP transport layer returning DTOs.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IAnalyticsService } from "../../domain/interfaces/IAnalyticsService";
import { ANALYTICS_ENDPOINTS } from "./analytics.endpoints";
import type {
  AnalyticsSummaryDto,
  DistributionDataDto,
  ComparisonDataPointDto,
  SubscriptionDashboardDto,
  TenantListResponseDto,
  FeatureModuleDto,
} from "../models/AnalyticsModels";

/**
 * Http API network service for analytics.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly api: IApiService) {}

  async getSummary(): Promise<AnalyticsSummaryDto> {
    return this.api.get<AnalyticsSummaryDto>(ANALYTICS_ENDPOINTS.SUMMARY);
  }

  async getEventDistribution(days: number = 30): Promise<DistributionDataDto[]> {
    const url = buildUrl(ANALYTICS_ENDPOINTS.EVENT_DISTRIBUTION, { days });
    return this.api.get<DistributionDataDto[]>(url);
  }

  async getLoginActivity(days: number = 30): Promise<ComparisonDataPointDto[]> {
    const url = buildUrl(ANALYTICS_ENDPOINTS.LOGIN_ACTIVITY, { days });
    return this.api.get<ComparisonDataPointDto[]>(url);
  }

  async getSubscriptions(): Promise<SubscriptionDashboardDto> {
    return this.api.get<SubscriptionDashboardDto>(ANALYTICS_ENDPOINTS.SUBSCRIPTIONS);
  }

  async getTenants(
    search?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<TenantListResponseDto> {
    const params: Record<string, any> = { page, pageSize };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const url = buildUrl(ANALYTICS_ENDPOINTS.TENANTS, params);
    return this.api.get<TenantListResponseDto>(url);
  }

  async getGroupedFeatures(): Promise<FeatureModuleDto[]> {
    return this.api.get<FeatureModuleDto[]>(ANALYTICS_ENDPOINTS.FEATURES_GROUPED);
  }
}
