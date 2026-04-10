import type { PluginsEntity } from "../entities/PluginsEntity";

export interface IPluginsRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: PluginsEntity[]; totalCount: number }>;
  getById(id: string): Promise<PluginsEntity>;
  install(manifestJson: string, tenantId?: string): Promise<PluginsEntity>;
  enable(id: string): Promise<void>;
  disable(id: string): Promise<void>;
  uninstall(id: string): Promise<void>;
}
