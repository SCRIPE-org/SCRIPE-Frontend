/**
 * Feature Repository Interface
 *
 * Returns domain entities — never raw DTOs.
 * Implemented by FeatureRepository in the data layer.
 */
import type { Feature, FeatureModuleGroup } from "../entities/Feature";
import type { TenantEffectiveFeature } from "../entities/TenantEffectiveFeature";
import type { CreateFeatureRequest, UpdateFeatureRequest } from "../entities/FeatureRequests";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface IFeatureRepository {
  getAll(params: PaginationParams): Promise<PagedResult<Feature>>;
  getAllFeatures(): Promise<Feature[]>;
  getById(id: string): Promise<Feature>;
  create(request: CreateFeatureRequest): Promise<string>;
  update(id: string, request: UpdateFeatureRequest): Promise<void>;
  delete(id: string): Promise<void>;
  getTenantResolvedFeatures(tenantId: string): Promise<TenantEffectiveFeature[]>;
  getEffective(tenantId?: string): Promise<TenantEffectiveFeature[]>;
  /**
   * Get ALL active features grouped by Module → Category (backend-driven).
   * Used by FeaturesTab and Features Catalog page.
   * Zero client-side groupBy needed.
   */
  getGrouped(search?: string): Promise<FeatureModuleGroup[]>;
}

