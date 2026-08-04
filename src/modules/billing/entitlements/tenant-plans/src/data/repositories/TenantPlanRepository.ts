/**
 * TenantPlan Repository — uses Service + Mapper (Elevated Tier 2)
 *
 * Repository calls Service (typed DTOs), maps results to Entities.
 * NEVER imports IApiService or API_ENDPOINTS directly.
 *
 * TenantId is resolved server-side from JWT context.
 */
import type { ITenantPlanRepository } from "../../domain/interfaces/ITenantPlanRepository";
import type {
  TenantPlan,
  TenantFeatureDefinition,
  TenantPlanPromotion,
} from "../../domain/entities/TenantPlan";
import type {
  CreateTenantPlanRequest,
  UpdateTenantPlanRequest,
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../../domain/entities/TenantPlanRequests";
import { TenantPlanMapper } from "../mappers/TenantPlanMapper";
import type { ITenantPlanService } from "../../domain/interfaces/ITenantPlanService";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";

/**
 * Repository layer implementing client request queries for tenant plan.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class TenantPlanRepository implements ITenantPlanRepository {
  constructor(private readonly service: ITenantPlanService) {}

  // ── Plans ──
  async getAll(params: PaginationParams): Promise<PagedResult<TenantPlan>> {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((m) => TenantPlanMapper.toEntityFromList(m)),
      totalCount: result.totalCount,
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<TenantPlan> {
    const model = await this.service.getById(id);
    return TenantPlanMapper.toEntity(model);
  }

  async create(request: CreateTenantPlanRequest): Promise<string> {
    const response = await this.service.create(request);
    return response.id;
  }

  async update(id: string, request: UpdateTenantPlanRequest): Promise<void> {
    await this.service.update(id, request);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async publish(id: string, changeNotes?: string): Promise<void> {
    await this.service.publish(id, changeNotes);
  }

  async archive(id: string): Promise<void> {
    await this.service.archive(id);
  }

  // ── Feature Definitions ──
  async getFeatureDefinitions(
    params: PaginationParams & { category?: string }
  ): Promise<PagedResult<TenantFeatureDefinition>> {
    const result = await this.service.getFeatureDefinitions(params);
    return {
      items: result.items.map((m) => TenantPlanMapper.toFeatureDefinitionEntity(m)),
      totalCount: result.totalCount,
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getActiveFeatureDefinitions(): Promise<TenantFeatureDefinition[]> {
    const models = await this.service.getActiveFeatureDefinitions();
    return models.map((m) => TenantPlanMapper.toFeatureDefinitionEntity(m));
  }

  async getActiveGroupedFeatureDefinitions(): Promise<
    import("../../domain/entities/TenantPlan").TenantFeatureDefinitionCategoryGroup[]
  > {
    // GET /tenant-feature-definitions/active/grouped — backend pre-groups by category
    const models = await this.service.getActiveGroupedFeatureDefinitions();
    return TenantPlanMapper.toFeatureDefinitionCategoryGroupList(models);
  }

  async getFeatureDefinitionById(id: string): Promise<TenantFeatureDefinition> {
    const model = await this.service.getFeatureDefinitionById(id);
    return TenantPlanMapper.toFeatureDefinitionEntity(model);
  }

  async createFeatureDefinition(request: CreateFeatureDefinitionRequest): Promise<string> {
    const response = await this.service.createFeatureDefinition(request);
    return response.id;
  }

  async updateFeatureDefinition(
    id: string,
    request: UpdateFeatureDefinitionRequest
  ): Promise<void> {
    await this.service.updateFeatureDefinition(id, request);
  }

  async deleteFeatureDefinition(id: string): Promise<void> {
    await this.service.deleteFeatureDefinition(id);
  }

  // ── Promotions ──
  async getPromotions(
    params: PaginationParams & { planId?: string }
  ): Promise<PagedResult<TenantPlanPromotion>> {
    const result = await this.service.getPromotions(params);
    return {
      items: result.items.map((m) => TenantPlanMapper.toPromotionEntity(m)),
      totalCount: result.totalCount,
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async createPromotion(request: CreatePromotionRequest): Promise<string> {
    const response = await this.service.createPromotion(request);
    return response.id;
  }

  async updatePromotion(id: string, request: UpdatePromotionRequest): Promise<void> {
    await this.service.updatePromotion(id, request);
  }

  async deletePromotion(id: string): Promise<void> {
    await this.service.deletePromotion(id);
  }

  async validatePromoCode(
    code: string,
    planId?: string
  ): Promise<{ isValid: boolean; message?: string }> {
    return this.service.validatePromoCode(code, planId);
  }
}
