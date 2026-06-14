"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { authContainer } from "@modules/auth/di";
import type { OnboardingQuestion } from "../../domain/entities/OnboardingEntities";
import { DiscoveryQuestion } from "./discovery/DiscoveryQuestion";
import { slideVariants, dotVariants } from "./discovery/discoveryConstants";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DiscoveryStepProps {
  /** Called when the user finishes all visible questions (or skips all). */
  onComplete: (answers: Record<string, string[]>) => void;
  /** Initial answers from persisted wizard state (Stripe round-trip resume). */
  initialAnswers?: {
    businessType: string | null;
    teamSize: string | null;
    primaryPriority: string | null;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determine which questions are visible given the current answers.
 * A question is visible if it has no dependency, or if the answer to its
 * dependency question contains the required value.
 */
function getVisibleQuestions(
  allQuestions: OnboardingQuestion[],
  answers: Record<string, string[]>
): OnboardingQuestion[] {
  return allQuestions
    .filter((q) => {
      if (!q.dependsOnQuestionKey) return true;
      const depAnswer = answers[q.dependsOnQuestionKey] ?? [];
      return q.dependsOnAnswerValue
        ? depAnswer.includes(q.dependsOnAnswerValue)
        : depAnswer.length > 0;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Seed initial answers from the legacy wizard state shape (businessType /
 * teamSize / primaryPriority) so users resuming from Stripe get pre-filled
 * answers on the first two canonical questions.
 */
function seedInitialAnswers(
  initialAnswers?: DiscoveryStepProps["initialAnswers"]
): Record<string, string[]> {
  const seed: Record<string, string[]> = {};
  if (!initialAnswers) return seed;
  if (initialAnswers.businessType) seed["business_type"] = [initialAnswers.businessType];
  if (initialAnswers.teamSize) seed["team_size"] = [initialAnswers.teamSize];
  if (initialAnswers.primaryPriority) {
    seed["primary_priority"] = initialAnswers.primaryPriority.split(",").filter(Boolean);
  }
  return seed;
}

// ─── Skeleton (while flow is loading) ────────────────────────────────────────

function DiscoverySkeleton({ tokens }: { tokens: ReturnType<typeof useSignupTheme>["tokens"] }) {
  return (
    <div className="space-y-6">
      {/* Headline skeleton */}
      <div className="space-y-2">
        <div
          className="h-7 w-2/3 animate-pulse rounded-lg"
          style={{ background: tokens.surfaceRaised }}
        />
        <div
          className="h-4 w-1/2 animate-pulse rounded-md"
          style={{ background: tokens.surfaceRaised, opacity: 0.6 }}
        />
      </div>
      {/* Options grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl"
            style={{ background: tokens.surfaceRaised, opacity: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Reduced-motion guard ─────────────────────────────────────────────────────

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// ─── DiscoveryStep ────────────────────────────────────────────────────────────

/**
 * DiscoveryStep — engine-driven adaptive question renderer.
 *
 * Responsibilities:
 *   • Fetches the onboarding flow from the Onboarding Intelligence Engine API
 *   • Derives visible questions from the current answers (adaptive logic)
 *   • Shows one question at a time with slide transitions
 *   • Navigates forward / backward through visible questions only
 *   • Calls onComplete(answers) when the user finishes or skips all questions
 *
 * All question data (labels, hints, options, icons) comes from the backend.
 * No hardcoded question content — zero translations here.
 */
export function DiscoveryStep({ onComplete, initialAnswers }: DiscoveryStepProps) {
  const { t, language } = useI18n();
  const { tokens } = useSignupTheme();

  // ── Fetch flow from the engine ───────────────────────────────────────────
  const {
    data: flow,
    isLoading: isFlowLoading,
    isError: isFlowError,
    refetch,
  } = useQuery({
    queryKey: ["signup-onboarding-flow", language],
    queryFn: () => authContainer.signupRepository.getOnboardingFlow(undefined, language),
    staleTime: 10 * 60 * 1000, // 10 min — flow is stable per session
    retry: 1,
  });

  // ── Local state ─────────────────────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string[]>>(() =>
    seedInitialAnswers(initialAnswers)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // ── Derive visible questions ─────────────────────────────────────────────
  const allQuestions = flow?.questions ?? [];
  const visibleQuestions = getVisibleQuestions(allQuestions, answers);
  const currentQuestion: OnboardingQuestion | undefined = visibleQuestions[currentIndex];
  const isLastQuestion = currentIndex === visibleQuestions.length - 1;
  const totalVisible = visibleQuestions.length;

  // ── Toggle an answer value ───────────────────────────────────────────────
  const handleToggle = useCallback(
    (questionKey: string, value: string, questionType: string, maxSelections: number) => {
      setAnswers((prev) => {
        const current = prev[questionKey] ?? [];
        if (questionType === "single_select") {
          // Deselect if already selected, otherwise replace
          return { ...prev, [questionKey]: current.includes(value) ? [] : [value] };
        }
        // Multi-select
        if (current.includes(value)) {
          return { ...prev, [questionKey]: current.filter((v) => v !== value) };
        }
        if (maxSelections > 0 && current.length >= maxSelections) {
          // Sliding queue: drop oldest, add newest
          return { ...prev, [questionKey]: [...current.slice(1), value] };
        }
        return { ...prev, [questionKey]: [...current, value] };
      });
    },
    []
  );

  // ── Navigation ───────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete(answers);
      return;
    }
    setDirection(1);
    setCurrentIndex((i) => i + 1);
  }, [isLastQuestion, answers, onComplete]);

  const goBack = useCallback(() => {
    if (currentIndex === 0) return;
    setDirection(-1);
    setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const skipCurrent = useCallback(() => {
    if (isLastQuestion) {
      onComplete(answers);
      return;
    }
    setDirection(1);
    setCurrentIndex((i) => i + 1);
  }, [isLastQuestion, answers, onComplete]);

  const skipAll = useCallback(() => {
    onComplete({});
  }, [onComplete]);

  // ── Can advance? ─────────────────────────────────────────────────────────
  const currentAnswers = currentQuestion ? (answers[currentQuestion.key] ?? []) : [];
  const canAdvance =
    !currentQuestion ||
    !currentQuestion.isRequired ||
    (currentQuestion.isRequired && currentAnswers.length >= currentQuestion.minSelections);

  // ── Loading state ────────────────────────────────────────────────────────
  if (isFlowLoading) {
    return (
      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 md:py-16">
        <DiscoverySkeleton tokens={tokens} />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (isFlowError || allQuestions.length === 0) {
    return (
      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 md:py-16">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm" style={{ color: tokens.inkMuted }}>
            {t("signup.discovery.loadError") ||
              "Couldn't load questions. You can skip and go straight to plans."}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: tokens.surfaceRaised,
                border: tokens.borderCard,
                color: tokens.ink,
              }}
            >
              {t("signup.discovery.retry") || "Retry"}
            </button>
            <button
              type="button"
              onClick={skipAll}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: tokens.gradientCta,
                color: "#fff",
              }}
            >
              {t("signup.discovery.skipAll") || "Skip to plans"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 py-8 md:py-16">
      {/* ── Progress dots ── */}
      {totalVisible > 1 && (
        <div className="mb-8 flex items-center justify-center gap-2">
          {visibleQuestions.map((_, i) => (
            <motion.div
              key={i}
              variants={dotVariants}
              animate={i === currentIndex ? "active" : "inactive"}
              className="rounded-full"
              style={{
                width: i === currentIndex ? 20 : 8,
                height: 8,
                background: i === currentIndex ? tokens.accent : tokens.inkGhost,
                transition: "width 0.25s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Question ── */}
      <AnimatePresence custom={direction} mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.key}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <DiscoveryQuestion
              question={currentQuestion}
              selectedValues={currentAnswers}
              onToggle={(value) =>
                handleToggle(
                  currentQuestion.key,
                  value,
                  currentQuestion.questionType,
                  currentQuestion.maxSelections
                )
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation buttons ── */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {/* Back */}
        <div className="flex-1">
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: tokens.surfaceRaised,
                border: tokens.borderCard,
                color: tokens.inkMuted,
              }}
            >
              {t("signup.discovery.back") || "← Back"}
            </button>
          )}
        </div>

        {/* Skip (only if not required) + Next */}
        <div className="flex items-center gap-2">
          {currentQuestion && !currentQuestion.isRequired && (
            <button
              type="button"
              onClick={skipCurrent}
              className="rounded-lg px-4 py-2 text-sm transition-opacity hover:opacity-80"
              style={{ color: tokens.inkFaint }}
            >
              {t("signup.discovery.skip") || "Skip"}
            </button>
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: tokens.gradientCta }}
          >
            {isLastQuestion
              ? t("signup.discovery.seePlans") || "See plans →"
              : t("signup.discovery.next") || "Next →"}
          </button>
        </div>
      </div>

      {/* ── Global skip-all ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.8 }}
        className="mt-10 flex justify-center"
      >
        <button
          type="button"
          onClick={skipAll}
          className="text-[11px] underline-offset-2 hover:underline"
          style={{ color: tokens.inkGhost }}
        >
          {t("signup.discovery.skipAll") || "Skip all questions · Take me straight to plans"}
        </button>
      </motion.div>
    </div>
  );
}
