import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IPluginsService } from "../../domain/interfaces/IPluginsService";

export class PluginsService implements IPluginsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.PLUGINS.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async getById(id: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.PLUGINS.BY_ID(id));
  }

  async install(manifestJson: string, tenantId?: string): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.PLUGINS.INSTALL, { manifestJson, tenantId });
  }

  async enable(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.PLUGINS.ENABLE(id), {});
  }

  async disable(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.PLUGINS.DISABLE(id), {});
  }

  async getConfig(id: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.PLUGINS.CONFIG_GET(id));
  }

  async updateConfig(id: string, config: Record<string, string>): Promise<void> {
    await this.api.put(API_ENDPOINTS.PLUGINS.CONFIG_UPDATE(id), config);
  }

  async uninstall(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.PLUGINS.UNINSTALL(id));
  }
}
