/**
 * Dashboard Service
 *
 * Handles API calls for Dashboard overview data ONLY.
 * Audit, security, and analytics calls moved to their own services.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { DASHBOARD_ENDPOINTS } from "./dashboard.endpoints";
import type {
  DashboardSummary,
  LoginActivityPoint,
  RecentChange,
  EventTypeCount,
} from "../../domain/entities/DashboardEntities";

/**
 * Http API network service for dashboard.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class DashboardService {
  constructor(private readonly api: IApiService) {}

  async getSummary(): Promise<DashboardSummary> {
    return this.api.get<DashboardSummary>(DASHBOARD_ENDPOINTS.SUMMARY);
  }

  async getLoginActivity(days: number = 30): Promise<LoginActivityPoint[]> {
    const url = buildUrl(DASHBOARD_ENDPOINTS.LOGIN_ACTIVITY, { days });
    return this.api.get<LoginActivityPoint[]>(url);
  }

  async getRecentChanges(limit: number = 10): Promise<RecentChange[]> {
    const url = buildUrl(DASHBOARD_ENDPOINTS.RECENT_CHANGES, { limit });
    return this.api.get<RecentChange[]>(url);
  }

  async getEventDistribution(days: number = 30): Promise<EventTypeCount[]> {
    const url = buildUrl(DASHBOARD_ENDPOINTS.EVENT_DISTRIBUTION, { days });
    return this.api.get<EventTypeCount[]>(url);
  }
}
