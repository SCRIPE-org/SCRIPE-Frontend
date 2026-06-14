/**
 * RecommendationRule Service Interface (API contract)
 *
 * Returns raw DTOs (models) — never domain entities.
 * Implemented by RecommendationRuleService in the data layer.
 */
import type {
  PagedRecommendationRulesModel,
  RecommendationRuleDetailModel,
} from "../../data/models/RecommendationRuleModels";
import type {
  CreateRecommendationRuleRequest,
  UpdateRecommendationRuleRequest,
} from "../entities/RecommendationRuleRequests";
import type { PaginationParams } from "@modules/identity/core/domain/types";

export interface IRecommendationRuleService {
  getAll(params: PaginationParams): Promise<PagedRecommendationRulesModel>;
  getById(id: string): Promise<RecommendationRuleDetailModel>;
  create(data: CreateRecommendationRuleRequest): Promise<{ id: string }>;
  update(id: string, data: UpdateRecommendationRuleRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
