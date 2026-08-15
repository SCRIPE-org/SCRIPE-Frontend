/**
 * TenantPlan Service — API calls only (Elevated Tier 2)
 *
 * Implements ITenantPlanService with typed request DTOs.
 * TenantId is resolved server-side from JWT context — not sent as query param.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { ITenantPlanService } from "../../domain/interfaces/ITenantPlanService";
import type {
  TenantPlanModel,
  TenantPlanListModel,
  TenantFeatureDefinitionModel,
  TenantFeatureDefinitionListModel,
  TenantPlanPromotionListModel,
} from "../models/TenantPlanModels";
import type {
  CreateTenantPlanRequest,
  UpdateTenantPlanRequest,
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../../domain/entities/TenantPlanRequests";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { TENANT_PLANS_ENDPOINTS } from "./tenant-plans.endpoints";

/**
 * Http API network service for tenant plan.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class TenantPlanService implements ITenantPlanService {
  constructor(private readonly api: IApiService) {}

  // ── Plans ──
  async getAll(params: PaginationParams): Promise<PagedResult<TenantPlanListModel>> {
    const url = buildUrl(TENANT_PLANS_ENDPOINTS.TENANT_PLANS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
    return this.api.get<PagedResult<TenantPlanListModel>>(url);
  }

  async getById(id: string): Promise<TenantPlanModel> {
    return this.api.get<TenantPlanModel>(TENANT_PLANS_ENDPOINTS.TENANT_PLANS.BY_ID(id));
  }

  async create(data: CreateTenantPlanRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(TENANT_PLANS_ENDPOINTS.TENANT_PLANS.CREATE, data);
  }

  async update(id: string, data: UpdateTenantPlanRequest): Promise<void> {
    await this.api.put(TENANT_PLANS_ENDPOINTS.TENANT_PLANS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(TENANT_PLANS_ENDPOINTS.TENANT_PLANS.DELETE(id));
  }

  async publish(id: string, changeNotes?: string): Promise<void> {
    await this.api.post(TENANT_PLANS_ENDPOINTS.TENANT_PLANS.PUBLISH(id), {
      changeNotes: changeNotes ?? null,
    });
  }

  async archive(id: string): Promise<void> {
    await this.api.post(TENANT_PLANS_ENDPOINTS.TENANT_PLANS.ARCHIVE(id), {});
  }

  // ── Feature Definitions ──
  async getFeatureDefinitions(
    params: PaginationParams & { category?: string }
  ): Promise<PagedResult<TenantFeatureDefinitionListModel>> {
    const url = buildUrl(TENANT_PLANS_ENDPOINTS.TENANT_FEATURE_DEFINITIONS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      category: params.category || undefined,
    });
    return this.api.get<PagedResult<TenantFeatureDefinitionListModel>>(url);
  }

  async getActiveFeatureDefinitions(): Promise<TenantFeatureDefinitionListModel[]> {
    return this.api.get<TenantFeatureDefinitionListModel[]>(
      TENANT_PLANS_ENDPOINTS.TENANT_FEATURE_DEFINITIONS.ACTIVE
    );
  }

  async getActiveGroupedFeatureDefinitions(): Promise<
    import("../models/TenantPlanModels").TenantFeatureDefinitionCategoryGroupModel[]
  > {
    // GET /tenant-feature-definitions/active/grouped — backend already groups by category
    return this.api.get(TENANT_PLANS_ENDPOINTS.TENANT_FEATURE_DEFINITIONS.ACTIVE_GROUPED);
  }

  async getFeatureDefinitionById(id: string): Promise<TenantFeatureDefinitionModel> {
    return this.api.get<TenantFeatureDefinitionModel>(
      TENANT_PLANS_ENDPOINTS.TENANT_FEATURE_DEFINITIONS.BY_ID(id)
    );
  }

  async createFeatureDefinition(data: CreateFeatureDefinitionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      TENANT_PLANS_ENDPOINTS.TENANT_FEATURE_DEFINITIONS.CREATE,
      data
    );
  }

  async updateFeatureDefinition(id: string, data: UpdateFeatureDefinitionRequest): Promise<void> {
    await this.api.put(TENANT_PLANS_ENDPOINTS.TENANT_FEATURE_DEFINITIONS.UPDATE(id), data);
  }

  async deleteFeatureDefinition(id: string): Promise<void> {
    await this.api.delete(TENANT_PLANS_ENDPOINTS.TENANT_FEATURE_DEFINITIONS.DELETE(id));
  }

  // ── Promotions ──
  async getPromotions(
    params: PaginationParams & { planId?: string }
  ): Promise<PagedResult<TenantPlanPromotionListModel>> {
    const url = buildUrl(TENANT_PLANS_ENDPOINTS.TENANT_PLAN_PROMOTIONS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      planId: params.planId || undefined,
    });
    return this.api.get<PagedResult<TenantPlanPromotionListModel>>(url);
  }

  async createPromotion(data: CreatePromotionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      TENANT_PLANS_ENDPOINTS.TENANT_PLAN_PROMOTIONS.CREATE,
      data
    );
  }

  async updatePromotion(id: string, data: UpdatePromotionRequest): Promise<void> {
    await this.api.put(TENANT_PLANS_ENDPOINTS.TENANT_PLAN_PROMOTIONS.UPDATE(id), data);
  }

  async deletePromotion(id: string): Promise<void> {
    await this.api.delete(TENANT_PLANS_ENDPOINTS.TENANT_PLAN_PROMOTIONS.DELETE(id));
  }

  async validatePromoCode(
    code: string,
    planId?: string
  ): Promise<{ isValid: boolean; message?: string }> {
    return this.api.post<{ isValid: boolean; message?: string }>(
      TENANT_PLANS_ENDPOINTS.TENANT_PLAN_PROMOTIONS.VALIDATE,
      { code, tenantPlanId: planId ?? null }
    );
  }
}
