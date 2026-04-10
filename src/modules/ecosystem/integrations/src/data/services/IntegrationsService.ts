import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IIntegrationsService } from "../../domain/interfaces/IIntegrationsService";

export class IntegrationsService implements IIntegrationsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.INTEGRATIONS.CONNECTORS, params as Record<string, string>);
    return this.api.get(url);
  }

  async getById(id: string): Promise<unknown> {
    return this.api.get(`${API_ENDPOINTS.INTEGRATIONS.CONNECTORS}/${id}`);
  }

  async toggle(type: string, enabled: boolean): Promise<void> {
    await this.api.put(`${API_ENDPOINTS.INTEGRATIONS.CONNECTORS}/${type}`, { enabled });
  }

  async testConnection(type: string): Promise<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(API_ENDPOINTS.INTEGRATIONS.TEST(type), {});
  }
}
