export interface IComplianceService {
  // Retention Policies
  getRetentionPolicies(params?: Record<string, unknown>): Promise<unknown>;
  upsertRetentionPolicy(data: Record<string, unknown>): Promise<unknown>;
  deleteRetentionPolicy(id: string): Promise<unknown>;

  // Data Subject Requests (DSR)
  getDsrList(params?: Record<string, unknown>): Promise<unknown>;
  getDsrById(id: string): Promise<unknown>;
  createDsr(data: Record<string, unknown>): Promise<unknown>;
  reviewDsr(id: string, data: Record<string, unknown>): Promise<unknown>;

  // Consent Management
  getConsentLog(params?: Record<string, unknown>): Promise<unknown>;
  getConsentStatus(userId: string): Promise<unknown>;

  // Data Processing Agreements (DPA)
  getDpaList(params?: Record<string, unknown>): Promise<unknown>;
  getDpaById(id: string): Promise<unknown>;
  acceptDpa(id: string): Promise<unknown>;

  // Evidence & Compliance Packages
  getEvidenceFrameworks(): Promise<unknown>;
  generateEvidence(data: Record<string, unknown>): Promise<unknown>;

  // Encryption Status
  getEncryptionStatus(): Promise<unknown>;
}
