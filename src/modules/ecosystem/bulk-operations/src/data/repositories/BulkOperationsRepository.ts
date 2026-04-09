import type { IBulkOperationsRepository } from "../../domain/interfaces/IBulkOperationsRepository";
import type { IBulkOperationsService } from "../../domain/interfaces/IBulkOperationsService";
import { BulkOperationsMapper } from "../mappers/BulkOperationsMapper";
import { BulkOperationsEntity } from "../../domain/entities/BulkOperationsEntity";

export class BulkOperationsRepository implements IBulkOperationsRepository {
  constructor(private readonly service: IBulkOperationsService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: BulkOperationsEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => BulkOperationsMapper.toEntity(item as Parameters<typeof BulkOperationsMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }
}
