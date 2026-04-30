import { TenantGateway } from "../../domain/entities/TenantGateway";
import type { TenantGatewayModel } from "../models/TenantGatewayModels";

export class TenantGatewayMapper {
  static toEntity(dto: TenantGatewayModel): TenantGateway {
    return new TenantGateway({
      id: dto.id,
      gateway: dto.gateway ?? "",
      displayLabel: dto.displayLabel ?? "",
      merchantId: dto.merchantId ?? "",
      isEnabled: dto.isEnabled ?? false,
      isVerified: dto.isVerified ?? false,
      isTestMode: dto.isTestMode ?? false,
      lastVerifiedAt: dto.lastVerifiedAt ?? null,
      createdAt: dto.createdAt ?? "",
      modifiedAt: dto.modifiedAt ?? null,
    });
  }
}
