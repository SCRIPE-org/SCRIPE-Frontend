import type { PluginCatalogItemModel, InstallPluginRequest } from "../../data/models/CatalogModels";

export interface ICatalogService {
  getCatalog(tenantId: string): Promise<PluginCatalogItemModel[]>;
  install(request: InstallPluginRequest): Promise<string>;
}
