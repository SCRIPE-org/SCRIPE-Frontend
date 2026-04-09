import type { TemplatesEntity } from "../entities/TemplatesEntity";

export interface ITemplatesRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: TemplatesEntity[]; totalCount: number }>;
  getById(id: string): Promise<TemplatesEntity>;
}
