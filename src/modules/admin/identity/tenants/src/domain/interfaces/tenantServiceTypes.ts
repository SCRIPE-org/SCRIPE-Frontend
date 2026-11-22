/**
 * tenantServiceTypes — Data transfer shapes and query parameter models for tenant HTTP operations.
 *
 * @module tenants/domain
 */

import type { TenantModel, TenantTreeNodeModel } from "../types/TenantModelTypes";

/**
 * Tenant domain record from the API.
 */
export interface TenantDomainJson {
  /** Unique domain mapping identifier */
  id: string;
  /** Hostname string (e.g. "tenant.example.com") */
  domain: string;
  /** Assignment mode (system provisioned or custom vanity) */
  type: "auto" | "custom";
  /** Whether this record acts as the primary tenant hostname */
  isPrimary: boolean;
  /** Whether DNS ownership has been confirmed */
  isVerified: boolean;
  /** Verification token used for DNS challenge verification */
  verificationToken: string | null;
  /** Timestamp when domain was verified */
  verifiedAt: string | null;
  /** Creation timestamp */
  createdAt: string;
  /** Target hostname to redirect to */
  redirectTo?: string | null;
  /** HTTP redirect status code (301, 302, 307, 308) */
  redirectStatusCode?: number | null;
}

/**
 * Payload for adding a custom domain.
 */
export interface AddTenantDomainPayload {
  domain: string;
  redirectTo?: string | null;
  redirectStatusCode?: number | null;
}

/**
 * Payload for updating custom domain redirect settings.
 */
export interface UpdateTenantDomainPayload {
  redirectTo?: string | null;
  redirectStatusCode?: number | null;
}

/**
 * Response structure for the tenant domains endpoint.
 */
export interface TenantDomainsResponse {
  /** List of configured domains for the tenant */
  domains: TenantDomainJson[];
  /** CNAME target host for custom domain setup */
  cnameTarget: string;
  /** Subdomain prefix expected for TXT validation */
  verificationPrefix: string;
}

/**
 * Parameter payload passed to paginated tenant query endpoints.
 */
export interface ServiceTenantListParams {
  /** 1-based page index */
  page?: number;
  /** Maximum number of records per page */
  pageSize?: number;
  /** Search query string filtering tenant names or codes */
  search?: string;
  /** Optional parent tenant identifier filter */
  parentId?: string;
}

/**
 * Standard paginated list result containing TenantModel items.
 */
export interface TenantListResult {
  /** Array of tenant entity models */
  items: TenantModel[];
  /** Total count of records across all pages */
  totalCount: number;
  /** Current page index */
  page: number;
  /** Current page size */
  pageSize: number;
  /** Total page count calculated by server */
  totalPages: number;
  /** Whether subsequent pages exist */
  hasNextPage: boolean;
  /** Whether preceding pages exist */
  hasPreviousPage: boolean;
}

/**
 * Paginated list result containing hierarchical TenantTreeNodeModel items.
 */
export interface TenantTreeListResult {
  /** Array of hierarchical tenant tree node models */
  items: TenantTreeNodeModel[];
  /** Total count of records across all pages */
  totalCount: number;
  /** Current page index */
  page: number;
  /** Current page size */
  pageSize: number;
  /** Total page count calculated by server */
  totalPages: number;
  /** Whether subsequent pages exist */
  hasNextPage: boolean;
  /** Whether preceding pages exist */
  hasPreviousPage: boolean;
}

/**
 * Raw API DTO shapes for Platform-Admin tenant-scoped identity providers.
 */
export interface TenantIdentityProviderListItemDto {
  id: string;
  name: string;
  slug: string;
  protocol: string;
  enabledForAdmins: boolean;
  enabledForUsers: boolean;
  isActive: boolean;
  trustIdpMfa?: boolean;
  displayOrder: number;
  iconUrl?: string | null;
  buttonColor?: string | null;
  createdAt: string;
}

/** Detailed API DTO for a single tenant-scoped identity provider. */
export interface TenantIdentityProviderDetailDto extends TenantIdentityProviderListItemDto {
  tenantId?: string | null;
  authority?: string | null;
  authorizationEndpoint?: string | null;
  tokenEndpoint?: string | null;
  userInformationEndpoint?: string | null;
  clientId?: string | null;
  hasClientSecret: boolean;
  scopes?: string | null;
  redirectUri?: string | null;
  samlIdpEntityId?: string | null;
  samlSsoUrl?: string | null;
  samlCertificate?: string | null;
  claimMappingJson?: string | null;
  buttonLabel?: string | null;
  modifiedAt?: string | null;
  rowVersion?: string | null;
}

/** Paginated API response DTO for tenant-scoped identity providers. */
export interface TenantIdentityProviderPagedDto {
  items: TenantIdentityProviderListItemDto[];
  totalCount: number;
  pageNumber?: number;
  page?: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Request DTO for creating a tenant-scoped identity provider. */
export interface CreateTenantIdentityProviderDto {
  name: string;
  slug: string;
  protocol: string;
  authority?: string | null;
  authorizationEndpoint?: string | null;
  tokenEndpoint?: string | null;
  userInformationEndpoint?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  scopes?: string | null;
  redirectUri?: string | null;
  samlIdpEntityId?: string | null;
  samlSsoUrl?: string | null;
  samlCertificate?: string | null;
  claimMappingJson?: string | null;
  enabledForAdmins: boolean;
  enabledForUsers: boolean;
  iconUrl?: string | null;
  buttonColor?: string | null;
  buttonLabel?: string | null;
  displayOrder: number;
  isActive: boolean;
  trustIdpMfa: boolean;
}

/** Request DTO for updating a tenant-scoped identity provider with optimistic concurrency token. */
export interface UpdateTenantIdentityProviderDto extends CreateTenantIdentityProviderDto {
  rowVersion?: string | null;
}

/** Response DTO for testing connectivity against a tenant-scoped identity provider. */
export interface TenantIdpTestConnectionDto {
  isSuccess: boolean;
  message: string;
  discoveredIssuer?: string | null;
  discoveredEndpoints?: string[] | null;
}
