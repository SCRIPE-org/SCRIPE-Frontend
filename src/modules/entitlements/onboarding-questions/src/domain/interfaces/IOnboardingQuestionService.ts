import type {
  PagedOnboardingQuestionsModel,
  OnboardingQuestionDetailModel,
  AnswerOptionModel,
} from "../../data/models/OnboardingQuestionModels";
import type { OnboardingQuestionsListParams } from "./IOnboardingQuestionRepository";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
  AnswerOptionRequest,
} from "../entities/OnboardingQuestionRequests";

/**
 * Interface defining operations for the OnboardingQuestion network service.
 */
export interface IOnboardingQuestionService {
  getAll(params: OnboardingQuestionsListParams): Promise<PagedOnboardingQuestionsModel>;
  getById(id: string): Promise<OnboardingQuestionDetailModel>;
  create(request: CreateOnboardingQuestionRequest): Promise<{ id: string }>;
  update(id: string, request: UpdateOnboardingQuestionRequest): Promise<void>;
  delete(id: string): Promise<void>;

  // ── Answer Options ──
  listOptions(questionId: string): Promise<AnswerOptionModel[]>;
  createOption(questionId: string, request: AnswerOptionRequest): Promise<{ id: string }>;
  updateOption(questionId: string, optionId: string, request: AnswerOptionRequest): Promise<void>;
  deleteOption(questionId: string, optionId: string): Promise<void>;
  reorderOptions(questionId: string, orderedIds: string[]): Promise<void>;
}
