import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IDeveloperService } from "../../domain/interfaces/IDeveloperService";

export class DeveloperService implements IDeveloperService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.DEVELOPER.OVERVIEW, params as Record<string, string>);
    return this.api.get(url);
  }
}
