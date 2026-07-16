import type { ApiKeyDto } from "../../data/models/ApiKeyDto";
import type { CreateApiKeyRequest, CreateApiKeyResult } from "../entities/ApiKey";

export interface IApiKeyService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: ApiKeyDto[]; totalCount: number }>;

  create(request: CreateApiKeyRequest): Promise<CreateApiKeyResult>;

  revoke(id: string): Promise<void>;
}
