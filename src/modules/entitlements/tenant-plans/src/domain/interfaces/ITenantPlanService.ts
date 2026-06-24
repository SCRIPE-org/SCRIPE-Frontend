/**
 * TenantPlan Service Interface — Elevated Tier 2
 *
 * Defines the contract for tenant-plan API operations.
 * Implemented by TenantPlanService in the data layer.
 *
 * TenantId is resolved server-side from JWT context — not sent by the client.
 */
import type {
  TenantPlanModel,
  TenantPlanListModel,
  TenantFeatureDefinitionModel,
  TenantFeatureDefinitionListModel,
  TenantPlanPromotionListModel,
} from "../../data/models/TenantPlanModels";
import type {
  CreateTenantPlanRequest,
  UpdateTenantPlanRequest,
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../entities/TenantPlanRequests";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";

/**
 * Interface defining operations for the TenantPlan network service.
 */
export interface ITenantPlanService {
  // Plans
  getAll(params: PaginationParams): Promise<PagedResult<TenantPlanListModel>>;
  getById(id: string): Promise<TenantPlanModel>;
  create(data: CreateTenantPlanRequest): Promise<{ id: string }>;
  update(id: string, data: UpdateTenantPlanRequest): Promise<void>;
  delete(id: string): Promise<void>;
  publish(id: string, changeNotes?: string): Promise<void>;
  archive(id: string): Promise<void>;

  // Feature Definitions
  getFeatureDefinitions(
    params: PaginationParams & { category?: string }
  ): Promise<PagedResult<TenantFeatureDefinitionListModel>>;
  getFeatureDefinitionById(id: string): Promise<TenantFeatureDefinitionModel>;
  getActiveFeatureDefinitions(): Promise<TenantFeatureDefinitionListModel[]>;
  /** GET /tenant-feature-definitions/active/grouped — backend groups by category. Zero client-side groupBy needed. */
  getActiveGroupedFeatureDefinitions(): Promise<
    import("../../data/models/TenantPlanModels").TenantFeatureDefinitionCategoryGroupModel[]
  >;

  createFeatureDefinition(data: CreateFeatureDefinitionRequest): Promise<{ id: string }>;
  updateFeatureDefinition(id: string, data: UpdateFeatureDefinitionRequest): Promise<void>;
  deleteFeatureDefinition(id: string): Promise<void>;

  // Promotions
  getPromotions(
    params: PaginationParams & { planId?: string }
  ): Promise<PagedResult<TenantPlanPromotionListModel>>;
  createPromotion(data: CreatePromotionRequest): Promise<{ id: string }>;
  updatePromotion(id: string, data: UpdatePromotionRequest): Promise<void>;
  deletePromotion(id: string): Promise<void>;
  validatePromoCode(code: string, planId?: string): Promise<{ isValid: boolean; message?: string }>;
}
