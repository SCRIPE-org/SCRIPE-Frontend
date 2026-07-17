/**
 * OAuth Application Service Implementation
 *
 * Handles all OAuth app API calls. Returns raw JSON types.
 *
 * @module oauth-apps/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  IOAuthAppService,
  ServiceOAuthAppListParams,
} from "../../domain/interfaces/IOAuthAppService";
import type {
  OAuthAppJson,
  OAuthAppListResponseJson,
  CreateOAuthAppJson,
  CreateOAuthAppResponseJson,
  UpdateOAuthAppJson,
  RegenerateSecretResultJson,
} from "../models/OAuthAppModel";
import { OAUTH_APPS_ENDPOINTS } from "./oauth-apps.endpoints";

/**
 * Http API network service for o auth app.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class OAuthAppService implements IOAuthAppService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: ServiceOAuthAppListParams): Promise<OAuthAppListResponseJson> {
    const url = buildUrl(
      OAUTH_APPS_ENDPOINTS.LIST,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get(url);
  }

  async getById(id: string): Promise<OAuthAppJson> {
    return this.api.get(OAUTH_APPS_ENDPOINTS.BY_ID(id));
  }

  async create(data: CreateOAuthAppJson): Promise<CreateOAuthAppResponseJson> {
    return this.api.post(OAUTH_APPS_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: UpdateOAuthAppJson): Promise<void> {
    await this.api.put(OAUTH_APPS_ENDPOINTS.UPDATE(id), data);
  }

  async remove(id: string): Promise<void> {
    await this.api.delete(OAUTH_APPS_ENDPOINTS.DELETE(id));
  }

  async regenerateSecret(id: string): Promise<RegenerateSecretResultJson> {
    return this.api.post(OAUTH_APPS_ENDPOINTS.REGENERATE_SECRET(id), {});
  }
}
