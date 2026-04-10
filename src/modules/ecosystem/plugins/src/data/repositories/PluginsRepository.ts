import type { IPluginsRepository } from "../../domain/interfaces/IPluginsRepository";
import type { IPluginsService } from "../../domain/interfaces/IPluginsService";
import { PluginsMapper } from "../mappers/PluginsMapper";
import { PluginsEntity } from "../../domain/entities/PluginsEntity";

export class PluginsRepository implements IPluginsRepository {
  constructor(private readonly service: IPluginsService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: PluginsEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as any;
    // Backend returns an array directly (not paginated wrapper) for plugins
    const rawItems = Array.isArray(result) ? result : (result.items || []);
    const items = rawItems.map((item: unknown) => PluginsMapper.toEntity(item as Parameters<typeof PluginsMapper.toEntity>[0]));
    return { items, totalCount: Array.isArray(result) ? items.length : (result.totalCount ?? items.length) };
  }

  async getById(id: string): Promise<PluginsEntity> {
    const result = await this.service.getById(id);
    return PluginsMapper.toEntity(result as Parameters<typeof PluginsMapper.toEntity>[0]);
  }

  async install(manifestJson: string, tenantId?: string): Promise<PluginsEntity> {
    const result = await this.service.install(manifestJson, tenantId);
    return PluginsMapper.toEntity(result as Parameters<typeof PluginsMapper.toEntity>[0]);
  }

  async enable(id: string): Promise<void> {
    await this.service.enable(id);
  }

  async disable(id: string): Promise<void> {
    await this.service.disable(id);
  }

  async uninstall(id: string): Promise<void> {
    await this.service.uninstall(id);
  }
}
