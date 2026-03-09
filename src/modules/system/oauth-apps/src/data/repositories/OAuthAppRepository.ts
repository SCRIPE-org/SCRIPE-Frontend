/**
 * OAuth Application Repository Implementation
 *
 * Implements IOAuthAppRepository using OAuthAppService.
 * Uses OAuthAppMapper to convert between Models (DTOs) and Entities.
 *
 * @module oauth-apps/data
 */
import type { IOAuthAppRepository } from "../../domain/interfaces/IOAuthAppRepository";
import type { IOAuthAppService } from "../../domain/interfaces/IOAuthAppService";
import type {
      OAuthApp,
      OAuthAppListItem,
      RegenerateSecretResult,
      CreateOAuthAppResponse,
      CreateOAuthAppRequest,
      UpdateOAuthAppRequest,
} from "../../domain/entities/OAuthApp";
import { OAuthAppMapper } from "../mappers/OAuthAppMapper";

export class OAuthAppRepository implements IOAuthAppRepository {
      constructor(private readonly service: IOAuthAppService) { }

      async getAll(params: {
            page: number;
            pageSize: number;
            search?: string;
      }): Promise<{ items: OAuthAppListItem[]; totalCount: number }> {
            const result = await this.service.getAll(params);
            return {
                  items: result.items.map((json) => OAuthAppMapper.fromListItemJsonToEntity(json)),
                  totalCount: result.totalCount,
            };
      }

      async getById(id: string): Promise<OAuthApp> {
            const json = await this.service.getById(id);
            return OAuthAppMapper.fromJsonToEntity(json);
      }

      async create(data: CreateOAuthAppRequest): Promise<CreateOAuthAppResponse> {
            const createJson = OAuthAppMapper.toCreateJson(data);
            const json = await this.service.create(createJson);
            return OAuthAppMapper.toCreateResponseEntity(json);
      }

      async update(id: string, data: UpdateOAuthAppRequest): Promise<void> {
            const updateJson = OAuthAppMapper.toUpdateJson(data);
            await this.service.update(id, updateJson);
      }

      async remove(id: string): Promise<void> {
            await this.service.remove(id);
      }

      async regenerateSecret(id: string): Promise<RegenerateSecretResult> {
            const json = await this.service.regenerateSecret(id);
            return OAuthAppMapper.toRegenerateSecretEntity(json);
      }
}
