import type { SsoCallbackResult, SsoProvider } from "../../domain/entities/SsoProvider";
import { SsoProvider as SsoProviderEntity } from "../../domain/entities/SsoProvider";
import type { SsoCallbackResultDto, SsoProviderDto } from "../models/SsoModels";

export class SsoMapper {
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
    });
  }

  static callbackResultToDomain(dto: SsoCallbackResultDto): SsoCallbackResult {
    return {
      type: dto.type,
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      expiresAt: dto.expiresAt,
      providerName: dto.providerName,
      email: dto.email,
      subscriptionStatus: dto.subscriptionStatus,
      gracePhase: dto.gracePhase,
      editionName: dto.editionName,
      requiresWorkspaceSelection: dto.requiresWorkspaceSelection,
      availableWorkspaces: dto.availableWorkspaces,
      token: dto.token,
      providerKey: dto.providerKey,
      identityProviderId: dto.identityProviderId,
    };
  }
}
