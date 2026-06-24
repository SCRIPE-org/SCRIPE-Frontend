import type { PluginCatalogItem } from "../entities/PluginCatalogItem";

/**
 * Interface structure detailing the properties and attributes of Install Plugin Request.
 */
export interface InstallPluginRequest {
  pluginDefinitionId: string;
  tenantId: string;
  installedByUserId: string;
  settingsJson?: string;
}

/**
 * Interface defining repository methods for managing Catalog data access.
 */
export interface ICatalogRepository {
  getCatalog(tenantId: string): Promise<PluginCatalogItem[]>;
  install(request: InstallPluginRequest): Promise<string>;
}
