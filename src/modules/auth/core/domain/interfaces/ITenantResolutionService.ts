import type { TenantBranding } from "../entities/TenantBranding";

export interface ITenantResolutionService {
  resolveTenant(params: {
    code?: string | null;
    domain?: string | null;
    page?: string | null;
  }): Promise<TenantBranding | null>;
}

