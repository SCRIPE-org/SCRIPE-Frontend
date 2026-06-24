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
/**
 * Domain model representing a Onboarding Answer Option Condition Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export const OnboardingAnswerOptionConditionSchema = z.object({
  dependsOnQuestionKey: z.string(),
  matchValues: z.array(z.string()),
  // ConditionMatchMode enum name on the wire — currently only "AnyOf".
  matchMode: z.string().default("AnyOf"),
});

/**
 * Domain model representing a Onboarding Answer Option Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
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

/**
 * Domain model representing a Onboarding Question Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
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

/**
 * Domain model representing a Onboarding Flow Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export const OnboardingFlowSchema = z.object({
  questions: z.array(OnboardingQuestionSchema),
});

// ─── Recommendation (response) ─────────────────────────────────────────────────
// Mirrors OnboardingRecommendationDto (data-driven engine). The two diagnostic
// fields (tierKey, isSelfService) are additive and optional for resilience.
/**
 * Domain model representing a Onboarding Recommendation Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
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
/**
 * Domain model representing a Onboarding Answer Input Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export const OnboardingAnswerInputSchema = z.object({
  questionKey: z.string(),
  selectedValues: z.array(z.string()),
});

/**
 * Domain model representing a Signup Recommendation Request Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export const SignupRecommendationRequestSchema = z.object({
  categoryId: z.string().nullable().optional(),
  answers: z.array(OnboardingAnswerInputSchema),
  lang: z.string().default("en"),
});

// ─── Welcome + trust content ───────────────────────────────────────────────────
// Mirrors SignupWelcomeContentDto + SignupTrustMarkDto + SignupCustomerLogoDto.
/**
 * Domain model representing a Welcome Trust Mark Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export const WelcomeTrustMarkSchema = z.object({
  key: z.string(),
  kind: z.string(),
  label: z.string(),
  iconKey: z.string().nullable(),
  assetUrl: z.string().nullable(),
});

/**
 * Domain model representing a Welcome Customer Logo Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export const WelcomeCustomerLogoSchema = z.object({
  key: z.string(),
  name: z.string(),
  assetUrl: z.string(),
});

/**
 * Domain model representing a Welcome Content Schema structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
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
/**
 * Domain model representing a Onboarding Answer Option Condition structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type OnboardingAnswerOptionCondition = z.infer<typeof OnboardingAnswerOptionConditionSchema>;
/**
 * Domain model representing a Onboarding Answer Option structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type OnboardingAnswerOption = z.infer<typeof OnboardingAnswerOptionSchema>;
/**
 * Domain model representing a Onboarding Question structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type OnboardingQuestion = z.infer<typeof OnboardingQuestionSchema>;
/**
 * Domain model representing a Onboarding Flow structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type OnboardingFlow = z.infer<typeof OnboardingFlowSchema>;
/**
 * Domain model representing a Onboarding Recommendation structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type OnboardingRecommendation = z.infer<typeof OnboardingRecommendationSchema>;
/**
 * Domain model representing a Onboarding Answer Input structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type OnboardingAnswerInput = z.infer<typeof OnboardingAnswerInputSchema>;
/**
 * Domain model representing a Signup Recommendation Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type SignupRecommendationRequest = z.infer<typeof SignupRecommendationRequestSchema>;
/**
 * Domain model representing a Welcome Trust Mark structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type WelcomeTrustMark = z.infer<typeof WelcomeTrustMarkSchema>;
/**
 * Domain model representing a Welcome Customer Logo structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type WelcomeCustomerLogo = z.infer<typeof WelcomeCustomerLogoSchema>;
/**
 * Domain model representing a Welcome Content structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type WelcomeContent = z.infer<typeof WelcomeContentSchema>;
