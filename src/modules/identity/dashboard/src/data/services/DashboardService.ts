/**
 * Dashboard Service
 *
 * Handles API calls for Dashboard overview data ONLY.
 * Audit, security, and analytics calls moved to their own services.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
  DashboardSummary,
  LoginActivityPoint,
  RecentChange,
  EventTypeCount,
} from "../../domain/entities/DashboardEntities";

export class DashboardService {
  constructor(private readonly api: IApiService) {}

  async getSummary(): Promise<DashboardSummary> {
    return this.api.get<DashboardSummary>(API_ENDPOINTS.DASHBOARD.SUMMARY);
  }

  async getLoginActivity(days: number = 30): Promise<LoginActivityPoint[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.LOGIN_ACTIVITY, { days });
    return this.api.get<LoginActivityPoint[]>(url);
  }

  async getRecentChanges(limit: number = 10): Promise<RecentChange[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.RECENT_CHANGES, { limit });
    return this.api.get<RecentChange[]>(url);
  }

  async getEventDistribution(days: number = 30): Promise<EventTypeCount[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.EVENT_DISTRIBUTION, { days });
    return this.api.get<EventTypeCount[]>(url);
  }
}
