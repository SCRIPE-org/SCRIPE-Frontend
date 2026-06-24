import type { PluginCatalogItemModel } from "../../data/models/CatalogModels";
import type { InstallPluginRequest } from "./ICatalogRepository";

/**
 * Http API network service for i catalog.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ICatalogService {
  getCatalog(tenantId: string): Promise<PluginCatalogItemModel[]>;
  install(request: InstallPluginRequest): Promise<string>;
}
