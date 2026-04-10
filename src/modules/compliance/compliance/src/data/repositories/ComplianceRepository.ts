import type { IComplianceRepository } from "../../domain/interfaces/IComplianceRepository";
import type { IComplianceService } from "../../domain/interfaces/IComplianceService";

export class ComplianceRepository implements IComplianceRepository {
  constructor(private readonly service: IComplianceService) {}

  // ── Retention Policies ──────────────────────────────────────────
  async getRetentionPolicies(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }> {
    const result = await this.service.getRetentionPolicies(params) as { items?: unknown[]; totalCount?: number };
    const items = result.items ?? [];
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async upsertRetentionPolicy(data: Record<string, unknown>): Promise<unknown> {
    return this.service.upsertRetentionPolicy(data);
  }

  async deleteRetentionPolicy(id: string): Promise<unknown> {
    return this.service.deleteRetentionPolicy(id);
  }

  // ── Data Subject Requests ───────────────────────────────────────
  async getDsrList(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }> {
    const result = await this.service.getDsrList(params) as { items?: unknown[]; totalCount?: number };
    const items = result.items ?? [];
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getDsrById(id: string): Promise<unknown> {
    return this.service.getDsrById(id);
  }

  async createDsr(data: Record<string, unknown>): Promise<unknown> {
    return this.service.createDsr(data);
  }

  async reviewDsr(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.service.reviewDsr(id, data);
  }

  // ── Consent Management ──────────────────────────────────────────
  async getConsentLog(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }> {
    const result = await this.service.getConsentLog(params) as { items?: unknown[]; totalCount?: number };
    const items = result.items ?? [];
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getConsentStatus(userId: string): Promise<unknown> {
    return this.service.getConsentStatus(userId);
  }

  // ── DPA ─────────────────────────────────────────────────────────
  async getDpaList(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }> {
    const result = await this.service.getDpaList(params) as { items?: unknown[]; totalCount?: number };
    const items = result.items ?? [];
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getDpaById(id: string): Promise<unknown> {
    return this.service.getDpaById(id);
  }

  async acceptDpa(id: string): Promise<unknown> {
    return this.service.acceptDpa(id);
  }

  // ── Evidence ────────────────────────────────────────────────────
  async getEvidenceFrameworks(): Promise<unknown> {
    return this.service.getEvidenceFrameworks();
  }

  async generateEvidence(data: Record<string, unknown>): Promise<unknown> {
    return this.service.generateEvidence(data);
  }

  // ── Encryption ──────────────────────────────────────────────────
  async getEncryptionStatus(): Promise<unknown> {
    return this.service.getEncryptionStatus();
  }
}
