import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IApiKeyService } from "../../domain/interfaces/IApiKeyService";
import type { ApiKeyDto } from "../models/ApiKeyDto";
import type { CreateApiKeyRequest, CreateApiKeyResult } from "../../domain/entities/ApiKey";

export class ApiKeyService implements IApiKeyService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: ApiKeyDto[]; totalCount: number }> {
    const url = buildUrl(
      API_ENDPOINTS.API_KEYS.LIST,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get(url);
  }

  async create(request: CreateApiKeyRequest): Promise<CreateApiKeyResult> {
    return this.api.post(API_ENDPOINTS.API_KEYS.CREATE, request);
  }

  async revoke(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.API_KEYS.REVOKE(id));
  }
}
