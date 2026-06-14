import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IOnboardingQuestionService } from "../../domain/interfaces/IOnboardingQuestionService";
import type {
  PagedOnboardingQuestionsModel,
  OnboardingQuestionDetailModel,
} from "../models/OnboardingQuestionModels";
import type { OnboardingQuestionsListParams } from "../../domain/interfaces/IOnboardingQuestionRepository";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
} from "../../domain/entities/OnboardingQuestionRequests";

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
}
