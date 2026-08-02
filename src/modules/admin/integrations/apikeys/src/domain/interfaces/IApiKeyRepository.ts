import type { ApiKey, CreateApiKeyRequest, CreateApiKeyResult } from "../entities/ApiKey";

export interface IApiKeyRepository {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: ApiKey[]; totalCount: number }>;

  create(request: CreateApiKeyRequest): Promise<CreateApiKeyResult>;

  revoke(id: string): Promise<void>;
}
