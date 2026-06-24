/**
 * Audit Repository Interface
 *
 * Contract for the audit data repository.
 * Returns domain entities (not raw DTOs).
 */
import type {
  AuditLogPage,
  AuditLogDetail,
  AuditFilterParams,
  AuditAnalyticsSummary,
  TopAuditUser,
  ComplianceReport,
} from "../entities/AuditEntities";

/**
 * Interface defining repository methods for managing Audit data access.
 */
export interface IAuditRepository {
  getLogs(params?: AuditFilterParams): Promise<AuditLogPage>;
  getLogDetail(id: string): Promise<AuditLogDetail>;
  getAnalytics(): Promise<AuditAnalyticsSummary>;
  getTopUsers(): Promise<TopAuditUser[]>;
  getComplianceReport(framework: string): Promise<ComplianceReport>;
  exportLogs(format: string, params?: AuditFilterParams): Promise<Blob>;
}
