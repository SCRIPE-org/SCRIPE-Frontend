/**
 * Domain model representing a Answer Option Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Create Onboarding Question Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Update Onboarding Question Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type UpdateOnboardingQuestionRequest = CreateOnboardingQuestionRequest;
