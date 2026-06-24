/**
 * Feature Service Interface (API contract)
 *
 * Defines the contract for feature API operations.
 * Implemented by FeatureService in the data layer.
 * Returns raw DTOs (models) — never domain entities.
 */
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import type {
  FeatureModel,
  TenantEffectiveFeatureModel,
  FeatureModuleGroupModel,
} from "../../data/models/FeatureModels";
import type { CreateFeatureRequest, UpdateFeatureRequest } from "../entities/FeatureRequests";

/**
 * Interface defining operations for the Feature network service.
 */
export interface IFeatureService {
  getAll(params: PaginationParams): Promise<PagedResult<FeatureModel>>;
  getById(id: string): Promise<FeatureModel>;
  create(data: CreateFeatureRequest): Promise<{ id: string }>;
  update(id: string, data: UpdateFeatureRequest): Promise<void>;
  delete(id: string): Promise<void>;
  getTenantResolvedFeatures(tenantId: string): Promise<TenantEffectiveFeatureModel[]>;
  getEffective(tenantId?: string): Promise<TenantEffectiveFeatureModel[]>;
  /** Get all features grouped by Module → Category from backend */
  getGrouped(search?: string): Promise<FeatureModuleGroupModel[]>;
}
