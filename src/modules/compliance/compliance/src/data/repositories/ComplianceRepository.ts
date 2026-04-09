import type { IComplianceRepository } from "../../domain/interfaces/IComplianceRepository";
import type { IComplianceService } from "../../domain/interfaces/IComplianceService";
import { ComplianceMapper } from "../mappers/ComplianceMapper";
import { ComplianceEntity } from "../../domain/entities/ComplianceEntity";

export class ComplianceRepository implements IComplianceRepository {
  constructor(private readonly service: IComplianceService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: ComplianceEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => ComplianceMapper.toEntity(item as Parameters<typeof ComplianceMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<ComplianceEntity> {
    const result = await this.service.getById(id);
    return ComplianceMapper.toEntity(result as Parameters<typeof ComplianceMapper.toEntity>[0]);
  }
}
