/**
 * Audit Service
 *
 * Handles all HTTP API calls for the Audit module.
 * Returns raw DTOs — Repository maps to domain entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IAuditService } from "../../domain/interfaces/IAuditService";
import { AUDIT_ENDPOINTS } from "./audit.endpoints";
import type {
  AuditLogPage,
  AuditLogDetail,
  AuditFilterParams,
  AuditAnalyticsSummary,
  TopAuditUser,
  ComplianceReport,
  HubActivitySummary,
} from "../../domain/entities/AuditEntities";

/**
 * Http API network service for audit.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class AuditService implements IAuditService {
  constructor(private readonly api: IApiService) {}

  async getLogs(params?: AuditFilterParams): Promise<AuditLogPage> {
    const url = buildUrl(AUDIT_ENDPOINTS.LOGS, {
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

  async getLogDetail(id: string): Promise<AuditLogDetail> {
    return this.api.get<AuditLogDetail>(AUDIT_ENDPOINTS.LOG_DETAIL(id));
  }

  async getHubSummary(): Promise<HubActivitySummary> {
    return this.api.get<HubActivitySummary>(AUDIT_ENDPOINTS.HUB_SUMMARY);
  }

  async getAnalytics(): Promise<AuditAnalyticsSummary> {
    return this.api.get<AuditAnalyticsSummary>(AUDIT_ENDPOINTS.ANALYTICS);
  }

  async getTopUsers(): Promise<TopAuditUser[]> {
    return this.api.get<TopAuditUser[]>(AUDIT_ENDPOINTS.TOP_USERS);
  }

  async getComplianceReport(framework: string): Promise<ComplianceReport> {
    const url = buildUrl(AUDIT_ENDPOINTS.COMPLIANCE_REPORT, { framework });
    return this.api.get<ComplianceReport>(url);
  }

  async exportLogs(format: string, params?: AuditFilterParams): Promise<Blob> {
    const url = buildUrl(AUDIT_ENDPOINTS.EXPORT, {
      format,
      ...params,
    });
    return this.api.get<Blob>(url);
  }
}
