/**
 * RecommendationRule Service — API calls only
 *
 * Uses local RECOMMENDATION_RULE_ENDPOINTS for all endpoint paths.
 * Returns raw DTOs (models) — never domain entities.
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IRecommendationRuleService } from "../../domain/interfaces/IRecommendationRuleService";
import type {
  PagedRecommendationRulesModel,
  RecommendationRuleDetailModel,
} from "../models/RecommendationRuleModels";
import type { PaginationParams } from "@core/interfaces/common.interface";
import type {
  CreateRecommendationRuleRequest,
  UpdateRecommendationRuleRequest,
} from "../../domain/entities/RecommendationRuleRequests";
import { RECOMMENDATION_RULES_ENDPOINTS } from "./recommendation-rules.endpoints";

/**
 * Http API network service for recommendation rule.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class RecommendationRuleService implements IRecommendationRuleService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: PaginationParams): Promise<PagedRecommendationRulesModel> {
    const url = buildUrl(RECOMMENDATION_RULES_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
    return this.api.get<PagedRecommendationRulesModel>(url);
  }

  async getById(id: string): Promise<RecommendationRuleDetailModel> {
    return this.api.get<RecommendationRuleDetailModel>(RECOMMENDATION_RULES_ENDPOINTS.BY_ID(id));
  }

  async create(data: CreateRecommendationRuleRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(RECOMMENDATION_RULES_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: UpdateRecommendationRuleRequest): Promise<void> {
    await this.api.put(RECOMMENDATION_RULES_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(RECOMMENDATION_RULES_ENDPOINTS.DELETE(id));
  }
}
