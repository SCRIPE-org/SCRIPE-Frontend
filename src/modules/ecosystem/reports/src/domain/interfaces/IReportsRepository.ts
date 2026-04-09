import type { ReportsEntity } from "../entities/ReportsEntity";

export interface IReportsRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: ReportsEntity[]; totalCount: number }>;
  getById(id: string): Promise<ReportsEntity>;
}
