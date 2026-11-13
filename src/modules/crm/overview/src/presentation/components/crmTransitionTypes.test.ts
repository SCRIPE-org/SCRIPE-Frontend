import { describe, expect, it } from "vitest";
import type { EvaluatedWorkflowTransition } from "../../domain/constants/crmWorkflowRuleCatalogAndEval";
import { buildTransitionSchema, deriveTransitionDialogFlags } from "./crmTransitionTypes";

const t = (key: string) => key;

function makeEval(overrides: Partial<EvaluatedWorkflowTransition>): EvaluatedWorkflowTransition {
  return {
    allowed: true,
    status: "allowed_screen_required",
    shouldTriggerDealConversion: false,
    triggerDealConversion: false,
    requiredFields: [],
    promptFields: [],
    promptForComment: false,
    isBackward: false,
    requiresLossReason: false,
    requiresCloseNotes: false,
    requiresReopenReason: false,
    ...overrides,
  };
}

describe("crmTransitionTypes dynamic schema and dialog flags", () => {
  it("does not force closeNotes or lossReason on custom done/lost stages without matching rules", () => {
    const lostEval = makeEval({
      targetStage: {
        stageKey: "custom.lost",
        labelEn: "Archived",
        labelAr: "مؤرشف",
        sortOrder: 8,
        category: "lost",
        winProbabilityPercent: 0,
        requiredExitFields: [],
      },
    });
    const flags = deriveTransitionDialogFlags(lostEval, { id: "d-1" }, "deal");
    expect(flags.requiresCloseNotes).toBe(false);
    expect(flags.requiresLossReason).toBe(false);
    const schema = buildTransitionSchema({ flags, entityType: "deal", t });
    expect(schema.safeParse({}).success).toBe(true);
  });

  it("derives isLeadConvert strictly from triggerDealConversion flags, never category=done alone", () => {
    const doneLeadNoConvert = makeEval({
      targetStage: {
        stageKey: "lead.custom_done",
        labelEn: "Completed",
        labelAr: "مكتمل",
        sortOrder: 5,
        category: "done",
        winProbabilityPercent: 100,
        requiredExitFields: [],
      },
    });
    expect(deriveTransitionDialogFlags(doneLeadNoConvert, { id: "l-1" }, "lead").isLeadConvert).toBe(false);

    const convertLead = makeEval({ shouldTriggerDealConversion: true });
    expect(deriveTransitionDialogFlags(convertLead, { id: "l-1" }, "lead").isLeadConvert).toBe(true);
  });

  it("renders and validates solutionFitConfirmed, primaryContactRole, and qualificationNotes dynamically", () => {
    const evalRes = makeEval({
      requiredFields: ["solutionFitConfirmed", "primaryContactRole"],
      promptFields: ["qualificationNotes"],
    });
    const flags = deriveTransitionDialogFlags(evalRes, { id: "d-1" }, "deal");
    expect(flags.needsSolutionFit).toBe(true);
    expect(flags.requireSolutionFit).toBe(true);
    expect(flags.needsPrimaryContactRole).toBe(true);
    expect(flags.requirePrimaryContactRole).toBe(true);
    expect(flags.needsQualificationNotes).toBe(true);
    expect(flags.requireQualificationNotes).toBe(false);

    const schema = buildTransitionSchema({ flags, entityType: "deal", t });
    expect(schema.safeParse({ solutionFitConfirmed: false, primaryContactRole: "" }).success).toBe(false);
    expect(schema.safeParse({ solutionFitConfirmed: true, primaryContactRole: "Decision Maker" }).success).toBe(true);
  });
});
