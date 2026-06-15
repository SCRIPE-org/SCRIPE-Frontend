"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import {
  getVisibleQuestions,
  getVisibleOptions,
  pruneStaleAnswers,
} from "../../domain/services/onboardingFlow";
import type {
  OnboardingFlow,
  OnboardingQuestion,
  OnboardingAnswerOption,
} from "../../domain/entities/OnboardingEntities";

// ═══════════════════════════════════════════════════════════════════════════
// useDiscovery — the in-phase interaction viewmodel for the adaptive Discovery
// phase (the centerpiece of the Elevate redesign).
//
// Owns EVERYTHING about answering the adaptive Q&A:
//   • fetches the COMPLETE adaptive graph once (getOnboardingFlow(undefined, lang))
//     so all branching is evaluated client-side with zero refetch;
//   • holds the `answers` map (questionKey → selected option values);
//   • derives the currently-visible questions, the current question + its
//     visible+ranked options, all via the pure domain helpers (never reimplemented);
//   • a selection toggle that respects single vs multi + maxSelections, and for
//     multi keeps the FIRST pick as the "top priority";
//   • forward/back navigation over the visible question list;
//   • `canAdvance` (respects isRequired / minSelections);
//   • prunes stale answers on every mutation so changing Q1 clears Q2/Q3 and
//     reducing the scale drops now-hidden priority picks.
//
// Architecture: this is a viewmodel — the ONLY layer here that touches the
// repository. Components consume the returned view object as props and stay dumb.
// The recommendation fetch lives in useSignupWizard (completeDiscovery); this
// hook only collects answers and surfaces the derived businessType + topPriority.
// ═══════════════════════════════════════════════════════════════════════════

/** Q1 — the industry/vertical question. Drives every downstream branch. */
const BUSINESS_TYPE_KEY = "business_type";

export interface DiscoveryResult {
  /** questionKey → selected option values. The canonical collected answer map. */
  answers: Record<string, string[]>;
  /** The chosen industry value (Q1), or null when skipped. */
  businessType: string | null;
  /** The first priority pick across the visible priorities question, or null. */
  topPriority: string | null;
}

export interface DiscoveryViewModel {
  // ── Load state ─────────────────────────────────────────────────────────────
  isLoading: boolean;
  isError: boolean;
  retry: () => void;

  // ── Derived flow ───────────────────────────────────────────────────────────
  /** The live answer map (questionKey → selected values) — for the preview. */
  answers: Record<string, string[]>;
  /** Questions currently visible given the answers, sorted by sortOrder. */
  visibleQuestions: OnboardingQuestion[];
  /** Zero-based index into `visibleQuestions`. Clamped as the set reshapes. */
  currentIndex: number;
  /** The question at `currentIndex`, or undefined when the flow is empty. */
  currentQuestion: OnboardingQuestion | undefined;
  /** Visible + ranked options for the current question (re-ranks live). */
  currentVisibleOptions: OnboardingAnswerOption[];
  /** Selected values for the current question (never undefined). */
  currentSelection: string[];
  /** Total count of visible questions (for the progress dots). */
  totalVisible: number;

  // ── Per-question affordances ────────────────────────────────────────────────
  /** First-pick "top priority" value for the current (multi) question, or null. */
  topPriorityForCurrent: string | null;
  /** True when the current multi question has hit maxSelections. */
  isMaxReached: boolean;
  /** Whether nav may advance from the current question (required/min satisfied). */
  canAdvance: boolean;
  /** Whether the current question is required (controls whether Skip shows). */
  isCurrentRequired: boolean;
  /** True when the current question is the last visible one. */
  isLastQuestion: boolean;
  /** True when there is a previous visible question to go back to. */
  canGoBack: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────────
  /** Toggle an option on the current question (single vs multi aware). */
  toggleOption: (value: string) => void;
  /** Advance to the next visible question (no-op past the last). */
  goNext: () => void;
  /** Return to the previous visible question (no-op at the first). */
  goBack: () => void;
  /** Snapshot the collected result (answers + derived businessType + topPriority). */
  collectResult: () => DiscoveryResult;
}

/** Pure: derive the first-pick priority from a multi-select priorities question. */
function deriveTopPriority(
  visibleQuestions: OnboardingQuestion[],
  answers: Record<string, string[]>
): string | null {
  // The priorities question is the first MULTI-select that is not Q1. Its first
  // selected value is, by construction of toggleOption, the user's top priority.
  const priorities = visibleQuestions.find(
    (q) => q.questionType === "multi_select" && q.key !== BUSINESS_TYPE_KEY
  );
  if (!priorities) return null;
  return answers[priorities.key]?.[0] ?? null;
}

