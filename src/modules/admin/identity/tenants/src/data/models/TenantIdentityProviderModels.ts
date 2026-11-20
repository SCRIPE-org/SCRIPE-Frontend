/**
 * Tenant Identity Provider DTOs (API Contracts)
 *
 * Re-exports from domain/interfaces/tenantServiceTypes (single source of truth).
 *
 * @module tenants/data
 */

export type {
  TenantIdentityProviderListItemDto,
  TenantIdentityProviderDetailDto,
  TenantIdentityProviderPagedDto,
  CreateTenantIdentityProviderDto,
  UpdateTenantIdentityProviderDto,
  TenantIdpTestConnectionDto,
} from "../../domain/interfaces/tenantServiceTypes";
