import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ITenantResolutionService } from "../../domain/interfaces/ITenantResolutionService";
import type { TenantBranding } from "../../domain/entities/TenantBranding";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import { TenantBrandingMapper } from "../mappers/TenantBrandingMapper";
import type { TenantBrandingModel } from "../models/TenantBrandingModel";

export class TenantResolutionService implements ITenantResolutionService {
  constructor(private readonly api: IPublicApiService) {}

  async resolveTenant(params: {
    code?: string | null;
    domain?: string | null;
    page?: string | null;
  }): Promise<TenantBranding | null> {
    const url = buildUrl(API_ENDPOINTS.TENANTS.RESOLVE, {
      code: params.code ?? undefined,
      domain: params.domain ?? undefined,
      page: params.page ?? undefined,
    });
    const model = await this.api.get<TenantBrandingModel>(url);
    return model ? TenantBrandingMapper.toDomain(model) : null;
  }
}
