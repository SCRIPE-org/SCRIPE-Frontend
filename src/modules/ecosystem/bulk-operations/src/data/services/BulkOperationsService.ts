import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IBulkOperationsService } from "../../domain/interfaces/IBulkOperationsService";

export class BulkOperationsService implements IBulkOperationsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.BULK_OPERATIONS.LIST, params as Record<string, string>);
    return this.api.get(url);
  }
}
