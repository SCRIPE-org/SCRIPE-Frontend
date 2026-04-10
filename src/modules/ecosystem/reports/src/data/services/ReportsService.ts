import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IReportsService } from "../../domain/interfaces/IReportsService";

export class ReportsService implements IReportsService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.REPORTS.DATA_SOURCES, params as Record<string, string>);
    return this.api.get(url);
  }

  async getById(id: string): Promise<unknown> {
    return this.api.get(`${API_ENDPOINTS.REPORTS.DATA_SOURCES}/${id}`);
  }

  async execute(data: Record<string, unknown>): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.REPORTS.EXECUTE, data);
  }

  async export(data: Record<string, unknown>): Promise<Blob> {
    return this.api.post(API_ENDPOINTS.REPORTS.EXPORT, data) as Promise<Blob>;
  }

  async getDataSources(): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.REPORTS.DATA_SOURCES);
  }
}
