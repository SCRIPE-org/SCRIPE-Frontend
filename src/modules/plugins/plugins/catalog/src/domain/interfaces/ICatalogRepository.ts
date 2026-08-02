import type { PluginCatalogItem } from "../entities/PluginCatalogItem";

/**
 * Interface defining property specifications, keys types, and structural contract rules for install plugin request.
 */
export interface InstallPluginRequest {
  pluginDefinitionId: string;
  tenantId: string;
  installedByUserId: string;
  settingsJson?: string;
}

/**
 * Repository layer implementing client request queries for i catalog.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface ICatalogRepository {
  getCatalog(tenantId: string): Promise<PluginCatalogItem[]>;
  install(request: InstallPluginRequest): Promise<string>;
}
