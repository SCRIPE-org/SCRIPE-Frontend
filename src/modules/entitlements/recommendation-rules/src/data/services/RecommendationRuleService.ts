/**
 * RecommendationRule Service — API calls only
 *
 * Uses centralized API_ENDPOINTS for all endpoint paths.
 * Returns raw DTOs (models) — never domain entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IRecommendationRuleService } from "../../domain/interfaces/IRecommendationRuleService";
import type {
  PagedRecommendationRulesModel,
  RecommendationRuleDetailModel,
} from "../models/RecommendationRuleModels";
import type { PaginationParams } from "@core/interfaces/common.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  CreateRecommendationRuleRequest,
  UpdateRecommendationRuleRequest,
} from "../../domain/entities/RecommendationRuleRequests";

/**
 * API service for executing HTTP calls related to RecommendationRule endpoints.
 */
export class RecommendationRuleService implements IRecommendationRuleService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: PaginationParams): Promise<PagedRecommendationRulesModel> {
    return this.api.get<PagedRecommendationRulesModel>(
      API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_RULES.LIST,
      {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search || undefined,
      }
    );
  }

  async getById(id: string): Promise<RecommendationRuleDetailModel> {
    return this.api.get<RecommendationRuleDetailModel>(
      API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_RULES.BY_ID(id)
    );
  }

  async create(data: CreateRecommendationRuleRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_RULES.CREATE, data);
  }

  async update(id: string, data: UpdateRecommendationRuleRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_RULES.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_RULES.DELETE(id));
  }
}
