/**
 * Interface structure detailing the properties and attributes of Answer Option Request.
 */
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

/**
 * Interface structure detailing the properties and attributes of Create Onboarding Question Request.
 */
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

/**
 * Type declaration definition describing the schema of update onboarding question request.
 */
export type UpdateOnboardingQuestionRequest = CreateOnboardingQuestionRequest;
