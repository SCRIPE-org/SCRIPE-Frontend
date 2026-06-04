/**
 * TenantPlan Repository Interface — Elevated Tier 2
 * TenantId is resolved server-side from JWT context.
 */
import type {
  TenantPlan,
  TenantFeatureDefinition,
  TenantPlanPromotion,
} from "../entities/TenantPlan";
import type {
  CreateTenantPlanRequest,
  UpdateTenantPlanRequest,
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../entities/TenantPlanRequests";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface ITenantPlanRepository {
  // Plans
  getAll(params: PaginationParams): Promise<PagedResult<TenantPlan>>;
  getById(id: string): Promise<TenantPlan>;
  create(request: CreateTenantPlanRequest): Promise<string>;
  update(id: string, request: UpdateTenantPlanRequest): Promise<void>;
  delete(id: string): Promise<void>;
  publish(id: string, changeNotes?: string): Promise<void>;
  archive(id: string): Promise<void>;

  // Feature Definitions
  getFeatureDefinitions(
    params: PaginationParams & { category?: string }
  ): Promise<PagedResult<TenantFeatureDefinition>>;
  getFeatureDefinitionById(id: string): Promise<TenantFeatureDefinition>;
  getActiveFeatureDefinitions(): Promise<TenantFeatureDefinition[]>;
  /** Returns active feature definitions pre-grouped by category from the backend. Zero client-side groupBy needed. */
  getActiveGroupedFeatureDefinitions(): Promise<
    import("../entities/TenantPlan").TenantFeatureDefinitionCategoryGroup[]
  >;

  createFeatureDefinition(request: CreateFeatureDefinitionRequest): Promise<string>;
  updateFeatureDefinition(id: string, request: UpdateFeatureDefinitionRequest): Promise<void>;
  deleteFeatureDefinition(id: string): Promise<void>;

  // Promotions
  getPromotions(
    params: PaginationParams & { planId?: string }
  ): Promise<PagedResult<TenantPlanPromotion>>;
  createPromotion(request: CreatePromotionRequest): Promise<string>;
  updatePromotion(id: string, request: UpdatePromotionRequest): Promise<void>;
  deletePromotion(id: string): Promise<void>;
  validatePromoCode(code: string, planId?: string): Promise<{ isValid: boolean; message?: string }>;
}
