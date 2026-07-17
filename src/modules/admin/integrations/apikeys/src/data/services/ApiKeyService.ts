import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiKeyService } from "../../domain/interfaces/IApiKeyService";
import type { ApiKeyDto } from "../models/ApiKeyDto";
import type { CreateApiKeyRequest, CreateApiKeyResult } from "../../domain/entities/ApiKey";
import { API_KEYS_ENDPOINTS } from "./apikeys.endpoints";

export class ApiKeyService implements IApiKeyService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: ApiKeyDto[]; totalCount: number }> {
    const url = buildUrl(
      API_KEYS_ENDPOINTS.LIST,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get(url);
  }

  async create(request: CreateApiKeyRequest): Promise<CreateApiKeyResult> {
    return this.api.post(API_KEYS_ENDPOINTS.CREATE, request);
  }

  async revoke(id: string): Promise<void> {
    await this.api.delete(API_KEYS_ENDPOINTS.REVOKE(id));
  }
}
