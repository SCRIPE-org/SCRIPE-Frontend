// ═══════════════════════════════════════════════════════════════════════════
// useDiscovery — focused viewmodel tests (Vitest + Testing Library)
//
// Covers the in-phase interaction logic the viewmodel adds ON TOP of the pure
// E1 helpers (which have their own tests in onboardingFlow.test.ts):
//   • single-select toggle replaces / deselects;
//   • multi-select first pick = top priority, order-preserving deselect;
//   • multi-select respects maxSelections;
//   • changing Q1 prunes now-stale Q2/Q3 answers;
//   • collectResult derives businessType + topPriority.
//
// External deps are mocked at the module boundary: useQuery returns the fixture
// graph, useI18n is a stub, and the DI container is never actually hit (the
// query fn isn't invoked because useQuery is mocked).
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type {
  OnboardingFlow,
  OnboardingQuestion,
  OnboardingAnswerOption,
} from "../../domain/entities/OnboardingEntities";

// ─── Fixture: a minimal slice of the real seeded graph ──────────────────────
// Q1 business_type (single)        → general | healthcare
// Q2 scale_healthcare (single)     → clinic | network  [visible iff Q1=healthcare]
// Q3 priorities_healthcare (multi) → options, one gated by scale=network
//                                    [visible iff Q1=healthcare]

function opt(
  partial: Partial<OnboardingAnswerOption> & { value: string; sortOrder: number },
): OnboardingAnswerOption {
  return {
    label: partial.value,
    sublabel: null,
    iconKey: null,
    signalWeight: 0,
    relevanceBoost: 0,
    conditions: [],
    ...partial,
  };
}

function q(
  partial: Partial<OnboardingQuestion> & {
    key: string;
    questionType: OnboardingQuestion["questionType"];
    sortOrder: number;
    options: OnboardingAnswerOption[];
  },
): OnboardingQuestion {
  return {
    minSelections: 0,
    maxSelections: partial.questionType === "single_select" ? 1 : 3,
    isRequired: false,
    dependsOnQuestionKey: null,
    dependsOnAnswerValue: null,
    label: partial.key,
    hint: null,
    iconKey: null,
    ...partial,
  };
}

const FLOW: OnboardingFlow = {
  questions: [
    q({
      key: "business_type",
      questionType: "single_select",
      isRequired: true,
      sortOrder: 0,
      options: [opt({ value: "general", sortOrder: 0 }), opt({ value: "healthcare", sortOrder: 1 })],
    }),
    q({
      key: "scale_healthcare",
      questionType: "single_select",
      sortOrder: 1,
      dependsOnQuestionKey: "business_type",
      dependsOnAnswerValue: "healthcare",
      options: [opt({ value: "clinic", sortOrder: 0 }), opt({ value: "network", sortOrder: 1 })],
    }),
    q({
      key: "priorities_healthcare",
      questionType: "multi_select",
      maxSelections: 3,
      sortOrder: 2,
      dependsOnQuestionKey: "business_type",
      dependsOnAnswerValue: "healthcare",
      options: [
        opt({ value: "hipaa", sortOrder: 0 }),
        opt({ value: "audit", sortOrder: 1 }),
        opt({ value: "analytics", sortOrder: 2 }),
        // Gated: only visible once scale_healthcare = network.
        opt({
          value: "multi_site",
          sortOrder: 3,
          conditions: [{ dependsOnQuestionKey: "scale_healthcare", matchValues: ["network"], matchMode: "AnyOf" }],
        }),
      ],
    }),
  ],
};

// ─── Module mocks ────────────────────────────────────────────────────────────
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: FLOW, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ language: "en", direction: "ltr", t: (k: string) => k }),
}));
vi.mock("@modules/auth/di", () => ({
  authContainer: { signupRepository: { getOnboardingFlow: vi.fn() } },
}));

// Import AFTER mocks are registered.
import { useDiscovery } from "./useDiscovery";

describe("useDiscovery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts at Q1 with only the root question visible", () => {
    const { result } = renderHook(() => useDiscovery());
    expect(result.current.totalVisible).toBe(1);
    expect(result.current.currentQuestion?.key).toBe("business_type");
    // Required + nothing picked ⇒ cannot advance yet.
    expect(result.current.canAdvance).toBe(false);
  });

  it("single-select replaces the prior pick and reveals dependents", () => {
    const { result } = renderHook(() => useDiscovery());

    act(() => result.current.toggleOption("healthcare"));
    expect(result.current.canAdvance).toBe(true);
    // Q2 + Q3 now visible (depend on business_type=healthcare).
    expect(result.current.totalVisible).toBe(3);

    // Re-picking the same single value toggles it OFF → dependents collapse.
    act(() => result.current.toggleOption("healthcare"));
    expect(result.current.totalVisible).toBe(1);
  });

  it("multi-select keeps the FIRST pick as top priority and respects max", () => {
    const { result } = renderHook(() => useDiscovery());

    act(() => result.current.toggleOption("healthcare"));
    act(() => result.current.goNext()); // → scale
    act(() => result.current.toggleOption("clinic"));
    act(() => result.current.goNext()); // → priorities (multi)

    act(() => result.current.toggleOption("audit"));
    act(() => result.current.toggleOption("hipaa"));
    act(() => result.current.toggleOption("analytics"));
    // First pick is the top priority.
    expect(result.current.topPriorityForCurrent).toBe("audit");
    expect(result.current.isMaxReached).toBe(true);

    // A 4th pick is blocked by maxSelections (3).
    act(() => result.current.toggleOption("multi_site"));
    expect(result.current.currentSelection).toEqual(["audit", "hipaa", "analytics"]);

    // Deselecting the first promotes the next pick to top priority.
    act(() => result.current.toggleOption("audit"));
    expect(result.current.topPriorityForCurrent).toBe("hipaa");
  });

  it("changing Q1 prunes now-stale Q2/Q3 answers", () => {
    const { result } = renderHook(() => useDiscovery());

    act(() => result.current.toggleOption("healthcare"));
    act(() => result.current.goNext());
    act(() => result.current.toggleOption("network"));
    act(() => result.current.goNext());
    act(() => result.current.toggleOption("hipaa"));

    // Sanity: gated option visible because scale=network.
    expect(result.current.currentVisibleOptions.map((o) => o.value)).toContain("multi_site");

    // Go back to Q1 and switch industry → Q2/Q3 answers must be pruned away.
    act(() => result.current.goBack());
    act(() => result.current.goBack());
    act(() => result.current.toggleOption("general"));

    const res = result.current.collectResult();
    expect(res.businessType).toBe("general");
    expect(res.answers.scale_healthcare).toBeUndefined();
    expect(res.answers.priorities_healthcare).toBeUndefined();
    expect(res.topPriority).toBeNull();
  });
});
