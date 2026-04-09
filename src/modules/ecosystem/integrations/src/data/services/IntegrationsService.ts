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
    return this.api.get(API_ENDPOINTS.INTEGRATIONS.CONNECTORS);
  }
}
