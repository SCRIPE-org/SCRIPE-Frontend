// ═══════════════════════════════════════════════════════════════════════════
// Onboarding Intelligence Engine — Domain Entities
//
// Zod schemas + inferred TypeScript types for the dynamic Q&A flow
// returned by the Onboarding Intelligence Engine API endpoints.
// ═══════════════════════════════════════════════════════════════════════════

import { z } from "zod";

export const OnboardingAnswerOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  sublabel: z.string().nullable(),
  iconKey: z.string().nullable(),
  sortOrder: z.number(),
  signalWeight: z.number().optional().default(0),
});

export const OnboardingQuestionSchema = z.object({
  key: z.string(),
  questionType: z.enum(["single", "multi", "single_select", "multi_select"]).transform((val) => {
    if (val === "single") return "single_select";
    if (val === "multi") return "multi_select";
    return val;
  }),
  minSelections: z.number(),
  maxSelections: z.number(),
  isRequired: z.boolean(),
  sortOrder: z.number(),
  dependsOnQuestionKey: z.string().nullable(),
  dependsOnAnswerValue: z.string().nullable(),
  label: z.string(),
  hint: z.string().nullable(),
  iconKey: z.string().nullable(),
  options: z.array(OnboardingAnswerOptionSchema),
});

export const OnboardingFlowSchema = z.object({
  questions: z.array(OnboardingQuestionSchema),
});

export const OnboardingRecommendationSchema = z.object({
  recommendedEditionId: z.string(),
  recommendedEditionName: z.string(),
  score: z.number(),
  reasons: z.array(z.string()),
});

export type OnboardingAnswerOption = z.infer<typeof OnboardingAnswerOptionSchema>;
export type OnboardingQuestion = z.infer<typeof OnboardingQuestionSchema>;
export type OnboardingFlow = z.infer<typeof OnboardingFlowSchema>;
export type OnboardingRecommendation = z.infer<typeof OnboardingRecommendationSchema>;
