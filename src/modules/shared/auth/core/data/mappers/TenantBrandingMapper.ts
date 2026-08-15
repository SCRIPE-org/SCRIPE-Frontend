import type { TenantBranding } from "../../domain/entities/TenantBranding";
import { TenantBranding as TenantBrandingEntity } from "../../domain/entities/TenantBranding";
import type { TenantBrandingModel } from "../models/TenantBrandingModel";

export class TenantBrandingMapper {
  static toDomain(model: TenantBrandingModel): TenantBranding {
    return new TenantBrandingEntity({
      tenantId: model.tenantId ?? "",
      name: model.name ?? "",
      companyName: model.companyName ?? null,
      logoUrl: model.logoUrl ?? null,
      faviconUrl: model.faviconUrl ?? null,
      primaryColor: model.primaryColor ?? null,
      secondaryColor: model.secondaryColor ?? null,
      loginHeadline: model.loginHeadline ?? null,
      loginSubtitle: model.loginSubtitle ?? null,
      identityProviderMode: model.identityProviderMode ?? "inherit",
      status: model.status ?? null,
      statusReason: model.statusReason ?? null,
      loginBrandingJson: model.loginBrandingJson ?? null,
      slotConfigJson: model.slotConfigJson ?? null,
      dashboardThemeJson: model.dashboardThemeJson ?? null,
      isSafeMode: model.isSafeMode ?? false,
    });
  }
}
