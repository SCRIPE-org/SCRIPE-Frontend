/**
 * Identity Provider Service Implementation
 *
 * Handles all identity provider API calls. Returns raw JSON types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module identity-providers/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
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
import { IDENTITY_PROVIDERS_ENDPOINTS } from "./identity-providers.endpoints";

/**
 * Http API network service for identity provider.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class IdentityProviderService implements IIdentityProviderService {
  constructor(private readonly api: IApiService) {}

  async getAll(
    params: ServiceIdentityProviderListParams
  ): Promise<IdentityProviderListResponseJson> {
    const url = buildUrl(
      IDENTITY_PROVIDERS_ENDPOINTS.LIST,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get(url);
  }

  async getById(id: string): Promise<IdentityProviderJson> {
    return this.api.get(IDENTITY_PROVIDERS_ENDPOINTS.BY_ID(id));
  }

  async create(data: CreateIdentityProviderJson): Promise<{ id: string }> {
    return this.api.post(IDENTITY_PROVIDERS_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: UpdateIdentityProviderJson): Promise<void> {
    await this.api.put(IDENTITY_PROVIDERS_ENDPOINTS.UPDATE(id), data);
  }

  async remove(id: string): Promise<void> {
    await this.api.delete(IDENTITY_PROVIDERS_ENDPOINTS.DELETE(id));
  }

  async testConnection(id: string): Promise<TestConnectionResultJson> {
    return this.api.post(IDENTITY_PROVIDERS_ENDPOINTS.TEST(id), {});
  }
}
