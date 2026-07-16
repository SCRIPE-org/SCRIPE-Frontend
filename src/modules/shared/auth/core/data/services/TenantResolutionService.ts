import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ITenantResolutionService } from "../interfaces/ITenantResolutionService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type { TenantBrandingModel } from "../models/TenantBrandingModel";

export class TenantResolutionService implements ITenantResolutionService {
  constructor(private readonly api: IPublicApiService) {}

  async resolveTenant(params: {
    code?: string | null;
    domain?: string | null;
    page?: string | null;
  }): Promise<TenantBrandingModel | null> {
    const url = buildUrl(API_ENDPOINTS.TENANTS.RESOLVE, {
      code: params.code ?? undefined,
      domain: params.domain ?? undefined,
      page: params.page ?? undefined,
    });
    return this.api.get<TenantBrandingModel>(url);
  }
}
