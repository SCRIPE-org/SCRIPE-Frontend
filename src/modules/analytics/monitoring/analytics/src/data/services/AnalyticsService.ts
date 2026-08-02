/**
 * Analytics Service
 *
 * Handles all HTTP API calls for analytics-related data.
 * Uses the Dashboard controller endpoints since analytics is a view over dashboard data.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IAnalyticsService } from "../../domain/interfaces/IAnalyticsService";
import { ANALYTICS_ENDPOINTS } from "./analytics.endpoints";
import type {
  AnalyticsSummary,
  DistributionData,
  ComparisonDataPoint,
} from "../../domain/entities/AnalyticsEntities";

/**
 * Http API network service for analytics.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly api: IApiService) {}

  async getSummary(): Promise<AnalyticsSummary> {
    return this.api.get<AnalyticsSummary>(ANALYTICS_ENDPOINTS.SUMMARY);
  }

  async getEventDistribution(days: number = 30): Promise<DistributionData[]> {
    const url = buildUrl(ANALYTICS_ENDPOINTS.EVENT_DISTRIBUTION, { days });
    return this.api.get<DistributionData[]>(url);
  }

  async getLoginActivity(days: number = 30): Promise<ComparisonDataPoint[]> {
    const url = buildUrl(ANALYTICS_ENDPOINTS.LOGIN_ACTIVITY, { days });
    return this.api.get<ComparisonDataPoint[]>(url);
  }
}
