import type { BulkOperationsEntity } from "../entities/BulkOperationsEntity";

export interface IBulkOperationsRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: BulkOperationsEntity[]; totalCount: number }>;
  importData(file: File): Promise<unknown>;
  exportData(params: Record<string, unknown>): Promise<Blob>;
  cancel(operationId: string): Promise<void>;
}
