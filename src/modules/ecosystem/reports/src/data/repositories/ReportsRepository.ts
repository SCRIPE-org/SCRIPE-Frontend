import type { IReportsRepository } from "../../domain/interfaces/IReportsRepository";
import type { IReportsService } from "../../domain/interfaces/IReportsService";
import { ReportsMapper } from "../mappers/ReportsMapper";
import { ReportsEntity } from "../../domain/entities/ReportsEntity";

export class ReportsRepository implements IReportsRepository {
  constructor(private readonly service: IReportsService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: ReportsEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => ReportsMapper.toEntity(item as Parameters<typeof ReportsMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<ReportsEntity> {
    const result = await this.service.getById(id);
    return ReportsMapper.toEntity(result as Parameters<typeof ReportsMapper.toEntity>[0]);
  }
}
