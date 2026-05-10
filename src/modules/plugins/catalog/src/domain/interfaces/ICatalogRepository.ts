import type { PluginCatalogItem } from "../entities/PluginCatalogItem";
import type { InstallPluginRequest } from "../../data/models/CatalogModels";

export interface ICatalogRepository {
  getCatalog(tenantId: string): Promise<PluginCatalogItem[]>;
  install(request: InstallPluginRequest): Promise<string>;
}
