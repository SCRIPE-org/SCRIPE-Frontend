import type { PluginsEntity } from "../entities/PluginsEntity";

export interface IPluginsRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: PluginsEntity[]; totalCount: number }>;
  getById(id: string): Promise<PluginsEntity>;
}
