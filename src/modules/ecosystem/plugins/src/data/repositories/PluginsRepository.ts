import type { IPluginsRepository } from "../../domain/interfaces/IPluginsRepository";
import type { IPluginsService } from "../../domain/interfaces/IPluginsService";
import { PluginsMapper } from "../mappers/PluginsMapper";
import { PluginsEntity } from "../../domain/entities/PluginsEntity";

export class PluginsRepository implements IPluginsRepository {
  constructor(private readonly service: IPluginsService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: PluginsEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => PluginsMapper.toEntity(item as Parameters<typeof PluginsMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<PluginsEntity> {
    const result = await this.service.getById(id);
    return PluginsMapper.toEntity(result as Parameters<typeof PluginsMapper.toEntity>[0]);
  }
}
