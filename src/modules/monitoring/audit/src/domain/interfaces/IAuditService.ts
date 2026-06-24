/**
 * Audit Service Interface
 *
 * Contract for HTTP API calls to the Audit endpoints.
 * Implemented by AuditService in the data layer.
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
 * Http API network service for i audit.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IAuditService {
  getLogs(params?: AuditFilterParams): Promise<AuditLogPage>;
  getLogDetail(id: string): Promise<AuditLogDetail>;
  getAnalytics(): Promise<AuditAnalyticsSummary>;
  getTopUsers(): Promise<TopAuditUser[]>;
  getComplianceReport(framework: string): Promise<ComplianceReport>;
  exportLogs(format: string, params?: AuditFilterParams): Promise<Blob>;
}
