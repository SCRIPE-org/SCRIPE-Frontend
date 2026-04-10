import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IBulkOperationsService } from "../../domain/interfaces/IBulkOperationsService";

export class BulkOperationsService implements IBulkOperationsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.BULK_OPERATIONS.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async importData(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.post(API_ENDPOINTS.BULK_OPERATIONS.IMPORT, formData);
  }

  async exportData(params: Record<string, unknown>): Promise<Blob> {
    return this.api.post(API_ENDPOINTS.BULK_OPERATIONS.EXPORT, params) as Promise<Blob>;
  }

  async cancel(operationId: string): Promise<void> {
    await this.api.post(`${API_ENDPOINTS.BULK_OPERATIONS.LIST}/${operationId}/cancel`, {});
  }
}
