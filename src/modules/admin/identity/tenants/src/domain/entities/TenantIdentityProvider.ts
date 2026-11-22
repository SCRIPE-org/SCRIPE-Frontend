/**
 * Tenant Identity Provider Domain Entities & Contracts
 *
 * Represents platform-managed identity providers scoped to a specific tenant
 * (managed on the Identity Providers tab of `/tenants/[id]`).
 *
 * @module tenants/domain
 */

/** Supported SSO federation protocols for tenant-scoped identity providers. */
export type TenantIdpProtocol = "oidc" | "oauth2" | "saml";

/** Summary list item for a tenant-scoped identity provider. */
export interface TenantIdentityProviderListItem {
  id: string;
  name: string;
  slug: string;
  protocol: TenantIdpProtocol;
  enabledForAdmins: boolean;
  enabledForUsers: boolean;
  isActive: boolean;
  trustIdpMfa: boolean;
  displayOrder: number;
  iconUrl: string | null;
  buttonColor: string | null;
  createdAt: string;
}

/** Full configuration detail for a tenant-scoped identity provider. */
export interface TenantIdentityProviderDetail extends TenantIdentityProviderListItem {
  tenantId: string | null;
  authority: string | null;
  authorizationEndpoint: string | null;
  tokenEndpoint: string | null;
  userInformationEndpoint: string | null;
  clientId: string | null;
  hasClientSecret: boolean;
  scopes: string | null;
  redirectUri: string | null;
  samlIdpEntityId: string | null;
  samlSsoUrl: string | null;
  samlCertificate: string | null;
  claimMappingJson: string | null;
  buttonLabel: string | null;
  modifiedAt: string | null;
  rowVersion: string | null;
}

/** Domain payload for creating a new tenant-scoped identity provider. */
export interface CreateTenantIdentityProviderPayload {
  name: string;
  slug: string;
  protocol: TenantIdpProtocol;
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

/** Domain payload for updating an existing tenant-scoped identity provider with concurrency token. */
export interface UpdateTenantIdentityProviderPayload extends CreateTenantIdentityProviderPayload {
  rowVersion?: string | null;
}

/** Diagnostic result returned by backend identity provider connection test. */
export interface TenantIdpTestConnectionResult {
  isSuccess: boolean;
  message: string;
  discoveredIssuer: string | null;
  discoveredEndpoints: string[];
}

/** Pagination and search query parameters for listing tenant-scoped identity providers. */
export interface TenantIdentityProviderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
