/**
 * Dashboard Service
 *
 * Handles all API calls for Dashboard and Audit modules.
 * Returns raw JSON responses — Repository maps to domain entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      DashboardSummary,
      LoginActivityPoint,
      RecentChange,
      SecurityEventSummary,
      BlockedIPSummary,
      EventTypeCount,
      AuditLogDetail,
      AuditLogPage,
} from "../../domain/entities/DashboardEntities";
import type { AuditLogFilterParams } from "../../domain/interfaces/IDashboardRepository";

export class DashboardService {
      constructor(private readonly api: IApiService) { }

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

      async getSecurityEvents(days: number = 7): Promise<SecurityEventSummary[]> {
            const url = buildUrl(API_ENDPOINTS.DASHBOARD.SECURITY_EVENTS, { days });
            return this.api.get<SecurityEventSummary[]>(url);
      }

      async getTopBlockedIPs(days: number = 30, limit: number = 10): Promise<BlockedIPSummary[]> {
            const url = buildUrl(API_ENDPOINTS.DASHBOARD.TOP_BLOCKED_IPS, { days, limit });
            return this.api.get<BlockedIPSummary[]>(url);
      }

      async getAuditLogs(params?: AuditLogFilterParams): Promise<AuditLogPage> {
            const url = buildUrl(API_ENDPOINTS.AUDIT.LOGS, {
                  page: params?.page,
                  pageSize: params?.pageSize,
                  eventType: params?.eventType,
                  username: params?.username,
                  entityType: params?.entityType,
                  search: params?.search,
                  correlationId: params?.correlationId,
                  dateFrom: params?.dateFrom,
                  dateTo: params?.dateTo,
                  isSuccess: params?.isSuccess,
            });
            return this.api.get<AuditLogPage>(url);
      }

      async getAuditLogDetail(id: string): Promise<AuditLogDetail> {
            return this.api.get<AuditLogDetail>(API_ENDPOINTS.AUDIT.LOG_DETAIL(id));
      }
}
