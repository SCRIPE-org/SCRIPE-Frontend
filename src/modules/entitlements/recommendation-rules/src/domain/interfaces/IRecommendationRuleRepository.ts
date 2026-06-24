/**
 * RecommendationRule Repository Interface
 *
 * Returns domain entities — never raw DTOs.
 * Implemented by RecommendationRuleRepository in the data layer.
 */
import type { RecommendationRule } from "../entities/RecommendationRule";
import type {
  CreateRecommendationRuleRequest,
  UpdateRecommendationRuleRequest,
} from "../entities/RecommendationRuleRequests";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";

/**
 * Interface defining repository methods for managing RecommendationRule data access.
 */
export interface IRecommendationRuleRepository {
  getAll(params: PaginationParams): Promise<PagedResult<RecommendationRule>>;
  getById(id: string): Promise<RecommendationRule>;
  create(request: CreateRecommendationRuleRequest): Promise<string>;
  update(id: string, request: UpdateRecommendationRuleRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
