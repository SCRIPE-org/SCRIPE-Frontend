export interface AnswerOptionRequest {
  value: string;
  labelEn: string;
  labelAr: string;
  sublabelEn?: string;
  sublabelAr?: string;
  iconKey?: string;
  sortOrder: number;
  signalWeight?: number;
}

export interface CreateOnboardingQuestionRequest {
  key: string;
  editionCategoryId?: string;
  questionType: "SingleSelect" | "MultiSelect";
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  sortOrder: number;
  dependsOnQuestionKey?: string;
  dependsOnAnswerValue?: string;
  labelEn: string;
  labelAr: string;
  hintEn?: string;
  hintAr?: string;
  iconKey?: string;
  options: AnswerOptionRequest[];
}

export type UpdateOnboardingQuestionRequest = CreateOnboardingQuestionRequest;
