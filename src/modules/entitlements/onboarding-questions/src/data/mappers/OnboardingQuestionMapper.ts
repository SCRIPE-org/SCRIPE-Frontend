import { z } from "zod";
import { safeParseApiResponse } from "@core/common/zod-utils";
import { OnboardingQuestion } from "../../domain/entities/OnboardingQuestion";
import type {
  OnboardingQuestionData,
  AnswerOptionData,
} from "../../domain/entities/OnboardingQuestion";
import type {
  OnboardingQuestionDetailModel,
  OnboardingQuestionListModel,
} from "../models/OnboardingQuestionModels";

const AnswerOptionSchema = z.object({
  id: z.string(),
  value: z.string(),
  labelEn: z.string(),
  labelAr: z.string().optional().default(""),
  sublabelEn: z.string().optional().nullable(),
  sublabelAr: z.string().optional().nullable(),
  iconKey: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
  signalWeight: z.number().default(0),
  isActive: z.boolean().default(true),
});

const OnboardingQuestionSchema = z.object({
  id: z.string(),
  key: z.string(),
  editionCategoryId: z.string().optional().nullable(),
  questionType: z.string().default("SingleSelect"),
  minSelections: z.number().default(1),
  maxSelections: z.number().default(1),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().default(0),
  dependsOnQuestionKey: z.string().optional().nullable(),
  dependsOnAnswerValue: z.string().optional().nullable(),
  labelEn: z.string(),
  labelAr: z.string().optional().default(""),
  hintEn: z.string().optional().nullable(),
  hintAr: z.string().optional().nullable(),
  iconKey: z.string().optional().nullable(),
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional().nullable(),
  modifiedAt: z.string().optional().nullable(),
  options: z.array(AnswerOptionSchema).optional().default([]),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class OnboardingQuestionMapper {
  static toEntity(
    model: OnboardingQuestionListModel | OnboardingQuestionDetailModel
  ): OnboardingQuestion {
    const v = safeParseApiResponse(OnboardingQuestionSchema, model, "OnboardingQuestion");

    const data: OnboardingQuestionData = {
      id: v.id,
      key: v.key,
      editionCategoryId: v.editionCategoryId ?? undefined,
      questionType: v.questionType as "SingleSelect" | "MultiSelect",
      minSelections: v.minSelections,
      maxSelections: v.maxSelections,
      isRequired: v.isRequired,
      sortOrder: v.sortOrder,
      dependsOnQuestionKey: v.dependsOnQuestionKey ?? undefined,
      dependsOnAnswerValue: v.dependsOnAnswerValue ?? undefined,
      labelEn: v.labelEn,
      labelAr: v.labelAr,
      hintEn: v.hintEn ?? undefined,
      hintAr: v.hintAr ?? undefined,
      iconKey: v.iconKey ?? undefined,
      isSystem: v.isSystem,
      isActive: v.isActive,
      createdAt: v.createdAt ?? new Date().toISOString(),
      modifiedAt: v.modifiedAt ?? undefined,
      options: v.options.map(
        (o): AnswerOptionData => ({
          id: o.id,
          value: o.value,
          labelEn: o.labelEn,
          labelAr: o.labelAr ?? "",
          sublabelEn: o.sublabelEn ?? undefined,
          sublabelAr: o.sublabelAr ?? undefined,
          iconKey: o.iconKey ?? undefined,
          sortOrder: o.sortOrder,
          signalWeight: o.signalWeight,
          isActive: o.isActive,
        })
      ),
    };

    return new OnboardingQuestion(data);
  }
}
