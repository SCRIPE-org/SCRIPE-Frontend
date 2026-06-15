import type {
  IOnboardingQuestionRepository,
  OnboardingQuestionsListParams,
} from "../../domain/interfaces/IOnboardingQuestionRepository";
import type { IOnboardingQuestionService } from "../../domain/interfaces/IOnboardingQuestionService";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
  AnswerOptionRequest,
} from "../../domain/entities/OnboardingQuestionRequests";
import { OnboardingQuestionMapper } from "../mappers/OnboardingQuestionMapper";
import type {
  OnboardingQuestion,
  AnswerOptionData,
} from "../../domain/entities/OnboardingQuestion";
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

  async listOptions(questionId: string): Promise<AnswerOptionData[]> {
    try {
      const models = await this.service.listOptions(questionId);
      return models.map((m) => ({
        id: m.id,
        value: m.value,
        labelEn: m.labelEn,
        labelAr: m.labelAr,
        sublabelEn: m.sublabelEn,
        sublabelAr: m.sublabelAr,
        iconKey: m.iconKey,
        sortOrder: m.sortOrder,
        signalWeight: m.signalWeight,
        isActive: m.isActive,
      }));
    } catch (error) {
      // Fallback to fetching the entire question if the options sub-resource endpoint is not yet active/recompiled
      const question = await this.getById(questionId);
      return question.options;
    }
  }

  async createOption(questionId: string, request: AnswerOptionRequest): Promise<string> {
    const result = await this.service.createOption(questionId, request);
    return result.id;
  }

  async updateOption(
    questionId: string,
    optionId: string,
    request: AnswerOptionRequest
  ): Promise<void> {
    await this.service.updateOption(questionId, optionId, request);
  }

  async deleteOption(questionId: string, optionId: string): Promise<void> {
    await this.service.deleteOption(questionId, optionId);
  }

  async reorderOptions(questionId: string, orderedIds: string[]): Promise<void> {
    await this.service.reorderOptions(questionId, orderedIds);
  }
}
