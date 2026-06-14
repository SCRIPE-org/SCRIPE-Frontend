import type {
  PagedOnboardingQuestionsModel,
  OnboardingQuestionDetailModel,
} from "../../data/models/OnboardingQuestionModels";
import type { OnboardingQuestionsListParams } from "./IOnboardingQuestionRepository";
import type {
  CreateOnboardingQuestionRequest,
  UpdateOnboardingQuestionRequest,
} from "../entities/OnboardingQuestionRequests";

export interface IOnboardingQuestionService {
  getAll(params: OnboardingQuestionsListParams): Promise<PagedOnboardingQuestionsModel>;
  getById(id: string): Promise<OnboardingQuestionDetailModel>;
  create(request: CreateOnboardingQuestionRequest): Promise<{ id: string }>;
  update(id: string, request: UpdateOnboardingQuestionRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
