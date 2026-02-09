/**
 * Dashboard Repository
 *
 * Concrete implementation of IDashboardRepository.
 * Delegates to DashboardService — errors propagate as exceptions.
 */
import type { IDashboardRepository, AuditLogFilterParams } from "../../domain/interfaces/IDashboardRepository";
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
import type { DashboardService } from "../services/DashboardService";

export class DashboardRepository implements IDashboardRepository {
      constructor(private readonly service: DashboardService) { }

      getSummary(): Promise<DashboardSummary> {
            return this.service.getSummary();
      }

      getLoginActivity(days?: number): Promise<LoginActivityPoint[]> {
            return this.service.getLoginActivity(days);
      }

      getRecentChanges(limit?: number): Promise<RecentChange[]> {
            return this.service.getRecentChanges(limit);
      }

      getEventDistribution(days?: number): Promise<EventTypeCount[]> {
            return this.service.getEventDistribution(days);
      }

      getSecurityEvents(days?: number): Promise<SecurityEventSummary[]> {
            return this.service.getSecurityEvents(days);
      }

      getTopBlockedIPs(days?: number, limit?: number): Promise<BlockedIPSummary[]> {
            return this.service.getTopBlockedIPs(days, limit);
      }

      getAuditLogs(params?: AuditLogFilterParams): Promise<AuditLogPage> {
            return this.service.getAuditLogs(params);
      }

      getAuditLogDetail(id: string): Promise<AuditLogDetail> {
            return this.service.getAuditLogDetail(id);
      }
}
