/**
 * Interface defining property specifications, keys types, and structural contract rules for answer option model.
 */
export interface AnswerOptionModel {
  id: string;
  value: string;
  labelEn: string;
  labelAr: string;
  sublabelEn?: string;
  sublabelAr?: string;
  iconKey?: string;
  sortOrder: number;
  signalWeight: number;
  isActive: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for onboarding question list model.
 */
export interface OnboardingQuestionListModel {
  id: string;
  key: string;
  editionCategoryId?: string;
  questionType: string;
  sortOrder: number;
  labelEn: string;
  labelAr: string;
  isRequired: boolean;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for onboarding question detail model.
 */
export interface OnboardingQuestionDetailModel extends OnboardingQuestionListModel {
  minSelections: number;
  maxSelections: number;
  dependsOnQuestionKey?: string;
  dependsOnAnswerValue?: string;
  hintEn?: string;
  hintAr?: string;
  iconKey?: string;
  modifiedAt?: string;
  options: AnswerOptionModel[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for paged onboarding questions model.
 */
export interface PagedOnboardingQuestionsModel {
  items: OnboardingQuestionListModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
