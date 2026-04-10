import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IComplianceService } from "../../domain/interfaces/IComplianceService";

export class ComplianceService implements IComplianceService {
  constructor(private readonly api: IApiService) {}

  // ── Retention Policies ──────────────────────────────────────────
  async getRetentionPolicies(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.RETENTION.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async upsertRetentionPolicy(data: Record<string, unknown>): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.COMPLIANCE.RETENTION.UPSERT, data);
  }

  async deleteRetentionPolicy(id: string): Promise<unknown> {
    return this.api.delete(API_ENDPOINTS.COMPLIANCE.RETENTION.DELETE(id));
  }

  // ── Data Subject Requests ───────────────────────────────────────
  async getDsrList(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.DSR.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async getDsrById(id: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.COMPLIANCE.DSR.BY_ID(id));
  }

  async createDsr(data: Record<string, unknown>): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.COMPLIANCE.DSR.CREATE, data);
  }

  async reviewDsr(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.api.put(API_ENDPOINTS.COMPLIANCE.DSR.REVIEW(id), data);
  }

  // ── Consent Management ──────────────────────────────────────────
  async getConsentLog(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.CONSENT.LOG, params as Record<string, string>);
    return this.api.get(url);
  }

  async getConsentStatus(userId: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.COMPLIANCE.CONSENT.STATUS(userId));
  }

  // ── Data Processing Agreements ──────────────────────────────────
  async getDpaList(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.DPA.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async getDpaById(id: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.COMPLIANCE.DPA.BY_ID(id));
  }

  async acceptDpa(id: string): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.COMPLIANCE.DPA.ACCEPT(id), {});
  }

  // ── Evidence & Compliance Packages ──────────────────────────────
  async getEvidenceFrameworks(): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.COMPLIANCE.EVIDENCE.FRAMEWORKS);
  }

  async generateEvidence(data: Record<string, unknown>): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.COMPLIANCE.EVIDENCE.GENERATE, data);
  }

  // ── Encryption Status ───────────────────────────────────────────
  async getEncryptionStatus(): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.COMPLIANCE.ENCRYPTION.STATUS);
  }
}
