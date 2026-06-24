/**
 * Interface structure detailing the properties and attributes of Answer Option Model.
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
 * Interface structure detailing the properties and attributes of Onboarding Question List Model.
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
 * Interface structure detailing the properties and attributes of Onboarding Question Detail Model.
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
 * Interface structure detailing the properties and attributes of Paged Onboarding Questions Model.
 */
export interface PagedOnboardingQuestionsModel {
  items: OnboardingQuestionListModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
