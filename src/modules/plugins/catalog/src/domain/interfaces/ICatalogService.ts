import type { PluginCatalogItemModel } from "../../data/models/CatalogModels";
import type { InstallPluginRequest } from "./ICatalogRepository";

export interface ICatalogService {
  getCatalog(tenantId: string): Promise<PluginCatalogItemModel[]>;
  install(request: InstallPluginRequest): Promise<string>;
}
