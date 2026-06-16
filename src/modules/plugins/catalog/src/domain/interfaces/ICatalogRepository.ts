import type { PluginCatalogItem } from "../entities/PluginCatalogItem";

export interface InstallPluginRequest {
  pluginDefinitionId: string;
  tenantId: string;
  installedByUserId: string;
  settingsJson?: string;
}

export interface ICatalogRepository {
  getCatalog(tenantId: string): Promise<PluginCatalogItem[]>;
  install(request: InstallPluginRequest): Promise<string>;
}
