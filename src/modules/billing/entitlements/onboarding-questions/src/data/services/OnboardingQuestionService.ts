import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IOnboardingQuestionService } from "../../domain/interfaces/IOnboardingQuestionService";
import type {
  PagedOnboardingQuestionsModel,
  OnboardingQuestionDetailModel,
  AnswerOptionModel,
} from "../models/OnboardingQuestionModels";
import type { OnboardingQuestionsListParams } from "../../domain/interfaces/IOnboardingQuestionRepository";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
  AnswerOptionRequest,
} from "../../domain/entities/OnboardingQuestionRequests";
import { ONBOARDING_QUESTIONS_ENDPOINTS } from "./onboarding-questions.endpoints";

/**
 * Http API network service for onboarding question.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class OnboardingQuestionService implements IOnboardingQuestionService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: OnboardingQuestionsListParams): Promise<PagedOnboardingQuestionsModel> {
    const url = buildUrl(ONBOARDING_QUESTIONS_ENDPOINTS.QUESTIONS.LIST, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      search: params.search || undefined,
      categoryId: params.categoryId || undefined,
      includeInactive: params.includeInactive ? "true" : undefined,
    });
    return this.api.get<PagedOnboardingQuestionsModel>(url);
  }

  async getById(id: string): Promise<OnboardingQuestionDetailModel> {
    return this.api.get<OnboardingQuestionDetailModel>(
      ONBOARDING_QUESTIONS_ENDPOINTS.QUESTIONS.BY_ID(id)
    );
  }

  async create(request: CreateOnboardingQuestionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(ONBOARDING_QUESTIONS_ENDPOINTS.QUESTIONS.CREATE, request);
  }

  async update(id: string, request: UpdateOnboardingQuestionRequest): Promise<void> {
    await this.api.put(ONBOARDING_QUESTIONS_ENDPOINTS.QUESTIONS.UPDATE(id), request);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(ONBOARDING_QUESTIONS_ENDPOINTS.QUESTIONS.DELETE(id));
  }

  async listOptions(questionId: string): Promise<AnswerOptionModel[]> {
    return this.api.get<AnswerOptionModel[]>(
      ONBOARDING_QUESTIONS_ENDPOINTS.OPTIONS.LIST(questionId)
    );
  }

  async createOption(questionId: string, request: AnswerOptionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      ONBOARDING_QUESTIONS_ENDPOINTS.OPTIONS.CREATE(questionId),
      request
    );
  }

  async updateOption(
    questionId: string,
    optionId: string,
    request: AnswerOptionRequest
  ): Promise<void> {
    await this.api.put(
      ONBOARDING_QUESTIONS_ENDPOINTS.OPTIONS.UPDATE(questionId, optionId),
      request
    );
  }

  async deleteOption(questionId: string, optionId: string): Promise<void> {
    await this.api.delete(ONBOARDING_QUESTIONS_ENDPOINTS.OPTIONS.DELETE(questionId, optionId));
  }

  async reorderOptions(questionId: string, orderedIds: string[]): Promise<void> {
    await this.api.put(ONBOARDING_QUESTIONS_ENDPOINTS.OPTIONS.REORDER(questionId), {
      orderedOptionIds: orderedIds,
    });
  }
}
