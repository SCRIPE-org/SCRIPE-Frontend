"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
  DsrData,
  ComplianceDashboardData,
  ConsentStatusData,
  RetentionPolicyData,
} from "../../domain/entities/ComplianceEntities";
import { IComplianceService } from "../../domain/interfaces/IComplianceService";

export interface DsrListResult {
  items: DsrData[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface RecordConsentPayload {
  purposeId: string;
  action: "Granted" | "Withdrawn";
  consentVersion: string;
  collectionMethod?: string;
}

export interface SubmitDsrPayload {
  requestType: string;
  regulationCode: string;
  requesterNotes?: string;
}

export interface ReviewDsrPayload {
  isApproved: boolean;
  resolution?: string;
}

export interface DsrListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  requestType?: string;
  search?: string;
}

export class ComplianceService implements IComplianceService {
  constructor(private readonly api: IApiService) { }

  async getDashboard(): Promise<ComplianceDashboardData> {
    return this.api.get<ComplianceDashboardData>(API_ENDPOINTS.COMPLIANCE.DASHBOARD);
  }

  async getRegulations(): Promise<unknown[]> {
    return this.api.get<unknown[]>(API_ENDPOINTS.COMPLIANCE.REGULATIONS);
  }

  async getMyConsent(): Promise<ConsentStatusData[]> {
    return this.api.get<ConsentStatusData[]>(API_ENDPOINTS.COMPLIANCE.MY_CONSENT);
  }

  async recordConsent(payload: RecordConsentPayload): Promise<void> {
    return this.api.post<void>(API_ENDPOINTS.COMPLIANCE.RECORD_CONSENT, payload);
  }

  async getDsrList(params: DsrListParams = {}): Promise<DsrListResult> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.DSR_LIST, {
      page: params.page ?? 1,
      pageSize: Math.min(params.pageSize ?? 20, 100),
      status: params.status,
      requestType: params.requestType,
      search: params.search,
    });
    return this.api.get<DsrListResult>(url);
  }

  async getDsrById(id: string): Promise<DsrData> {
    return this.api.get<DsrData>(API_ENDPOINTS.COMPLIANCE.DSR_BY_ID(id));
  }

  async submitDsr(
    payload: SubmitDsrPayload,
    subjectId: string,
    subjectEmail: string,
    subjectType = "Admin",
  ): Promise<{ id: string }> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.DSR_SUBMIT, { subjectId, subjectEmail, subjectType });
    return this.api.post<{ id: string }>(url, payload);
  }

  async reviewDsr(id: string, payload: ReviewDsrPayload): Promise<void> {
    return this.api.put<void>(API_ENDPOINTS.COMPLIANCE.DSR_REVIEW(id), payload);
  }

  async confirmErasure(id: string): Promise<void> {
    return this.api.post<void>(API_ENDPOINTS.COMPLIANCE.DSR_CONFIRM_ERASURE(id), {});
  }

  async cancelDsr(id: string, reason?: string): Promise<void> {
    return this.api.post<void>(API_ENDPOINTS.COMPLIANCE.DSR_CANCEL(id), reason ?? "");
  }

  async getRetentionPolicies(): Promise<RetentionPolicyData[]> {
    return this.api.get<RetentionPolicyData[]>(API_ENDPOINTS.COMPLIANCE.RETENTION_LIST);
  }

  async updateRetentionPolicy(payload: {
    policyId: string;
    retentionDays: number;
    expiryAction: string;
    isActive: boolean;
  }): Promise<void> {
    return this.api.put<void>(API_ENDPOINTS.COMPLIANCE.RETENTION_UPDATE, payload);
  }

  async generateReport(payload: {
    reportType: string;
    regulationCode?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<void> {
    return this.api.post<void>(API_ENDPOINTS.COMPLIANCE.GENERATE_REPORT, payload);
  }
}
