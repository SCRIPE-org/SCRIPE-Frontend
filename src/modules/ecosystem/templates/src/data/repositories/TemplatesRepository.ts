import type { ITemplatesRepository } from "../../domain/interfaces/ITemplatesRepository";
import type { ITemplatesService } from "../../domain/interfaces/ITemplatesService";
import { TemplatesMapper } from "../mappers/TemplatesMapper";
import { TemplatesEntity } from "../../domain/entities/TemplatesEntity";

export class TemplatesRepository implements ITemplatesRepository {
  constructor(private readonly service: ITemplatesService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: TemplatesEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => TemplatesMapper.toEntity(item as Parameters<typeof TemplatesMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<TemplatesEntity> {
    const result = await this.service.getById(id);
    return TemplatesMapper.toEntity(result as Parameters<typeof TemplatesMapper.toEntity>[0]);
  }

  async create(data: Record<string, unknown>): Promise<unknown> {
    return this.service.create(data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.service.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async apply(id: string): Promise<void> {
    await this.service.apply(id);
  }
}
