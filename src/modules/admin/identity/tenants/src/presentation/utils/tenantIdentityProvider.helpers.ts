/**
 * Pure form-state and payload builders for Tenant Identity Provider management.
 *
 * @module tenants/presentation/utils
 */

import type {
  CreateTenantIdentityProviderPayload,
  TenantIdentityProviderDetail,
  TenantIdpProtocol,
  UpdateTenantIdentityProviderPayload,
} from "../../domain/entities/TenantIdentityProvider";

/** Local editable form state for the Tenant Identity Provider create/edit dialog. */
export interface TenantIdpFormState {
  name: string;
  slug: string;
  protocol: TenantIdpProtocol;
  authority: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInformationEndpoint: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  redirectUri: string;
  samlIdpEntityId: string;
  samlSsoUrl: string;
  samlCertificate: string;
  claimMappingJson: string;
  enabledForAdmins: boolean;
  enabledForUsers: boolean;
  iconUrl: string;
  buttonColor: string;
  buttonLabel: string;
  displayOrder: number;
  isActive: boolean;
  trustIdpMfa: boolean;
}

/** Builds initial dialog form state from an existing provider detail or sensible defaults. */
export function buildInitialTenantIdpFormState(
  provider: TenantIdentityProviderDetail | null
): TenantIdpFormState {
  if (!provider) {
    return {
      name: "",
      slug: "",
      protocol: "oidc",
      authority: "",
      authorizationEndpoint: "",
      tokenEndpoint: "",
      userInformationEndpoint: "",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      redirectUri: "",
      samlIdpEntityId: "",
      samlSsoUrl: "",
      samlCertificate: "",
      claimMappingJson: "",
      enabledForAdmins: true,
      enabledForUsers: false,
      iconUrl: "",
      buttonColor: "",
      buttonLabel: "",
      displayOrder: 0,
      isActive: true,
      trustIdpMfa: false,
    };
  }

  return {
    name: provider.name,
    slug: provider.slug,
    protocol: provider.protocol,
    authority: provider.authority ?? "",
    authorizationEndpoint: provider.authorizationEndpoint ?? "",
    tokenEndpoint: provider.tokenEndpoint ?? "",
    userInformationEndpoint: provider.userInformationEndpoint ?? "",
    clientId: provider.clientId ?? "",
    clientSecret: "",
    scopes: provider.scopes ?? "",
    redirectUri: provider.redirectUri ?? "",
    samlIdpEntityId: provider.samlIdpEntityId ?? "",
    samlSsoUrl: provider.samlSsoUrl ?? "",
    samlCertificate: provider.samlCertificate ?? "",
    claimMappingJson: provider.claimMappingJson ?? "",
    enabledForAdmins: provider.enabledForAdmins,
    enabledForUsers: provider.enabledForUsers,
    iconUrl: provider.iconUrl ?? "",
    buttonColor: provider.buttonColor ?? "",
    buttonLabel: provider.buttonLabel ?? "",
    displayOrder: provider.displayOrder,
    isActive: provider.isActive,
    trustIdpMfa: provider.trustIdpMfa,
  };
}

/** Converts a provider display name into a URL-safe slug. */
export function toTenantIdpSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Converts dialog form state into a create/update domain payload. */
export function buildTenantIdpSavePayload(
  form: TenantIdpFormState,
  rowVersion?: string | null
): CreateTenantIdentityProviderPayload | UpdateTenantIdentityProviderPayload {
  return {
    name: form.name,
    slug: form.slug,
    protocol: form.protocol,
    authority: form.authority || null,
    authorizationEndpoint: form.authorizationEndpoint || null,
    tokenEndpoint: form.tokenEndpoint || null,
    userInformationEndpoint: form.userInformationEndpoint || null,
    clientId: form.clientId || null,
    clientSecret: form.clientSecret || null,
    scopes: form.scopes || null,
    redirectUri: form.redirectUri || null,
    samlIdpEntityId: form.samlIdpEntityId || null,
    samlSsoUrl: form.samlSsoUrl || null,
    samlCertificate: form.samlCertificate || null,
    claimMappingJson: form.claimMappingJson || null,
    enabledForAdmins: form.enabledForAdmins,
    enabledForUsers: form.enabledForUsers,
    iconUrl: form.iconUrl || null,
    buttonColor: form.buttonColor || null,
    buttonLabel: form.buttonLabel || null,
    displayOrder: form.displayOrder,
    isActive: form.isActive,
    trustIdpMfa: form.trustIdpMfa,
    rowVersion: rowVersion ?? null,
  };
}

/** Builds a full update payload preserving existing secret & settings while toggling `isActive`. */
export function buildTenantIdpToggleUpdatePayload(
  detail: TenantIdentityProviderDetail,
  nextActive: boolean
): UpdateTenantIdentityProviderPayload {
  return {
    name: detail.name,
    slug: detail.slug,
    protocol: detail.protocol,
    authority: detail.authority,
    authorizationEndpoint: detail.authorizationEndpoint,
    tokenEndpoint: detail.tokenEndpoint,
    userInformationEndpoint: detail.userInformationEndpoint,
    clientId: detail.clientId,
    clientSecret: null, // Preserve existing encrypted secret on active toggle
    scopes: detail.scopes,
    redirectUri: detail.redirectUri,
    samlIdpEntityId: detail.samlIdpEntityId,
    samlSsoUrl: detail.samlSsoUrl,
    samlCertificate: detail.samlCertificate,
    claimMappingJson: detail.claimMappingJson,
    enabledForAdmins: detail.enabledForAdmins,
    enabledForUsers: detail.enabledForUsers,
    iconUrl: detail.iconUrl,
    buttonColor: detail.buttonColor,
    buttonLabel: detail.buttonLabel,
    displayOrder: detail.displayOrder,
    isActive: nextActive,
    trustIdpMfa: detail.trustIdpMfa,
    rowVersion: detail.rowVersion,
  };
}
