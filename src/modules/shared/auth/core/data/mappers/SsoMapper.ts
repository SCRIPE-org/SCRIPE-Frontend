import type { SsoCallbackResult, SsoProvider } from "../../domain/entities/SsoProvider";
import { SsoProvider as SsoProviderEntity } from "../../domain/entities/SsoProvider";
import type { SsoCallbackResultDto, SsoProviderDto } from "../models/SsoModels";

export class SsoMapper {
  /** Maps an API provider DTO to the domain `SsoProvider` entity. */
  static providerToDomain(model: SsoProviderDto): SsoProvider {
    return new SsoProviderEntity({
      id: model.id ?? "",
      name: model.name ?? "",
      slug: model.slug ?? "",
      protocol: model.protocol ?? "oidc",
      iconUrl: model.iconUrl ?? null,
      buttonColor: model.buttonColor ?? null,
      buttonLabel: model.buttonLabel ?? null,
      displayOrder: model.displayOrder ?? 0,
      isActive: model.isActive ?? true,
      trustIdpMfa: model.trustIdpMfa ?? false,
      scope: model.scope ?? "Global",
    });
  }

  /** Maps an API callback response DTO to the domain `SsoCallbackResult`. */
  static callbackResultToDomain(dto: SsoCallbackResultDto): SsoCallbackResult {
    return {
      type: dto.type,
      linked: Boolean(dto.linked),
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      expiresAt: dto.expiresAt,
      providerName: dto.providerName ?? "",
      email: dto.email ?? "",
      subscriptionStatus: dto.subscriptionStatus,
      gracePhase: dto.gracePhase,
      editionName: dto.editionName,
      requires2FA: Boolean(dto.requires2FA),
      twoFactorPendingToken: dto.twoFactorPendingToken ?? null,
      staySignedIn: Boolean(dto.staySignedIn),
      mustChangePassword: Boolean(dto.mustChangePassword),
      requiresWorkspaceSelection: dto.requiresWorkspaceSelection,
      availableWorkspaces: dto.availableWorkspaces,
      token: dto.token,
      providerKey: dto.providerKey,
      identityProviderId: dto.identityProviderId,
    };
  }
}
