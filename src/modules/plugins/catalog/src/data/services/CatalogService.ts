import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { ICatalogService } from "../../domain/interfaces/ICatalogService";
import type { PluginCatalogItemModel, InstallPluginRequest } from "../models/CatalogModels";

/**
 * API service for executing HTTP calls related to Catalog endpoints.
 */
export class CatalogService implements ICatalogService {
  constructor(private readonly api: IApiService) {}

  getCatalog(tenantId: string): Promise<PluginCatalogItemModel[]> {
    return this.api.get<PluginCatalogItemModel[]>(
      `${API_ENDPOINTS.PLUGINS.CATALOG}?tenantId=${tenantId}`
    );
  }

  install(request: InstallPluginRequest): Promise<string> {
    return this.api.post<string>(API_ENDPOINTS.PLUGINS.INSTALL, request);
  }
}
