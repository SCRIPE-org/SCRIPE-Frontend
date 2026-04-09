/**
 * Feature Repository Interface
 */
import type { Feature } from "../entities/Feature";
import type { TenantEffectiveFeature } from "../entities/TenantEffectiveFeature";
import type { CreateFeatureRequest, UpdateFeatureRequest } from "../entities/FeatureRequests";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface IFeatureRepository {
      getAll(params: PaginationParams): Promise<PagedResult<Feature>>;
      getById(id: string): Promise<Feature>;
      create(request: CreateFeatureRequest): Promise<string>;
      update(id: string, request: UpdateFeatureRequest): Promise<void>;
      delete(id: string): Promise<void>;
      getTenantResolvedFeatures(tenantId: string): Promise<any[]>;
      getEffective(tenantId?: string): Promise<TenantEffectiveFeature[]>;
}
