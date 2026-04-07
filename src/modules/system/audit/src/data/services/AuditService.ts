/**
 * Audit Service
 *
 * Handles all HTTP API calls for the Audit module.
 * Returns raw DTOs — Repository maps to domain entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IAuditService } from "../../domain/interfaces/IAuditService";
import type {
  AuditLogPage,
  AuditLogDetail,
  AuditFilterParams,
  AuditAnalyticsSummary,
  TopAuditUser,
  ComplianceReport,
} from "../../domain/entities/AuditEntities";

export class AuditService implements IAuditService {
  constructor(private readonly api: IApiService) {}

  async getLogs(params?: AuditFilterParams): Promise<AuditLogPage> {
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

  async getLogDetail(id: string): Promise<AuditLogDetail> {
    return this.api.get<AuditLogDetail>(API_ENDPOINTS.AUDIT.LOG_DETAIL(id));
  }

  async getAnalytics(): Promise<AuditAnalyticsSummary> {
    return this.api.get<AuditAnalyticsSummary>(API_ENDPOINTS.AUDIT.ANALYTICS);
  }

  async getTopUsers(): Promise<TopAuditUser[]> {
    return this.api.get<TopAuditUser[]>(API_ENDPOINTS.AUDIT.TOP_USERS);
  }

  async getComplianceReport(framework: string): Promise<ComplianceReport> {
    const url = buildUrl(API_ENDPOINTS.AUDIT.COMPLIANCE_REPORT, { framework });
    return this.api.get<ComplianceReport>(url);
  }

  async exportLogs(format: string, params?: AuditFilterParams): Promise<Blob> {
    const url = buildUrl(API_ENDPOINTS.AUDIT.EXPORT, {
      format,
      ...params,
    });
    return this.api.get<Blob>(url);
  }
}
