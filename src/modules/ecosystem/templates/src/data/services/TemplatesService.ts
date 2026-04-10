import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ITemplatesService } from "../../domain/interfaces/ITemplatesService";

export class TemplatesService implements ITemplatesService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.TEMPLATES.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async getById(id: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.TEMPLATES.BY_ID(id));
  }

  async create(data: Record<string, unknown>): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.TEMPLATES.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.api.put(API_ENDPOINTS.TEMPLATES.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.TEMPLATES.DELETE(id));
  }

  async apply(id: string): Promise<void> {
    await this.api.post(`${API_ENDPOINTS.TEMPLATES.BY_ID(id)}/apply`, {});
  }
}
