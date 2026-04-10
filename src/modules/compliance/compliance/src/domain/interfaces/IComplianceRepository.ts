export interface IComplianceRepository {
  // Retention Policies
  getRetentionPolicies(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }>;
  upsertRetentionPolicy(data: Record<string, unknown>): Promise<unknown>;
  deleteRetentionPolicy(id: string): Promise<unknown>;

  // Data Subject Requests
  getDsrList(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }>;
  getDsrById(id: string): Promise<unknown>;
  createDsr(data: Record<string, unknown>): Promise<unknown>;
  reviewDsr(id: string, data: Record<string, unknown>): Promise<unknown>;

  // Consent
  getConsentLog(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }>;
  getConsentStatus(userId: string): Promise<unknown>;

  // DPA
  getDpaList(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }>;
  getDpaById(id: string): Promise<unknown>;
  acceptDpa(id: string): Promise<unknown>;

  // Evidence
  getEvidenceFrameworks(): Promise<unknown>;
  generateEvidence(data: Record<string, unknown>): Promise<unknown>;

  // Encryption
  getEncryptionStatus(): Promise<unknown>;
}