export function useDiscovery(): DiscoveryViewModel {
  const { language } = useI18n();

  // ── Fetch the COMPLETE adaptive graph once. No categoryKey ⇒ full=true. ──────
  const { data, isLoading, isError, refetch } = useQuery<OnboardingFlow>({
    queryKey: ["signup-onboarding-flow", language],
    queryFn: () => authContainer.signupRepository.getOnboardingFlow(undefined, language),
    staleTime: 10 * 60 * 1000, // graph is stable per session
    retry: 1,
  });

  const questions = useMemo(() => data?.questions ?? [], [data]);

  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Derived (pure helpers) ───────────────────────────────────────────────────
  const visibleQuestions = useMemo(
    () => getVisibleQuestions(questions, answers),
    [questions, answers]
  );

  // Clamp the index against the live visible set — when the set shrinks (e.g.
  // changing Q1 drops Q2/Q3) the pointer must never dangle past the end.
  const clampedIndex = Math.min(currentIndex, Math.max(0, visibleQuestions.length - 1));
  const currentQuestion = visibleQuestions[clampedIndex];

  const currentVisibleOptions = useMemo(
    () => (currentQuestion ? getVisibleOptions(currentQuestion, answers) : []),
    [currentQuestion, answers]
  );

  const currentSelection = currentQuestion ? (answers[currentQuestion.key] ?? []) : [];

  const isSingleSelect = currentQuestion?.questionType === "single_select";
  const isMaxReached =
    !!currentQuestion &&
    !isSingleSelect &&
    currentQuestion.maxSelections > 0 &&
    currentSelection.length >= currentQuestion.maxSelections;

  const topPriorityForCurrent =
    currentQuestion && !isSingleSelect && currentQuestion.key !== BUSINESS_TYPE_KEY
      ? (currentSelection[0] ?? null)
      : null;

  const isCurrentRequired = !!currentQuestion?.isRequired;

  const canAdvance = useMemo(() => {
    if (!currentQuestion) return true;
    if (!currentQuestion.isRequired) return true;
    const count = currentSelection.length;
    // A required question needs at least its minSelections (≥1 when unset).
    const min = currentQuestion.minSelections > 0 ? currentQuestion.minSelections : 1;
    return count >= min;
  }, [currentQuestion, currentSelection]);

  const isLastQuestion = clampedIndex >= visibleQuestions.length - 1;
  const canGoBack = clampedIndex > 0;

  // ── Selection toggle (single vs multi; first multi pick = top priority) ──────
  const toggleOption = useCallback(
    (value: string) => {
      const question = currentQuestion;
      if (!question) return;

      setAnswers((prev) => {
        const current = prev[question.key] ?? [];
        let nextValues: string[];

        if (question.questionType === "single_select") {
          // Toggle off when re-picking the same value; otherwise replace.
          nextValues = current[0] === value ? [] : [value];
        } else {
          if (current.includes(value)) {
            // Deselect — preserves order, so the first pick stays the top priority.
            nextValues = current.filter((v) => v !== value);
          } else {
            // Block new picks once max reached (UI also disables, this is defense).
            if (question.maxSelections > 0 && current.length >= question.maxSelections) {
              return prev;
            }
            // Append — the FIRST element remains the "top priority".
            nextValues = [...current, value];
          }
        }

        const draft = { ...prev, [question.key]: nextValues };
        // Prune so changing Q1 clears Q2/Q3, and reducing scale drops now-hidden
        // priority picks. Pure — operates on the post-toggle draft.
        return pruneStaleAnswers(questions, draft);
      });
    },
    [currentQuestion, questions]
  );

  const goNext = useCallback(() => {
    setCurrentIndex((idx) => Math.min(idx + 1, visibleQuestions.length - 1));
  }, [visibleQuestions.length]);

  const goBack = useCallback(() => {
    setCurrentIndex((idx) => Math.max(0, idx - 1));
  }, []);

  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const collectResult = useCallback((): DiscoveryResult => {
    const visible = getVisibleQuestions(questions, answers);
    const businessType = answers[BUSINESS_TYPE_KEY]?.[0] ?? null;
    const topPriority = deriveTopPriority(visible, answers);
    return { answers, businessType, topPriority };
  }, [questions, answers]);

  return useMemo(
    () => ({
      isLoading,
      isError,
      retry,
      answers,
      visibleQuestions,
      currentIndex: clampedIndex,
      currentQuestion,
      currentVisibleOptions,
      currentSelection,
      totalVisible: visibleQuestions.length,
      topPriorityForCurrent,
      isMaxReached,
      canAdvance,
      isCurrentRequired,
      isLastQuestion,
      canGoBack,
      toggleOption,
      goNext,
      goBack,
      collectResult,
    }),
    [
      isLoading,
      isError,
      retry,
      answers,
      visibleQuestions,
      clampedIndex,
      currentQuestion,
      currentVisibleOptions,
      currentSelection,
      topPriorityForCurrent,
      isMaxReached,
      canAdvance,
      isCurrentRequired,
      isLastQuestion,
      canGoBack,
      toggleOption,
      goNext,
      goBack,
      collectResult,
    ]
  );
}
