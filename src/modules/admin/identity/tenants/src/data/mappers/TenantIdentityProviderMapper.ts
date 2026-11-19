/**
 * Tenant Identity Provider Mapper
 *
 * Maps API DTOs <-> Domain entities for platform-managed tenant identity providers.
 *
 * @module tenants/data
 */

import type {
  CreateTenantIdentityProviderPayload,
  TenantIdentityProviderDetail,
  TenantIdentityProviderListItem,
  TenantIdpProtocol,
  TenantIdpTestConnectionResult,
  UpdateTenantIdentityProviderPayload,
} from "../../domain/entities/TenantIdentityProvider";
import type {
  CreateTenantIdentityProviderDto,
  TenantIdentityProviderDetailDto,
  TenantIdentityProviderListItemDto,
  TenantIdpTestConnectionDto,
  UpdateTenantIdentityProviderDto,
} from "../models/TenantIdentityProviderModels";

function normalizeProtocol(protocol?: string | null): TenantIdpProtocol {
  const lower = (protocol ?? "oidc").toLowerCase();
  if (lower.includes("saml")) return "saml";
  if (lower === "oauth2" || lower === "oauth") return "oauth2";
  return "oidc";
}

function emptyToNull(value?: string | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Pure mapper converting between tenant identity provider API DTOs and domain entities. */
export const TenantIdentityProviderMapper = {
  toListItem(dto: TenantIdentityProviderListItemDto): TenantIdentityProviderListItem {
    return {
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      protocol: normalizeProtocol(dto.protocol),
      enabledForAdmins: Boolean(dto.enabledForAdmins),
      enabledForUsers: Boolean(dto.enabledForUsers),
      isActive: Boolean(dto.isActive),
      trustIdpMfa: Boolean(dto.trustIdpMfa),
      displayOrder: dto.displayOrder ?? 0,
      iconUrl: dto.iconUrl ?? null,
      buttonColor: dto.buttonColor ?? null,
      createdAt: dto.createdAt,
    };
  },

  toDetail(dto: TenantIdentityProviderDetailDto): TenantIdentityProviderDetail {
    return {
      ...TenantIdentityProviderMapper.toListItem(dto),
      tenantId: dto.tenantId ?? null,
      authority: dto.authority ?? null,
      authorizationEndpoint: dto.authorizationEndpoint ?? null,
      tokenEndpoint: dto.tokenEndpoint ?? null,
      userInformationEndpoint: dto.userInformationEndpoint ?? null,
      clientId: dto.clientId ?? null,
      hasClientSecret: Boolean(dto.hasClientSecret),
      scopes: dto.scopes ?? null,
      redirectUri: dto.redirectUri ?? null,
      samlIdpEntityId: dto.samlIdpEntityId ?? null,
      samlSsoUrl: dto.samlSsoUrl ?? null,
      samlCertificate: dto.samlCertificate ?? null,
      claimMappingJson: dto.claimMappingJson ?? null,
      buttonLabel: dto.buttonLabel ?? null,
      modifiedAt: dto.modifiedAt ?? null,
      rowVersion: dto.rowVersion ?? null,
    };
  },

  toCreateDto(payload: CreateTenantIdentityProviderPayload): CreateTenantIdentityProviderDto {
    return {
      name: payload.name.trim(),
      slug: payload.slug.trim().toLowerCase(),
      protocol: payload.protocol,
      authority: emptyToNull(payload.authority),
      authorizationEndpoint: emptyToNull(payload.authorizationEndpoint),
      tokenEndpoint: emptyToNull(payload.tokenEndpoint),
      userInformationEndpoint: emptyToNull(payload.userInformationEndpoint),
      clientId: emptyToNull(payload.clientId),
      clientSecret: emptyToNull(payload.clientSecret),
      scopes: emptyToNull(payload.scopes),
      redirectUri: emptyToNull(payload.redirectUri),
      samlIdpEntityId: emptyToNull(payload.samlIdpEntityId),
      samlSsoUrl: emptyToNull(payload.samlSsoUrl),
      samlCertificate: emptyToNull(payload.samlCertificate),
      claimMappingJson: emptyToNull(payload.claimMappingJson),
      enabledForAdmins: payload.enabledForAdmins,
      enabledForUsers: payload.enabledForUsers,
      iconUrl: emptyToNull(payload.iconUrl),
      buttonColor: emptyToNull(payload.buttonColor),
      buttonLabel: emptyToNull(payload.buttonLabel),
      displayOrder: payload.displayOrder,
      isActive: payload.isActive,
      trustIdpMfa: payload.trustIdpMfa,
    };
  },

  toUpdateDto(payload: UpdateTenantIdentityProviderPayload): UpdateTenantIdentityProviderDto {
    return {
      ...TenantIdentityProviderMapper.toCreateDto(payload),
      rowVersion: payload.rowVersion ?? null,
    };
  },

  toTestResult(dto: TenantIdpTestConnectionDto): TenantIdpTestConnectionResult {
    return {
      isSuccess: Boolean(dto.isSuccess),
      message: dto.message ?? "",
      discoveredIssuer: dto.discoveredIssuer ?? null,
      discoveredEndpoints: dto.discoveredEndpoints ?? [],
    };
  },
};
