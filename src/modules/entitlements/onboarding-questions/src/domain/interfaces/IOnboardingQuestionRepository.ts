import type { OnboardingQuestion } from "../entities/OnboardingQuestion";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
} from "../entities/OnboardingQuestionRequests";
import type { PagedResult } from "@modules/identity/core/domain/types";

export interface OnboardingQuestionsListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  includeInactive?: boolean;
}

export interface IOnboardingQuestionRepository {
  getAll(params: OnboardingQuestionsListParams): Promise<PagedResult<OnboardingQuestion>>;
  getById(id: string): Promise<OnboardingQuestion>;
  create(request: CreateOnboardingQuestionRequest): Promise<string>;
  update(id: string, request: UpdateOnboardingQuestionRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
