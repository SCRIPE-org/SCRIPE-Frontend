import type { OnboardingQuestion, AnswerOptionData } from "../entities/OnboardingQuestion";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
  AnswerOptionRequest,
} from "../entities/OnboardingQuestionRequests";
import type { PagedResult } from "@core/interfaces/common.interface";

/**
 * Interface defining property specifications, keys types, and structural contract rules for onboarding questions list params.
 */
export interface OnboardingQuestionsListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  includeInactive?: boolean;
}

/**
 * Repository layer implementing client request queries for i onboarding question.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IOnboardingQuestionRepository {
  getAll(params: OnboardingQuestionsListParams): Promise<PagedResult<OnboardingQuestion>>;
  getById(id: string): Promise<OnboardingQuestion>;
  create(request: CreateOnboardingQuestionRequest): Promise<string>;
  update(id: string, request: UpdateOnboardingQuestionRequest): Promise<void>;
  delete(id: string): Promise<void>;

  // ── Answer Options ──
  listOptions(questionId: string): Promise<AnswerOptionData[]>;
  createOption(questionId: string, request: AnswerOptionRequest): Promise<string>;
  updateOption(questionId: string, optionId: string, request: AnswerOptionRequest): Promise<void>;
  deleteOption(questionId: string, optionId: string): Promise<void>;
  reorderOptions(questionId: string, orderedIds: string[]): Promise<void>;
}
