import type { IApiKeyRepository } from "../../domain/interfaces/IApiKeyRepository";
import type { IApiKeyService } from "../../domain/interfaces/IApiKeyService";
import type { CreateApiKeyRequest, CreateApiKeyResult } from "../../domain/entities/ApiKey";
import { ApiKey } from "../../domain/entities/ApiKey";
import { ApiKeyMapper } from "../mappers/ApiKeyMapper";

/**
 * Documentation for module export
 */
export class ApiKeyRepository implements IApiKeyRepository {
  constructor(private readonly service: IApiKeyService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: ApiKey[]; totalCount: number }> {
    const res = await this.service.getAll(params);
    return {
      items: (res.items || []).map(ApiKeyMapper.toEntity),
      totalCount: res.totalCount || 0,
    };
  }

  async create(request: CreateApiKeyRequest): Promise<CreateApiKeyResult> {
    return this.service.create(request);
  }

  async revoke(id: string): Promise<void> {
    await this.service.revoke(id);
  }
}
