import type { IDeveloperRepository } from "../../domain/interfaces/IDeveloperRepository";
import type { IDeveloperService } from "../../domain/interfaces/IDeveloperService";
import { DeveloperMapper } from "../mappers/DeveloperMapper";
import { DeveloperEntity } from "../../domain/entities/DeveloperEntity";

export class DeveloperRepository implements IDeveloperRepository {
  constructor(private readonly service: IDeveloperService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: DeveloperEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => DeveloperMapper.toEntity(item as Parameters<typeof DeveloperMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }
}
