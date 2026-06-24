import type { PluginCatalogItemModel } from "../../data/models/CatalogModels";
import type { InstallPluginRequest } from "./ICatalogRepository";

/**
 * Interface defining operations for the Catalog network service.
 */
export interface ICatalogService {
  getCatalog(tenantId: string): Promise<PluginCatalogItemModel[]>;
  install(request: InstallPluginRequest): Promise<string>;
}
