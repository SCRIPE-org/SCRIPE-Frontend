/**
 * OAuth Application Service Implementation
 *
 * Handles all OAuth app API calls. Returns raw JSON types.
 *
 * @module oauth-apps/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      IOAuthAppService,
      ServiceOAuthAppListParams,
} from "../../domain/interfaces/IOAuthAppService";
import type {
      OAuthAppJson,
      OAuthAppListResponseJson,
      CreateOAuthAppJson,
      UpdateOAuthAppJson,
      RegenerateSecretResultJson,
} from "../models/OAuthAppModel";

export class OAuthAppService implements IOAuthAppService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: ServiceOAuthAppListParams): Promise<OAuthAppListResponseJson> {
            const url = buildUrl(
                  API_ENDPOINTS.OAUTH_APPS.LIST,
                  params as unknown as Record<string, string | number | boolean | null | undefined>,
            );
            return this.api.get(url);
      }

      async getById(id: string): Promise<OAuthAppJson> {
            return this.api.get(API_ENDPOINTS.OAUTH_APPS.BY_ID(id));
      }

      async create(data: CreateOAuthAppJson): Promise<OAuthAppJson> {
            return this.api.post(API_ENDPOINTS.OAUTH_APPS.CREATE, data);
      }

      async update(id: string, data: UpdateOAuthAppJson): Promise<void> {
            await this.api.put(API_ENDPOINTS.OAUTH_APPS.UPDATE(id), data);
      }

      async remove(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.OAUTH_APPS.DELETE(id));
      }

      async regenerateSecret(id: string): Promise<RegenerateSecretResultJson> {
            return this.api.post(API_ENDPOINTS.OAUTH_APPS.REGENERATE_SECRET(id), {});
      }
}
