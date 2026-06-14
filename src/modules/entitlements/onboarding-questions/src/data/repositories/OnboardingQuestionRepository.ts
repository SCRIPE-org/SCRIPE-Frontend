import type {
  IOnboardingQuestionRepository,
  OnboardingQuestionsListParams,
} from "../../domain/interfaces/IOnboardingQuestionRepository";
import type { IOnboardingQuestionService } from "../../domain/interfaces/IOnboardingQuestionService";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
} from "../../domain/entities/OnboardingQuestionRequests";
import { OnboardingQuestionMapper } from "../mappers/OnboardingQuestionMapper";
import type { OnboardingQuestion } from "../../domain/entities/OnboardingQuestion";
import type { PagedResult } from "@modules/identity/core/domain/types";

export class OnboardingQuestionRepository implements IOnboardingQuestionRepository {
  constructor(private readonly service: IOnboardingQuestionService) {}

  async getAll(params: OnboardingQuestionsListParams): Promise<PagedResult<OnboardingQuestion>> {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((m) => OnboardingQuestionMapper.toEntity(m)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.page < result.totalPages,
      hasPreviousPage: result.page > 1,
    };
  }

  async getById(id: string): Promise<OnboardingQuestion> {
    const model = await this.service.getById(id);
    return OnboardingQuestionMapper.toEntity(model);
  }

  async create(request: CreateOnboardingQuestionRequest): Promise<string> {
    const result = await this.service.create(request);
    return result.id;
  }

  async update(id: string, request: UpdateOnboardingQuestionRequest): Promise<void> {
    await this.service.update(id, request);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
