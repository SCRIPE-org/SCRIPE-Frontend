import type { ReportsEntity } from "../entities/ReportsEntity";

export interface IReportsRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: ReportsEntity[]; totalCount: number }>;
  getById(id: string): Promise<ReportsEntity>;
  execute(data: Record<string, unknown>): Promise<unknown>;
  exportReport(data: Record<string, unknown>): Promise<Blob>;
}
