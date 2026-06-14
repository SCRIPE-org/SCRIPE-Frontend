// ═══════════════════════════════════════════════════════════════════════════
// Onboarding Intelligence Engine — Domain Entities
//
// Zod schemas + inferred TypeScript types for the dynamic Q&A flow
// returned by the Onboarding Intelligence Engine API endpoints.
//
// Wire shapes mirror the backend DTOs EXACTLY (camelCase via System.Text.Json):
//   • OnboardingAnswerOptionDto         → OnboardingAnswerOptionSchema
//   • OnboardingAnswerOptionConditionDto → OnboardingAnswerOptionConditionSchema
//   • OnboardingQuestionDto             → OnboardingQuestionSchema
//   • OnboardingFlowDto                 → OnboardingFlowSchema
//   • OnboardingRecommendationDto       → OnboardingRecommendationSchema
//   • SignupWelcomeContentDto           → WelcomeContentSchema
//   • GetOnboardingRecommendationQuery  → SignupRecommendationRequestSchema
// ═══════════════════════════════════════════════════════════════════════════

import { z } from "zod";

// ─── Option-level visibility condition ─────────────────────────────────────────
// Mirrors OnboardingAnswerOptionConditionDto. Evaluated entirely client-side so
// changing an earlier answer instantly reshapes which options are visible.
export const OnboardingAnswerOptionConditionSchema = z.object({
  dependsOnQuestionKey: z.string(),
  matchValues: z.array(z.string()),
  // ConditionMatchMode enum name on the wire — currently only "AnyOf".
  matchMode: z.string().default("AnyOf"),
});

export const OnboardingAnswerOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  sublabel: z.string().nullable(),
  iconKey: z.string().nullable(),
  sortOrder: z.number(),
  // Legacy field kept for backward-compatibility; the live flow DTO no longer
  // emits it (the scorer reads SignalWeight server-side).
  signalWeight: z.number().optional().default(0),
  // Boost applied to ranking when this option currently has a satisfied condition.
  relevanceBoost: z.number().default(0),
  // Option-level visibility conditions; empty ⇒ always visible.
  conditions: z.array(OnboardingAnswerOptionConditionSchema).default([]),
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

// ─── Recommendation (response) ─────────────────────────────────────────────────
// Mirrors OnboardingRecommendationDto (data-driven engine). The two diagnostic
// fields (tierKey, isSelfService) are additive and optional for resilience.
export const OnboardingRecommendationSchema = z.object({
  recommendedEditionId: z.string(),
  recommendedEditionName: z.string(),
  score: z.number(),
  reasons: z.array(z.string()),
  // "free" | "pro" | "ultra" | "enterprise"
  tierKey: z.string().optional(),
  isSelfService: z.boolean().optional(),
});

// ─── Recommendation (request) ──────────────────────────────────────────────────
// Mirrors GetOnboardingRecommendationQuery { CategoryId?, Answers[], Lang } where
// each AnswerInput is { QuestionKey, SelectedValues[] }.
export const OnboardingAnswerInputSchema = z.object({
  questionKey: z.string(),
  selectedValues: z.array(z.string()),
});

export const SignupRecommendationRequestSchema = z.object({
  categoryId: z.string().nullable().optional(),
  answers: z.array(OnboardingAnswerInputSchema),
  lang: z.string().default("en"),
});

// ─── Welcome + trust content ───────────────────────────────────────────────────
// Mirrors SignupWelcomeContentDto + SignupTrustMarkDto + SignupCustomerLogoDto.
export const WelcomeTrustMarkSchema = z.object({
  key: z.string(),
  kind: z.string(),
  label: z.string(),
  iconKey: z.string().nullable(),
  assetUrl: z.string().nullable(),
});

export const WelcomeCustomerLogoSchema = z.object({
  key: z.string(),
  name: z.string(),
  assetUrl: z.string(),
});

export const WelcomeContentSchema = z.object({
  headline: z.string(),
  subcopy: z.string(),
  ctaLabel: z.string(),
  trustedByCount: z.number(),
  trustedByLabel: z.string(),
  trustMarks: z.array(WelcomeTrustMarkSchema),
  customerLogos: z.array(WelcomeCustomerLogoSchema),
});

// ─── Inferred types ────────────────────────────────────────────────────────────
export type OnboardingAnswerOptionCondition = z.infer<typeof OnboardingAnswerOptionConditionSchema>;
export type OnboardingAnswerOption = z.infer<typeof OnboardingAnswerOptionSchema>;
export type OnboardingQuestion = z.infer<typeof OnboardingQuestionSchema>;
export type OnboardingFlow = z.infer<typeof OnboardingFlowSchema>;
export type OnboardingRecommendation = z.infer<typeof OnboardingRecommendationSchema>;
export type OnboardingAnswerInput = z.infer<typeof OnboardingAnswerInputSchema>;
export type SignupRecommendationRequest = z.infer<typeof SignupRecommendationRequestSchema>;
export type WelcomeTrustMark = z.infer<typeof WelcomeTrustMarkSchema>;
export type WelcomeCustomerLogo = z.infer<typeof WelcomeCustomerLogoSchema>;
export type WelcomeContent = z.infer<typeof WelcomeContentSchema>;
