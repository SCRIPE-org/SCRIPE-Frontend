import type { BaseEntity } from "@core/interfaces/common.interface";

/**
 * Type declaration definition describing the schema of question type.
 */
export type QuestionType = "SingleSelect" | "MultiSelect";

/**
 * Interface structure detailing the properties and attributes of Answer Option Data.
 */
export interface AnswerOptionData {
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
 * Interface structure detailing the properties and attributes of Onboarding Question Data.
 */
export interface OnboardingQuestionData extends BaseEntity {
  key: string;
  editionCategoryId?: string;
  questionType: QuestionType;
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
  isSystem: boolean;
  isActive: boolean;
  options?: AnswerOptionData[];
}

/**
 * Domain entity class representing a Onboarding Question.
 */
export class OnboardingQuestion {
  constructor(public readonly data: OnboardingQuestionData) {}

  get id(): string {
    return this.data.id;
  }
  get key(): string {
    return this.data.key;
  }
  get questionType(): QuestionType {
    return this.data.questionType;
  }
  get labelEn(): string {
    return this.data.labelEn;
  }
  get labelAr(): string {
    return this.data.labelAr;
  }
  get isRequired(): boolean {
    return this.data.isRequired;
  }
  get isSystem(): boolean {
    return this.data.isSystem;
  }
  get sortOrder(): number {
    return this.data.sortOrder;
  }
  get options(): AnswerOptionData[] {
    return this.data.options ?? [];
  }
  get isMultiSelect(): boolean {
    return this.data.questionType === "MultiSelect";
  }

  getLabel(lang: string): string {
    return lang === "ar" ? this.data.labelAr : this.data.labelEn;
  }

  copyWith(updates: Partial<OnboardingQuestionData>): OnboardingQuestion {
    return new OnboardingQuestion({ ...this.data, ...updates });
  }
}
