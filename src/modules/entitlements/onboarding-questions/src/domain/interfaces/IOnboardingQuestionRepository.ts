import type { OnboardingQuestion, AnswerOptionData } from "../entities/OnboardingQuestion";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
  AnswerOptionRequest,
} from "../entities/OnboardingQuestionRequests";
import type { PagedResult } from "@core/interfaces/common.interface";

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

  // ── Answer Options ──
  listOptions(questionId: string): Promise<AnswerOptionData[]>;
  createOption(questionId: string, request: AnswerOptionRequest): Promise<string>;
  updateOption(questionId: string, optionId: string, request: AnswerOptionRequest): Promise<void>;
  deleteOption(questionId: string, optionId: string): Promise<void>;
  reorderOptions(questionId: string, orderedIds: string[]): Promise<void>;
}
