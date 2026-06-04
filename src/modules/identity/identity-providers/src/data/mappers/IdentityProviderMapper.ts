/**
 * Identity Provider Mapper
 *
 * Converts between Identity Provider Models (DTOs) and Entities (Domain).
 *
 * @module identity-providers/data
 */
import {
  IdentityProvider,
  IdentityProviderListItem,
  TestConnectionResult,
  type IdentityProviderData,
  type IdentityProviderListItemData,
  type CreateIdentityProviderRequest,
  type UpdateIdentityProviderRequest,
} from "../../domain/entities/IdentityProvider";
import {
  IdentityProviderModel,
  IdentityProviderListItemModel,
  type IdentityProviderJson,
  type IdentityProviderListItemJson,
  type TestConnectionResultJson,
} from "../models/IdentityProviderModel";
import { resolveFileUrl, unresolveFileUrl } from "@core/common/utils";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const IdentityProviderModelSchema = z.object({
  id: uuidField(),
  name: z.string().min(1),
  slug: optionalString(),
  protocol: optionalString(),
  tenantId: z.string().optional().nullable(),
  authority: z.string().optional().nullable(),
  authorizationEndpoint: z.string().optional().nullable(),
  tokenEndpoint: z.string().optional().nullable(),
  userInformationEndpoint: z.string().optional().nullable(),
  clientId: optionalString(),
  hasClientSecret: z.boolean().optional().default(false),
  scopes: optionalString(),
  redirectUri: z.string().optional().nullable(),
  samlIdpEntityId: z.string().optional().nullable(),
  samlSsoUrl: z.string().optional().nullable(),
  samlCertificate: z.string().optional().nullable(),
  claimMappingJson: z.string().optional().nullable(),
  enabledForAdmins: z.boolean().optional().default(false),
  enabledForUsers: z.boolean().optional().default(false),
  iconUrl: z.string().optional().nullable(),
  buttonColor: z.string().optional().nullable(),
  buttonLabel: z.string().optional().nullable(),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  createdAt: z.string().optional().nullable(),
  modifiedAt: z.string().optional().nullable(),
});

const IdentityProviderListItemModelSchema = z.object({
  id: uuidField(),
  name: z.string().min(1),
  slug: optionalString(),
  protocol: optionalString(),
  enabledForAdmins: z.boolean().optional().default(false),
  enabledForUsers: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
  iconUrl: z.string().optional().nullable(),
  buttonColor: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

export class IdentityProviderMapper {
  static toEntity(model: IdentityProviderModel): IdentityProvider {
    const validated = safeParseApiResponse(IdentityProviderModelSchema, model, "IdentityProvider");

    const data: IdentityProviderData = {
      id: validated.id,
      name: validated.name,
      slug: validated.slug ?? "",
      protocol: validated.protocol ?? "",
      tenantId: validated.tenantId ?? null,
      authority: validated.authority ?? null,
      authorizationEndpoint: validated.authorizationEndpoint ?? null,
      tokenEndpoint: validated.tokenEndpoint ?? null,
      userInformationEndpoint: validated.userInformationEndpoint ?? null,
      clientId: validated.clientId ?? null,
      hasClientSecret: validated.hasClientSecret ?? false,
      scopes: validated.scopes ?? null,
      redirectUri: validated.redirectUri ?? null,
      samlIdpEntityId: validated.samlIdpEntityId ?? null,
      samlSsoUrl: validated.samlSsoUrl ?? null,
      samlCertificate: validated.samlCertificate ?? null,
      claimMappingJson: validated.claimMappingJson ?? null,
      enabledForAdmins: validated.enabledForAdmins ?? false,
      enabledForUsers: validated.enabledForUsers ?? false,
      iconUrl: resolveFileUrl(validated.iconUrl),
      buttonColor: validated.buttonColor ?? null,
      buttonLabel: validated.buttonLabel ?? null,
      displayOrder: validated.displayOrder ?? 0,
      isActive: validated.isActive ?? true,
      createdAt: validated.createdAt ?? "",
      modifiedAt: validated.modifiedAt ?? null,
    };
    return new IdentityProvider(data);
  }

  static fromJsonToEntity(json: IdentityProviderJson): IdentityProvider {
    const model = IdentityProviderModel.fromJson(json);
    return IdentityProviderMapper.toEntity(model);
  }

  static toListItemEntity(model: IdentityProviderListItemModel): IdentityProviderListItem {
    const validated = safeParseApiResponse(
      IdentityProviderListItemModelSchema,
      model,
      "IdentityProviderListItem"
    );

    const data: IdentityProviderListItemData = {
      id: validated.id,
      name: validated.name,
      slug: validated.slug ?? "",
      protocol: validated.protocol ?? "",
      enabledForAdmins: validated.enabledForAdmins ?? false,
      enabledForUsers: validated.enabledForUsers ?? false,
      isActive: validated.isActive ?? true,
      displayOrder: validated.displayOrder ?? 0,
      iconUrl: resolveFileUrl(validated.iconUrl),
      buttonColor: validated.buttonColor ?? null,
      createdAt: validated.createdAt ?? "",
    };
    return new IdentityProviderListItem(data);
  }

  static fromListItemJsonToEntity(json: IdentityProviderListItemJson): IdentityProviderListItem {
    const model = IdentityProviderListItemModel.fromJson(json);
    return IdentityProviderMapper.toListItemEntity(model);
  }

  static toTestResultEntity(json: TestConnectionResultJson): TestConnectionResult {
    return new TestConnectionResult(
      json.isSuccess,
      json.message,
      json.discoveredIssuer,
      json.discoveredEndpoints
    );
  }

  static toCreateJson(request: CreateIdentityProviderRequest) {
    return {
      ...request,
      iconUrl: unresolveFileUrl(request.iconUrl),
    };
  }

  static toUpdateJson(request: UpdateIdentityProviderRequest) {
    return {
      ...request,
      iconUrl: unresolveFileUrl(request.iconUrl),
    };
  }
}
