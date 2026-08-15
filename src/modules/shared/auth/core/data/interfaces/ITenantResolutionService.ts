import type { TenantBrandingModel } from "../models/TenantBrandingModel";

export interface ITenantResolutionService {
  resolveTenant(params: {
    code?: string | null;
    domain?: string | null;
    page?: string | null;
  }): Promise<TenantBrandingModel | null>;
}
