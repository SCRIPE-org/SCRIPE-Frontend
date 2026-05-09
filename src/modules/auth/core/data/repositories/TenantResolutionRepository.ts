import type { TenantBranding } from "../../domain/entities/TenantBranding";
import type { ITenantResolutionRepository } from "../../domain/interfaces/ITenantResolutionRepository";
import type { ITenantResolutionService } from "../../domain/interfaces/ITenantResolutionService";

export class TenantResolutionRepository implements ITenantResolutionRepository {
  constructor(private readonly service: ITenantResolutionService) {}

  resolveTenant(params: {
    code?: string | null;
    domain?: string | null;
    page?: string | null;
  }): Promise<TenantBranding | null> {
    return this.service.resolveTenant(params);
  }
}
