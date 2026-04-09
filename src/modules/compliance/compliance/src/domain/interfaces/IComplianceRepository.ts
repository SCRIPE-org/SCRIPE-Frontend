import type { ComplianceEntity } from "../entities/ComplianceEntity";

export interface IComplianceRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: ComplianceEntity[]; totalCount: number }>;
  getById(id: string): Promise<ComplianceEntity>;
}
