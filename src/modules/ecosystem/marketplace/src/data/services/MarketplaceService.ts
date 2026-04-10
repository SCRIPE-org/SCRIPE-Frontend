import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IMarketplaceService } from "../../domain/interfaces/IMarketplaceService";

export class MarketplaceService implements IMarketplaceService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.MARKETPLACE.CATALOG, params as Record<string, string>);
    return this.api.get(url);
  }

  async install(pluginId: string): Promise<void> {
    await this.api.post(`${API_ENDPOINTS.MARKETPLACE.CATALOG}/${pluginId}/install`, {});
  }
}
