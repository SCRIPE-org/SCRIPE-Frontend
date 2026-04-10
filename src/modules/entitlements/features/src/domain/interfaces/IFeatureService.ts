/**
 * Feature Service Interface (API contract)
 *
 * Defines the contract for feature API operations.
 * Implemented by FeatureService in the data layer.
 */
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import type { FeatureModel, TenantEffectiveFeatureModel } from "../../data/models/FeatureModels";

export interface IFeatureService {
      getAll(params: PaginationParams): Promise<PagedResult<FeatureModel>>;
      getById(id: string): Promise<FeatureModel>;
      create(data: Record<string, unknown>): Promise<{ id: string }>;
      update(id: string, data: Record<string, unknown>): Promise<void>;
      delete(id: string): Promise<void>;
      getTenantResolvedFeatures(tenantId: string): Promise<any[]>;
      getEffective(tenantId?: string): Promise<TenantEffectiveFeatureModel[]>;
}
