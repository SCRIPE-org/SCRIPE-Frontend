// ═══════════════════════════════════════════════════════════════════════════
// Adaptive Onboarding Flow — pure domain helpers
//
// The backend returns the COMPLETE adaptive graph (every vertical's questions,
// options, and option-level visibility conditions) in ONE payload. These pure
// functions evaluate ALL branching client-side so that changing any earlier
// answer instantly reshapes later questions/options — with zero refetch.
//
// No React, no I/O, no Zustand, no network. Domain layer only.
//
// `answers` is a map of questionKey → the selected option values for that
// question (always an array; single-select questions carry a 0- or 1-element
// array).
// ═══════════════════════════════════════════════════════════════════════════

import type {
  OnboardingAnswerOption,
  OnboardingAnswerOptionCondition,
  OnboardingQuestion,
} from "../entities/OnboardingEntities";

/** Read the selected values for a question key (never undefined). */
function selectedFor(answers: Record<string, string[]>, key: string): string[] {
  return answers[key] ?? [];
}

/** Whether two value arrays share at least one element (any-of intersection). */
function intersects(a: readonly string[], b: readonly string[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const set = new Set(a);
  return b.some((v) => set.has(v));
}

/**
 * Whether a single option-level condition is currently satisfied.
 *
 * matchMode "AnyOf" (the only mode today, and the default): the condition is
 * satisfied iff the user's selected values for `dependsOnQuestionKey` intersect
 * the condition's `matchValues`.
 */
function isConditionSatisfied(
  condition: OnboardingAnswerOptionCondition,
  answers: Record<string, string[]>,
): boolean {
  const selected = selectedFor(answers, condition.dependsOnQuestionKey);
  // matchMode is currently only "AnyOf"; treat any value defensively as AnyOf.
  return intersects(selected, condition.matchValues);
}

/**
 * Determine which questions are visible given the current answers.
 *
 * A question is visible if it has no `dependsOnQuestionKey`, OR — when it has
 * one — if the answer to that key contains `dependsOnAnswerValue`. When
 * `dependsOnAnswerValue` is null, the question is visible iff ANY answer exists
 * for the dependency key.
 *
 * Result is sorted ascending by `sortOrder`.
 */
export function getVisibleQuestions(
  questions: OnboardingQuestion[],
  answers: Record<string, string[]>,
): OnboardingQuestion[] {
  return questions
    .filter((q) => {
      if (!q.dependsOnQuestionKey) return true;
      const depAnswer = selectedFor(answers, q.dependsOnQuestionKey);
      return q.dependsOnAnswerValue
        ? depAnswer.includes(q.dependsOnAnswerValue)
        : depAnswer.length > 0;
    })
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Whether an option is currently visible.
 *
 * True iff EVERY one of the option's conditions is satisfied (logical AND across
 * conditions). An option with no conditions is always visible.
 */
export function isOptionVisible(
  option: OnboardingAnswerOption,
  answers: Record<string, string[]>,
): boolean {
  if (option.conditions.length === 0) return true;
  return option.conditions.every((c) => isConditionSatisfied(c, answers));
}

/**
 * Effective ranking key for an option:
 *   sortOrder − (relevanceBoost when the option currently has a satisfied
 *   condition, else 0)
 *
 * Lower = higher in the list. So a boosted option whose condition is met floats
 * up; when the condition is unmet the boost is ignored and the option keeps its
 * natural sortOrder position.
 */
function effectiveRankKey(
  option: OnboardingAnswerOption,
  answers: Record<string, string[]>,
): number {
  const boostActive =
    option.relevanceBoost !== 0 &&
    option.conditions.length > 0 &&
    option.conditions.some((c) => isConditionSatisfied(c, answers));
  return option.sortOrder - (boostActive ? option.relevanceBoost : 0);
}

/**
 * Deterministically rank options by their effective key (ascending). Ties are
 * broken by the original `sortOrder`, then by `value`, so the ordering is stable
 * and reproducible across renders.
 */
export function rankOptions(
  options: OnboardingAnswerOption[],
  answers: Record<string, string[]>,
): OnboardingAnswerOption[] {
  return options
    .slice()
    .sort((a, b) => {
      const ka = effectiveRankKey(a, answers);
      const kb = effectiveRankKey(b, answers);
      if (ka !== kb) return ka - kb;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
    });
}

/**
 * The visible, ranked options for a question: filtered by `isOptionVisible`,
 * then ordered by `rankOptions`.
 */
export function getVisibleOptions(
  question: OnboardingQuestion,
  answers: Record<string, string[]>,
): OnboardingAnswerOption[] {
  const visible = question.options.filter((o) => isOptionVisible(o, answers));
  return rankOptions(visible, answers);
}

/**
 * Return a NEW answers map with stale selections removed:
 *   (a) answers for questions that are no longer visible are dropped entirely;
 *   (b) selected option values that are no longer visible options are removed.
 *
 * So changing Q1 clears now-hidden Q2/Q3 answers, and reducing the scale drops
 * priority picks whose option-level conditions no longer hold. Pure — never
 * mutates the input.
 */
export function pruneStaleAnswers(
  questions: OnboardingQuestion[],
  answers: Record<string, string[]>,
): Record<string, string[]> {
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const visibleByKey = new Map(visibleQuestions.map((q) => [q.key, q]));

  const next: Record<string, string[]> = {};

  for (const [key, values] of Object.entries(answers)) {
    const question = visibleByKey.get(key);
    // (a) Drop answers belonging to questions that are no longer visible.
    if (!question) continue;

    // (b) Keep only values that still correspond to a currently-visible option.
    const visibleValues = new Set(
      question.options.filter((o) => isOptionVisible(o, answers)).map((o) => o.value),
    );
    next[key] = values.filter((v) => visibleValues.has(v));
  }

  return next;
}
