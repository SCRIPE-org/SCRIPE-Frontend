/**
 * RecommendationRule Repository — uses Service + Mapper
 *
 * All model→entity conversion goes through RecommendationRuleMapper.
 * Never constructs domain entities directly from models.
 */
import type { IRecommendationRuleRepository } from "../../domain/interfaces/IRecommendationRuleRepository";
import type { IRecommendationRuleService } from "../../domain/interfaces/IRecommendationRuleService";
import type { RecommendationRule } from "../../domain/entities/RecommendationRule";
import { RecommendationRuleMapper } from "../mappers/RecommendationRuleMapper";
import type {
  CreateRecommendationRuleRequest,
  UpdateRecommendationRuleRequest,
} from "../../domain/entities/RecommendationRuleRequests";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";

/**
 * Repository implementation for managing database operations on RecommendationRule resources.
 */
export class RecommendationRuleRepository implements IRecommendationRuleRepository {
  constructor(private readonly service: IRecommendationRuleService) {}

  async getAll(params: PaginationParams): Promise<PagedResult<RecommendationRule>> {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((m) => RecommendationRuleMapper.toEntity(m)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<RecommendationRule> {
    const model = await this.service.getById(id);
    return RecommendationRuleMapper.toEntity(model);
  }

  async create(request: CreateRecommendationRuleRequest): Promise<string> {
    const json = RecommendationRuleMapper.toCreateJson(request);
    const response = await this.service.create(json);
    return response.id;
  }

  async update(id: string, request: UpdateRecommendationRuleRequest): Promise<void> {
    const json = RecommendationRuleMapper.toUpdateJson(request);
    await this.service.update(id, json);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
