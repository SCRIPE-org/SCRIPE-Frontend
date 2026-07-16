import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
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

/**
 * Http API network service for onboarding question.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class OnboardingQuestionService implements IOnboardingQuestionService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: OnboardingQuestionsListParams): Promise<PagedOnboardingQuestionsModel> {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page ?? 1));
    qs.set("pageSize", String(params.pageSize ?? 20));
    if (params.search) qs.set("search", params.search);
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    if (params.includeInactive) qs.set("includeInactive", "true");
    return this.api.get<PagedOnboardingQuestionsModel>(
      `${API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_QUESTIONS.LIST}?${qs.toString()}`
    );
  }

  async getById(id: string): Promise<OnboardingQuestionDetailModel> {
    return this.api.get<OnboardingQuestionDetailModel>(
      API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_QUESTIONS.BY_ID(id)
    );
  }

  async create(request: CreateOnboardingQuestionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_QUESTIONS.CREATE,
      request
    );
  }

  async update(id: string, request: UpdateOnboardingQuestionRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_QUESTIONS.UPDATE(id), request);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_QUESTIONS.DELETE(id));
  }

  async listOptions(questionId: string): Promise<AnswerOptionModel[]> {
    return this.api.get<AnswerOptionModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_ANSWER_OPTIONS.LIST(questionId)
    );
  }

  async createOption(questionId: string, request: AnswerOptionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_ANSWER_OPTIONS.CREATE(questionId),
      request
    );
  }

  async updateOption(
    questionId: string,
    optionId: string,
    request: AnswerOptionRequest
  ): Promise<void> {
    await this.api.put(
      API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_ANSWER_OPTIONS.UPDATE(questionId, optionId),
      request
    );
  }

  async deleteOption(questionId: string, optionId: string): Promise<void> {
    await this.api.delete(
      API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_ANSWER_OPTIONS.DELETE(questionId, optionId)
    );
  }

  async reorderOptions(questionId: string, orderedIds: string[]): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.ONBOARDING_ANSWER_OPTIONS.REORDER(questionId), {
      orderedOptionIds: orderedIds,
    });
  }
}
