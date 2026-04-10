import type { TemplatesEntity } from "../entities/TemplatesEntity";

export interface ITemplatesRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: TemplatesEntity[]; totalCount: number }>;
  getById(id: string): Promise<TemplatesEntity>;
  create(data: Record<string, unknown>): Promise<unknown>;
  update(id: string, data: Record<string, unknown>): Promise<unknown>;
  delete(id: string): Promise<void>;
  apply(id: string): Promise<void>;
}
