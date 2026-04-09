import type { BulkOperationsEntity } from "../entities/BulkOperationsEntity";

export interface IBulkOperationsRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: BulkOperationsEntity[]; totalCount: number }>;
}
