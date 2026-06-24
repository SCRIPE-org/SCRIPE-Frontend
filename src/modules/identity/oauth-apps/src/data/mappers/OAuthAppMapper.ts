/**
 * OAuth Application Mapper
 *
 * Converts between OAuth App Models (DTOs) and Entities (Domain).
 *
 * @module oauth-apps/data
 */
import {
  OAuthApp,
  OAuthAppListItem,
  RegenerateSecretResult,
  CreateOAuthAppResponse,
  type OAuthAppData,
  type OAuthAppListItemData,
  type CreateOAuthAppRequest,
  type UpdateOAuthAppRequest,
} from "../../domain/entities/OAuthApp";
import {
  OAuthAppModel,
  OAuthAppListItemModel,
  type OAuthAppJson,
  type OAuthAppListItemJson,
  type RegenerateSecretResultJson,
  type CreateOAuthAppResponseJson,
} from "../models/OAuthAppModel";
import { resolveFileUrl, unresolveFileUrl } from "@core/common/utils";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const OAuthAppModelSchema = z.object({
  id: uuidField(),
  displayName: z.string().min(1),
  protocol: optionalString(),
  clientId: optionalString(),
  hasClientSecret: z.boolean().optional().default(false),
  clientType: optionalString(),
  redirectUrisJson: z.string().optional().nullable(),
  postLogoutRedirectUrisJson: z.string().optional().nullable(),
  allowedScopes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .nullable(),
  allowedGrantTypes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .nullable(),
  tenantId: z.string().optional().nullable(),
  requireConsent: z.boolean().optional().default(false),
  requirePkce: z.boolean().optional().default(false),
  logoUri: z.string().optional().nullable(),
  samlAcsUrl: z.string().optional().nullable(),
  samlSpEntityId: z.string().optional().nullable(),
  samlSpCertificate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  accessTokenLifetimeMinutes: z.number().int().optional().nullable(),
  refreshTokenLifetimeDays: z.number().int().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  createdAt: optionalString(),
  modifiedAt: z.string().optional().nullable(),
});

const OAuthAppListItemModelSchema = z.object({
  id: uuidField(),
  displayName: z.string().min(1),
  protocol: optionalString(),
  clientId: optionalString(),
  clientType: optionalString(),
  allowedScopes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .nullable(),
  allowedGrantTypes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .nullable(),
  isActive: z.boolean().optional().default(true),
  requirePkce: z.boolean().optional().default(false),
  logoUri: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  createdAt: optionalString(),
});

/** Normalise scopes/grantTypes: backend may send string or string[] */
function normaliseSpaceList(raw: string | string[] | null | undefined): string {
  if (!raw) return "";
  if (Array.isArray(raw)) return raw.join(" ");
  return raw;
}

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class OAuthAppMapper {
  static toEntity(model: OAuthAppModel): OAuthApp {
    const validated = safeParseApiResponse(OAuthAppModelSchema, model, "OAuthApp");

    const data: OAuthAppData = {
      id: validated.id,
      displayName: validated.displayName,
      protocol: validated.protocol ?? "",
      clientId: validated.clientId ?? "",
      hasClientSecret: validated.hasClientSecret ?? false,
      clientType: validated.clientType ?? "",
      redirectUrisJson: validated.redirectUrisJson ?? "[]",
      postLogoutRedirectUrisJson: validated.postLogoutRedirectUrisJson ?? "[]",
      allowedScopes: normaliseSpaceList(validated.allowedScopes),
      allowedGrantTypes: normaliseSpaceList(validated.allowedGrantTypes),
      tenantId: validated.tenantId ?? null,
      requireConsent: validated.requireConsent ?? false,
      requirePkce: validated.requirePkce ?? false,
      logoUri: resolveFileUrl(validated.logoUri),
      samlAcsUrl: validated.samlAcsUrl ?? null,
      samlSpEntityId: validated.samlSpEntityId ?? null,
      samlSpCertificate: validated.samlSpCertificate ?? null,
      description: validated.description ?? null,
      accessTokenLifetimeMinutes: validated.accessTokenLifetimeMinutes ?? 60,
      refreshTokenLifetimeDays: validated.refreshTokenLifetimeDays ?? 30,
      isActive: validated.isActive ?? true,
      createdAt: validated.createdAt ?? "",
      modifiedAt: validated.modifiedAt ?? null,
    };
    return new OAuthApp(data);
  }

  static fromJsonToEntity(json: OAuthAppJson): OAuthApp {
    const model = OAuthAppModel.fromJson(json);
    return OAuthAppMapper.toEntity(model);
  }

  static toListItemEntity(model: OAuthAppListItemModel): OAuthAppListItem {
    const validated = safeParseApiResponse(OAuthAppListItemModelSchema, model, "OAuthAppListItem");

    const data: OAuthAppListItemData = {
      id: validated.id,
      displayName: validated.displayName,
      protocol: validated.protocol ?? "",
      clientId: validated.clientId ?? "",
      clientType: validated.clientType ?? "",
      allowedScopes: normaliseSpaceList(validated.allowedScopes),
      allowedGrantTypes: normaliseSpaceList(validated.allowedGrantTypes),
      isActive: validated.isActive ?? true,
      requirePkce: validated.requirePkce ?? false,
      logoUri: resolveFileUrl(validated.logoUri),
      description: validated.description ?? null,
      createdAt: validated.createdAt ?? "",
    };
    return new OAuthAppListItem(data);
  }

  static fromListItemJsonToEntity(json: OAuthAppListItemJson): OAuthAppListItem {
    const model = OAuthAppListItemModel.fromJson(json);
    return OAuthAppMapper.toListItemEntity(model);
  }

  static toRegenerateSecretEntity(json: RegenerateSecretResultJson): RegenerateSecretResult {
    return new RegenerateSecretResult(json.clientId, json.newClientSecret);
  }

  static toCreateResponseEntity(json: CreateOAuthAppResponseJson): CreateOAuthAppResponse {
    return new CreateOAuthAppResponse(json.id, json.clientId, json.clientSecret);
  }

  static toCreateJson(request: CreateOAuthAppRequest) {
    const { redirectUris, postLogoutRedirectUris, ...rest } = request;
    return {
      ...rest,
      // Backend expects JSON-serialized strings, not raw arrays
      redirectUrisJson: JSON.stringify(redirectUris ?? []),
      postLogoutRedirectUrisJson: JSON.stringify(postLogoutRedirectUris ?? []),
      logoUri: unresolveFileUrl(request.logoUri),
    };
  }

  static toUpdateJson(request: UpdateOAuthAppRequest) {
    const { redirectUris, postLogoutRedirectUris, ...rest } = request;
    return {
      ...rest,
      // Backend expects JSON-serialized strings, not raw arrays
      ...(redirectUris !== undefined && { redirectUrisJson: JSON.stringify(redirectUris) }),
      ...(postLogoutRedirectUris !== undefined && {
        postLogoutRedirectUrisJson: JSON.stringify(postLogoutRedirectUris),
      }),
      logoUri: unresolveFileUrl(request.logoUri),
    };
  }
}
