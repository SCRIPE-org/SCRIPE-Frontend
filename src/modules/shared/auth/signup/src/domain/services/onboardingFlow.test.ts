// FILE-EXCEPTION: file length
// ═══════════════════════════════════════════════════════════════════════════
// Adaptive onboarding flow helpers — unit tests (Vitest)
//
// Fixtures mirror the real seeded graph (OnboardingQuestionSeeder.cs):
//   Q1 business_type (single)         → general | erp | healthcare
//   Q2 scale_healthcare (single)      → clinic | beds_lt_50 | beds_50_200 | beds_200_plus | network
//   Q3 priorities_healthcare (multi)  → options, some gated by scale_healthcare conditions
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import type { OnboardingAnswerOption, OnboardingQuestion } from "../entities/OnboardingEntities";
import {
  getVisibleQuestions,
  isOptionVisible,
  getVisibleOptions,
  rankOptions,
  pruneStaleAnswers,
} from "./onboardingFlow";

// ─── Fixture builders ──────────────────────────────────────────────────────────

function opt(
  partial: Partial<OnboardingAnswerOption> & { value: string; sortOrder: number }
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

function question(
  partial: Partial<OnboardingQuestion> & {
    key: string;
    sortOrder: number;
    options: OnboardingAnswerOption[];
  }
): OnboardingQuestion {
  return {
    questionType: "single_select",
    minSelections: 1,
    maxSelections: 1,
    isRequired: true,
    dependsOnQuestionKey: null,
    dependsOnAnswerValue: null,
    label: partial.key,
    hint: null,
    iconKey: null,
    ...partial,
  };
}

// ─── Representative seeded-shape fixtures ───────────────────────────────────────

const businessType = question({
  key: "business_type",
  sortOrder: 10,
  options: [
    opt({ value: "general", sortOrder: 10 }),
    opt({ value: "erp", sortOrder: 20 }),
    opt({ value: "healthcare", sortOrder: 30 }),
  ],
});

const scaleHealthcare = question({
  key: "scale_healthcare",
  sortOrder: 20,
  dependsOnQuestionKey: "business_type",
  dependsOnAnswerValue: "healthcare",
  options: [
    opt({ value: "clinic", sortOrder: 10 }),
    opt({ value: "beds_lt_50", sortOrder: 20 }),
    opt({ value: "beds_50_200", sortOrder: 30 }),
    opt({ value: "beds_200_plus", sortOrder: 40 }),
    opt({ value: "network", sortOrder: 50 }),
  ],
});

const prioritiesHealthcare = question({
  key: "priorities_healthcare",
  sortOrder: 30,
  questionType: "multi_select",
  minSelections: 1,
  maxSelections: 3,
  dependsOnQuestionKey: "business_type",
  dependsOnAnswerValue: "healthcare",
  options: [
    opt({ value: "ehr", sortOrder: 10 }),
    opt({ value: "scheduling", sortOrder: 20 }),
    opt({ value: "billing", sortOrder: 30 }),
    // Gated: only visible at beds_200_plus | network. High boost floats it up.
    opt({
      value: "multi_site",
      sortOrder: 80,
      relevanceBoost: 15,
      conditions: [
        {
          dependsOnQuestionKey: "scale_healthcare",
          matchValues: ["beds_200_plus", "network"],
          matchMode: "AnyOf",
        },
      ],
    }),
    // Gated: visible from beds_50_200 upward.
    opt({
      value: "dedicated_sla",
      sortOrder: 90,
      relevanceBoost: 10,
      conditions: [
        {
          dependsOnQuestionKey: "scale_healthcare",
          matchValues: ["beds_50_200", "beds_200_plus", "network"],
          matchMode: "AnyOf",
        },
      ],
    }),
  ],
});

const flow: OnboardingQuestion[] = [businessType, scaleHealthcare, prioritiesHealthcare];

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Question branching
// ═══════════════════════════════════════════════════════════════════════════════

describe("getVisibleQuestions", () => {
  it("hides scale_healthcare until business_type=healthcare", () => {
    const visible = getVisibleQuestions(flow, {});
    expect(visible.map((q) => q.key)).toEqual(["business_type"]);
  });

  it("shows scale_healthcare + priorities_healthcare when business_type=healthcare", () => {
    const visible = getVisibleQuestions(flow, { business_type: ["healthcare"] });
    expect(visible.map((q) => q.key)).toEqual([
      "business_type",
      "scale_healthcare",
      "priorities_healthcare",
    ]);
  });

  it("does NOT show the healthcare branch when business_type=general", () => {
    const visible = getVisibleQuestions(flow, { business_type: ["general"] });
    expect(visible.map((q) => q.key)).toEqual(["business_type"]);
  });

  it("returns questions sorted by sortOrder", () => {
    const shuffled = [prioritiesHealthcare, businessType, scaleHealthcare];
    const visible = getVisibleQuestions(shuffled, { business_type: ["healthcare"] });
    expect(visible.map((q) => q.sortOrder)).toEqual([10, 20, 30]);
  });

  it("treats a null dependsOnAnswerValue as 'any answer exists'", () => {
    const dependentAny = question({
      key: "followup",
      sortOrder: 40,
      dependsOnQuestionKey: "business_type",
      dependsOnAnswerValue: null,
      options: [opt({ value: "x", sortOrder: 10 })],
    });
    expect(getVisibleQuestions([businessType, dependentAny], {}).map((q) => q.key)).toEqual([
      "business_type",
    ]);
    expect(
      getVisibleQuestions([businessType, dependentAny], { business_type: ["general"] }).map(
        (q) => q.key
      )
    ).toEqual(["business_type", "followup"]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Option visibility
// ═══════════════════════════════════════════════════════════════════════════════

describe("isOptionVisible", () => {
  const multiSite = prioritiesHealthcare.options.find((o) => o.value === "multi_site")!;
  const ehr = prioritiesHealthcare.options.find((o) => o.value === "ehr")!;

  it("an unconditioned option is always visible", () => {
    expect(isOptionVisible(ehr, {})).toBe(true);
    expect(isOptionVisible(ehr, { scale_healthcare: ["clinic"] })).toBe(true);
  });

  it("hides a conditioned option when the dependency answer is not in matchValues", () => {
    expect(isOptionVisible(multiSite, { scale_healthcare: ["beds_lt_50"] })).toBe(false);
  });

  it("shows a conditioned option when the dependency answer intersects matchValues", () => {
    expect(isOptionVisible(multiSite, { scale_healthcare: ["network"] })).toBe(true);
    expect(isOptionVisible(multiSite, { scale_healthcare: ["beds_200_plus"] })).toBe(true);
  });

  it("hides a conditioned option when the dependency is unanswered", () => {
    expect(isOptionVisible(multiSite, {})).toBe(false);
  });

  it("requires EVERY condition to match (AND across conditions)", () => {
    const twoConditions = opt({
      value: "both",
      sortOrder: 99,
      conditions: [
        { dependsOnQuestionKey: "business_type", matchValues: ["healthcare"], matchMode: "AnyOf" },
        { dependsOnQuestionKey: "scale_healthcare", matchValues: ["network"], matchMode: "AnyOf" },
      ],
    });
    expect(
      isOptionVisible(twoConditions, {
        business_type: ["healthcare"],
        scale_healthcare: ["network"],
      })
    ).toBe(true);
    // first condition fails
    expect(
      isOptionVisible(twoConditions, { business_type: ["general"], scale_healthcare: ["network"] })
    ).toBe(false);
    // second condition fails
    expect(
      isOptionVisible(twoConditions, {
        business_type: ["healthcare"],
        scale_healthcare: ["beds_lt_50"],
      })
    ).toBe(false);
  });
});

describe("getVisibleOptions", () => {
  it("hides the gated multi_site option at beds_lt_50, shows it at network", () => {
    const hidden = getVisibleOptions(prioritiesHealthcare, {
      business_type: ["healthcare"],
      scale_healthcare: ["beds_lt_50"],
    });
    expect(hidden.map((o) => o.value)).not.toContain("multi_site");

    const shown = getVisibleOptions(prioritiesHealthcare, {
      business_type: ["healthcare"],
      scale_healthcare: ["network"],
    });
    expect(shown.map((o) => o.value)).toContain("multi_site");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Ranking
// ═══════════════════════════════════════════════════════════════════════════════

describe("rankOptions", () => {
  it("floats a boosted option up once its condition is satisfied", () => {
    const visibleAtNetwork = getVisibleOptions(prioritiesHealthcare, {
      business_type: ["healthcare"],
      scale_healthcare: ["network"],
    });
    const ranked = visibleAtNetwork.map((o) => o.value);
    // multi_site (sortOrder 80, boost 15 → effective 65) should now sit ahead of
    // billing (sortOrder 30) is NOT true; verify it floats above same-bucket peers:
    // effective keys: ehr=10, scheduling=20, billing=30, multi_site=80-15=65,
    // dedicated_sla=90-10=80 → order: ehr, scheduling, billing, multi_site, dedicated_sla
    expect(ranked).toEqual(["ehr", "scheduling", "billing", "multi_site", "dedicated_sla"]);
  });

  it("changes order when the boost condition flips on vs off", () => {
    const boosted = opt({
      value: "boosted",
      sortOrder: 50,
      relevanceBoost: 100, // huge boost → floats to the very top when satisfied
      conditions: [
        { dependsOnQuestionKey: "scale_healthcare", matchValues: ["network"], matchMode: "AnyOf" },
      ],
    });
    const peer = opt({ value: "peer", sortOrder: 10 });

    // Condition NOT satisfied → boost ignored → peer (10) before boosted (50).
    const offOrder = rankOptions([boosted, peer], { scale_healthcare: ["clinic"] }).map(
      (o) => o.value
    );
    expect(offOrder).toEqual(["peer", "boosted"]);

    // Condition satisfied → effective key 50-100=-50 → boosted floats above peer.
    const onOrder = rankOptions([boosted, peer], { scale_healthcare: ["network"] }).map(
      (o) => o.value
    );
    expect(onOrder).toEqual(["boosted", "peer"]);
  });

  it("is deterministic: ties break by sortOrder then value", () => {
    const a = opt({ value: "bbb", sortOrder: 10 });
    const b = opt({ value: "aaa", sortOrder: 10 });
    const ranked = rankOptions([a, b], {}).map((o) => o.value);
    expect(ranked).toEqual(["aaa", "bbb"]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Pruning
// ═══════════════════════════════════════════════════════════════════════════════

describe("pruneStaleAnswers", () => {
  it("clears healthcare-branch answers when business_type switches healthcare→general", () => {
    const before: Record<string, string[]> = {
      business_type: ["general"], // changed away from healthcare
      scale_healthcare: ["network"],
      priorities_healthcare: ["ehr", "multi_site"],
    };
    const after = pruneStaleAnswers(flow, before);
    expect(after).toEqual({ business_type: ["general"] });
    // returns a new object (no mutation)
    expect(after).not.toBe(before);
    expect(before.scale_healthcare).toEqual(["network"]);
  });

  it("keeps healthcare-branch answers when business_type stays healthcare", () => {
    const before: Record<string, string[]> = {
      business_type: ["healthcare"],
      scale_healthcare: ["network"],
      priorities_healthcare: ["ehr", "multi_site"],
    };
    const after = pruneStaleAnswers(flow, before);
    expect(after).toEqual(before);
  });

  it("drops a previously-picked conditional priority when scale is reduced", () => {
    const before: Record<string, string[]> = {
      business_type: ["healthcare"],
      scale_healthcare: ["beds_lt_50"], // multi_site no longer a visible option here
      priorities_healthcare: ["ehr", "multi_site"], // multi_site is now stale
    };
    const after = pruneStaleAnswers(flow, before);
    expect(after.priorities_healthcare).toEqual(["ehr"]);
    // scale answer itself is still valid + visible, untouched
    expect(after.scale_healthcare).toEqual(["beds_lt_50"]);
  });

  it("removes a question's key entirely if all its selected values become invalid", () => {
    const before: Record<string, string[]> = {
      business_type: ["healthcare"],
      scale_healthcare: ["beds_lt_50"],
      priorities_healthcare: ["multi_site"], // the ONLY pick is now hidden
    };
    const after = pruneStaleAnswers(flow, before);
    expect(after.priorities_healthcare).toEqual([]);
  });

  it("leaves an already-clean answer map unchanged in value", () => {
    const clean: Record<string, string[]> = {
      business_type: ["healthcare"],
      scale_healthcare: ["clinic"],
    };
    const after = pruneStaleAnswers(flow, clean);
    expect(after).toEqual(clean);
  });
});
