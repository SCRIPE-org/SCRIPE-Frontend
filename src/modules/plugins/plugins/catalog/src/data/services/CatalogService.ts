import type { IApiService } from "@core/interfaces/api.interface";
import type { ICatalogService } from "../../domain/interfaces/ICatalogService";
import type { PluginCatalogItemModel, InstallPluginRequest } from "../models/CatalogModels";
import { CATALOG_ENDPOINTS } from "./catalog.endpoints";

/**
 * Http API network service for catalog.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class CatalogService implements ICatalogService {
  constructor(private readonly api: IApiService) {}

  getCatalog(tenantId: string): Promise<PluginCatalogItemModel[]> {
    return this.api.get<PluginCatalogItemModel[]>(
      `${CATALOG_ENDPOINTS.CATALOG}?tenantId=${tenantId}`
    );
  }

  install(request: InstallPluginRequest): Promise<string> {
    return this.api.post<string>(CATALOG_ENDPOINTS.INSTALL, request);
  }
}
