/**
 * Feature Service Interface (API contract)
 *
 * Defines the contract for feature API operations.
 * Implemented by FeatureService in the data layer.
 * Returns raw DTOs (models) — never domain entities.
 */
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import type { FeatureModel, TenantEffectiveFeatureModel } from "../../data/models/FeatureModels";
import type { CreateFeatureRequest, UpdateFeatureRequest } from "../entities/FeatureRequests";

export interface IFeatureService {
  getAll(params: PaginationParams): Promise<PagedResult<FeatureModel>>;
  getById(id: string): Promise<FeatureModel>;
  create(data: CreateFeatureRequest): Promise<{ id: string }>;
  update(id: string, data: UpdateFeatureRequest): Promise<void>;
  delete(id: string): Promise<void>;
  getTenantResolvedFeatures(tenantId: string): Promise<TenantEffectiveFeatureModel[]>;
  getEffective(tenantId?: string): Promise<TenantEffectiveFeatureModel[]>;
}
