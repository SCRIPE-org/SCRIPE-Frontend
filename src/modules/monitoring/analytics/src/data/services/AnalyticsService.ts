/**
 * Analytics Service
 *
 * Handles all HTTP API calls for analytics-related data.
 * Uses the Dashboard controller endpoints since analytics is a view over dashboard data.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IAnalyticsService } from "../../domain/interfaces/IAnalyticsService";
import type {
  AnalyticsSummary,
  DistributionData,
  ComparisonDataPoint,
} from "../../domain/entities/AnalyticsEntities";

/**
 * API service for executing HTTP calls related to Analytics endpoints.
 */
export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly api: IApiService) {}

  async getSummary(): Promise<AnalyticsSummary> {
    return this.api.get<AnalyticsSummary>(API_ENDPOINTS.DASHBOARD.SUMMARY);
  }

  async getEventDistribution(days: number = 30): Promise<DistributionData[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.EVENT_DISTRIBUTION, { days });
    return this.api.get<DistributionData[]>(url);
  }

  async getLoginActivity(days: number = 30): Promise<ComparisonDataPoint[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.LOGIN_ACTIVITY, { days });
    return this.api.get<ComparisonDataPoint[]>(url);
  }
}
