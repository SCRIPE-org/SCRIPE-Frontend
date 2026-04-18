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
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";

export class TenantPlanService implements ITenantPlanService {
  constructor(private readonly api: IApiService) {}

  // ── Plans ──
  async getAll(params: PaginationParams): Promise<PagedResult<TenantPlanListModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
    return this.api.get<PagedResult<TenantPlanListModel>>(url);
  }

  async getById(id: string): Promise<TenantPlanModel> {
    return this.api.get<TenantPlanModel>(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.BY_ID(id));
  }

  async create(data: CreateTenantPlanRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.CREATE, data);
  }

  async update(id: string, data: UpdateTenantPlanRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.DELETE(id));
  }

  async publish(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.PUBLISH(id), {});
  }

  async archive(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.ARCHIVE(id), {});
  }

  // ── Feature Definitions ──
  async getFeatureDefinitions(params: PaginationParams & { category?: string }): Promise<PagedResult<TenantFeatureDefinitionListModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURE_DEFINITIONS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      category: params.category || undefined,
    });
    return this.api.get<PagedResult<TenantFeatureDefinitionListModel>>(url);
  }

  async getActiveFeatureDefinitions(): Promise<TenantFeatureDefinitionListModel[]> {
    return this.api.get<TenantFeatureDefinitionListModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURE_DEFINITIONS.ACTIVE
    );
  }

  async createFeatureDefinition(data: CreateFeatureDefinitionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURE_DEFINITIONS.CREATE, data);
  }

  async updateFeatureDefinition(id: string, data: UpdateFeatureDefinitionRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURE_DEFINITIONS.UPDATE(id), data);
  }

  async deleteFeatureDefinition(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURE_DEFINITIONS.DELETE(id));
  }

  // ── Promotions ──
  async getPromotions(params: PaginationParams & { planId?: string }): Promise<PagedResult<TenantPlanPromotionListModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLAN_PROMOTIONS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      planId: params.planId || undefined,
    });
    return this.api.get<PagedResult<TenantPlanPromotionListModel>>(url);
  }

  async createPromotion(data: CreatePromotionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLAN_PROMOTIONS.CREATE, data);
  }

  async updatePromotion(id: string, data: UpdatePromotionRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLAN_PROMOTIONS.UPDATE(id), data);
  }

  async deletePromotion(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLAN_PROMOTIONS.DELETE(id));
  }

  async validatePromoCode(code: string, planId?: string): Promise<{ isValid: boolean; message?: string }> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLAN_PROMOTIONS.VALIDATE, {
      code,
      planId: planId || undefined,
    });
    return this.api.get<{ isValid: boolean; message?: string }>(url);
  }
}
