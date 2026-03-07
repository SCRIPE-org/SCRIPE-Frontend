/**
 * Identity Provider Service Implementation
 *
 * Handles all identity provider API calls. Returns raw JSON types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module identity-providers/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      IIdentityProviderService,
      ServiceIdentityProviderListParams,
} from "../../domain/interfaces/IIdentityProviderService";
import type {
      IdentityProviderJson,
      IdentityProviderListResponseJson,
      CreateIdentityProviderJson,
      UpdateIdentityProviderJson,
      TestConnectionResultJson,
} from "../models/IdentityProviderModel";

export class IdentityProviderService implements IIdentityProviderService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: ServiceIdentityProviderListParams): Promise<IdentityProviderListResponseJson> {
            const url = buildUrl(
                  API_ENDPOINTS.IDENTITY_PROVIDERS.LIST,
                  params as unknown as Record<string, string | number | boolean | null | undefined>,
            );
            return this.api.get(url);
      }

      async getById(id: string): Promise<IdentityProviderJson> {
            return this.api.get(API_ENDPOINTS.IDENTITY_PROVIDERS.BY_ID(id));
      }

      async create(data: CreateIdentityProviderJson): Promise<IdentityProviderJson> {
            return this.api.post(API_ENDPOINTS.IDENTITY_PROVIDERS.CREATE, data);
      }

      async update(id: string, data: UpdateIdentityProviderJson): Promise<void> {
            await this.api.put(API_ENDPOINTS.IDENTITY_PROVIDERS.UPDATE(id), data);
      }

      async remove(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.IDENTITY_PROVIDERS.DELETE(id));
      }

      async testConnection(id: string): Promise<TestConnectionResultJson> {
            return this.api.post(API_ENDPOINTS.IDENTITY_PROVIDERS.TEST(id), {});
      }
}
