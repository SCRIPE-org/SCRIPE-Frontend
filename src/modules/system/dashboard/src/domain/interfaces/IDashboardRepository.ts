/**
 * Dashboard Repository Interface
 *
 * Defines the contract for dashboard data operations.
 * Returns data directly — errors propagate as exceptions.
 */
import type {
      DashboardSummary,
      LoginActivityPoint,
      RecentChange,
      SecurityEventSummary,
      BlockedIPSummary,
      EventTypeCount,
      AuditLogDetail,
      AuditLogPage,
} from "../entities/DashboardEntities";

export interface AuditLogFilterParams {
      page?: number;
      pageSize?: number;
      eventType?: string;
      username?: string;
      entityType?: string;
      search?: string;
      correlationId?: string;
      dateFrom?: string;
      dateTo?: string;
      isSuccess?: boolean;
}

export interface IDashboardRepository {
      getSummary(): Promise<DashboardSummary>;
      getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
      getRecentChanges(limit?: number): Promise<RecentChange[]>;
      getEventDistribution(days?: number): Promise<EventTypeCount[]>;
      getSecurityEvents(days?: number): Promise<SecurityEventSummary[]>;
      getTopBlockedIPs(days?: number, limit?: number): Promise<BlockedIPSummary[]>;
      getAuditLogs(params?: AuditLogFilterParams): Promise<AuditLogPage>;
      getAuditLogDetail(id: string): Promise<AuditLogDetail>;
}
