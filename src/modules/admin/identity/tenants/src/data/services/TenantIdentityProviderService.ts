/**
 * Tenant Identity Provider HTTP Service
 *
 * Calls Platform-Admin tenant-scoped identity provider endpoints:
 * `/api/v1/tenants/{tenantId}/identity-providers`
 *
 * @module tenants/data
 */

import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  CreateTenantIdentityProviderDto,
  TenantIdentityProviderDetailDto,
  TenantIdentityProviderPagedDto,
  TenantIdpTestConnectionDto,
  UpdateTenantIdentityProviderDto,
} from "../models/TenantIdentityProviderModels";
import type { TenantIdentityProviderListParams } from "../../domain/entities/TenantIdentityProvider";
import { TENANTS_ENDPOINTS } from "./tenants.endpoints";

/** HTTP service calling Platform-Admin tenant-scoped identity provider endpoints via `IApiService`. */
export class TenantIdentityProviderService {
  constructor(private readonly api: IApiService) {}

  async getAll(
    tenantId: string,
    params?: TenantIdentityProviderListParams
  ): Promise<TenantIdentityProviderPagedDto> {
    const url = buildUrl(TENANTS_ENDPOINTS.IDENTITY_PROVIDERS(tenantId), {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      search: params?.search || undefined,
    });
    return this.api.get<TenantIdentityProviderPagedDto>(url);
  }

  async getById(tenantId: string, id: string): Promise<TenantIdentityProviderDetailDto> {
    return this.api.get<TenantIdentityProviderDetailDto>(
      TENANTS_ENDPOINTS.IDENTITY_PROVIDER_BY_ID(tenantId, id)
    );
  }

  async create(
    tenantId: string,
    payload: CreateTenantIdentityProviderDto
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(TENANTS_ENDPOINTS.IDENTITY_PROVIDERS(tenantId), payload);
  }

  async update(
    tenantId: string,
    id: string,
    payload: UpdateTenantIdentityProviderDto
  ): Promise<void> {
    await this.api.put(TENANTS_ENDPOINTS.IDENTITY_PROVIDER_BY_ID(tenantId, id), payload);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.api.delete(TENANTS_ENDPOINTS.IDENTITY_PROVIDER_BY_ID(tenantId, id));
  }

  async testConnection(tenantId: string, id: string): Promise<TenantIdpTestConnectionDto> {
    return this.api.post<TenantIdpTestConnectionDto>(
      TENANTS_ENDPOINTS.IDENTITY_PROVIDER_TEST_CONNECTION(tenantId, id),
      {}
    );
  }
}
