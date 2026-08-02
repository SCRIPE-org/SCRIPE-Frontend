import type { TenantBranding } from "../../domain/entities/TenantBranding";
import type { ITenantResolutionRepository } from "../../domain/interfaces/ITenantResolutionRepository";
import type { ITenantResolutionService } from "../interfaces/ITenantResolutionService";
import { TenantBrandingMapper } from "../mappers/TenantBrandingMapper";

export class TenantResolutionRepository implements ITenantResolutionRepository {
  constructor(private readonly service: ITenantResolutionService) {}

  async resolveTenant(params: {
    code?: string | null;
    domain?: string | null;
    page?: string | null;
  }): Promise<TenantBranding | null> {
    const model = await this.service.resolveTenant(params);
    return model ? TenantBrandingMapper.toDomain(model) : null;
  }
}
