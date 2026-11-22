import { describe, expect, it } from "vitest";
import { INITIAL_CRM_WORKFLOWS } from "./crmWorkflowInitialCatalog";
import {
  evaluateWorkflowTransition,
  evaluateCrmTransition,
  isFieldSatisfiedOnRecord,
  type RecordTransitionContext,
} from "./crmWorkflowEngine";

describe("crmWorkflowEngine & Instant Auto-Drop Engine", () => {
  const dealWorkflow = INITIAL_CRM_WORKFLOWS.find((w) => w.entityType === "deal")!;
  const leadWorkflow = INITIAL_CRM_WORKFLOWS.find((w) => w.entityType === "lead")!;

  describe("isFieldSatisfiedOnRecord", () => {
    it("detects party verification across partyId, accountId, and hasVerifiedParty flag", () => {
      expect(isFieldSatisfiedOnRecord("partyId", {})).toBe(false);
      expect(isFieldSatisfiedOnRecord("partyId", { hasVerifiedParty: true })).toBe(true);
      expect(isFieldSatisfiedOnRecord("partyId", { partyId: "party-123" })).toBe(true);
      expect(isFieldSatisfiedOnRecord("partyId", { accountId: "acc-456" })).toBe(true);
      expect(isFieldSatisfiedOnRecord("verifiedPartyId", { partyId: "p-1" })).toBe(true);
    });

    it("evaluates financial amounts positively", () => {
      expect(isFieldSatisfiedOnRecord("estimatedAmount", { estimatedAmount: 0 })).toBe(false);
      expect(isFieldSatisfiedOnRecord("estimatedAmount", { estimatedAmount: -50 })).toBe(false);
      expect(isFieldSatisfiedOnRecord("estimatedAmount", { estimatedAmount: 250000 })).toBe(true);
      expect(isFieldSatisfiedOnRecord("estimatedValue", { estimatedValue: 12000 })).toBe(true);
    });

    it("evaluates target close date and loss reasons", () => {
      expect(isFieldSatisfiedOnRecord("targetCloseDate", {})).toBe(false);
      expect(isFieldSatisfiedOnRecord("targetCloseDate", { targetCloseDate: "2026-12-31" })).toBe(true);
      expect(isFieldSatisfiedOnRecord("lossReasonCode", {})).toBe(false);
      expect(isFieldSatisfiedOnRecord("lossReasonCode", { lossReasonCode: "competitor" })).toBe(true);
      expect(isFieldSatisfiedOnRecord("disqualificationReason", { disqualificationReason: "budget" })).toBe(true);
    });

    it("evaluates custom and generic fields safely", () => {
      expect(isFieldSatisfiedOnRecord("solutionFitConfirmed", { fields: { solutionFitConfirmed: true } })).toBe(true);
      expect(isFieldSatisfiedOnRecord("custom:tier", { customFields: { "custom:tier": "Gold" } })).toBe(true);
      expect(isFieldSatisfiedOnRecord("missingField", {})).toBe(false);
    });
  });

  describe("Lead Workflow Transitions", () => {
    it("allows instant auto-drop from Working -> New without modal screen", () => {
      const result = evaluateWorkflowTransition(leadWorkflow, "lead.working", "lead.new");
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_instant");
      expect(result.requiresScreen).toBe(false);
      expect(result.actionLabel).toBe("⚡ Drop to Move");
    });

    it("allows instant auto-drop from New -> Working", () => {
      const result = evaluateWorkflowTransition(leadWorkflow, "lead.new", "lead.working");
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_instant");
      expect(result.requiresScreen).toBe(false);
    });

    it("requires screen when converting lead to deal (triggerDealConversion)", () => {
      const result = evaluateWorkflowTransition(leadWorkflow, "lead.qualified", "lead.converted");
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_screen_required");
      expect(result.requiresScreen).toBe(true);
      expect(result.shouldTriggerDealConversion).toBe(true);
    });

    it("requires screen when moving to Disqualified without a reason", () => {
      const result = evaluateWorkflowTransition(leadWorkflow, "lead.working", "lead.disqualified");
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_screen_required");
      expect(result.requiresLossReason).toBe(true);
    });

    it("allows instant drop to Disqualified when reason is already supplied in context", () => {
      const result = evaluateWorkflowTransition(leadWorkflow, "lead.working", "lead.disqualified", {
        lossReasonCode: "unresponsive",
      });
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_instant");
      expect(result.requiresScreen).toBe(false);
    });
  });

  describe("Deal Workflow Transitions", () => {
    it("allows instant auto-drop from Discovery -> Qualification", () => {
      const result = evaluateWorkflowTransition(dealWorkflow, "default.discovery", "default.qualification");
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_instant");
      expect(result.requiresScreen).toBe(false);
    });

    it("allows instant auto-drop backward from Qualification -> Discovery without forced dialog", () => {
      const result = evaluateWorkflowTransition(dealWorkflow, "default.qualification", "default.discovery");
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_instant");
      expect(result.requiresScreen).toBe(false);
      expect(result.isBackward).toBe(true);
    });

    it("requires screen when moving to Proposal with missing party or amount", () => {
      const result = evaluateWorkflowTransition(dealWorkflow, "default.solution_fit", "default.proposal", {
        estimatedAmount: 0,
      });
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_screen_required");
      expect(result.requiresScreen).toBe(true);
      expect(result.requiredFields).toContain("partyId");
    });

    it("allows instant drop to Proposal when party and amount are already satisfied", () => {
      const result = evaluateWorkflowTransition(dealWorkflow, "default.solution_fit", "default.proposal", {
        partyId: "org-al-ahly",
        estimatedAmount: 180000,
        fields: { solutionFitConfirmed: true },
      });
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_instant");
      expect(result.requiresScreen).toBe(false);
    });

    it("blocks restricted transitions that have no edge or wildcard defined", () => {
      const result = evaluateWorkflowTransition(dealWorkflow, "default.closed_lost", "default.negotiation");
      expect(result.allowed).toBe(false);
      expect(result.status).toBe("blocked");
      expect(result.reason).toContain("No transition is configured");
    });

    it("blocks unconnected Solution Fit -> Discovery on canonical wf-deal-default with requiresScreen: false", () => {
      const result = evaluateWorkflowTransition(dealWorkflow, "default.solution_fit", "default.discovery");
      expect(result.allowed).toBe(false);
      expect(result.status).toBe("blocked");
      expect(result.requiresScreen).toBe(false);
    });

    it("allows instant drop when explicit Solution Fit -> Discovery transition is configured cleanly", () => {
      const customWf = {
        ...dealWorkflow,
        transitions: [
          ...dealWorkflow.transitions,
          {
            id: "tr-custom-sol-disc",
            nameEn: "Return to Discovery",
            nameAr: "العودة للاستكشاف",
            fromStageKey: "default.solution_fit",
            fromStageKeys: ["default.solution_fit"],
            toStageKey: "default.discovery",
            direction: "backward" as const,
            rules: {
              allowRollback: true,
              requiredPermission: null,
              blockIfLinkedDealProgressed: false,
              promptForComment: false,
              promptFields: [],
              requireVerifiedParty: false,
              requireEstimatedAmountPositive: false,
              requireTargetCloseDate: false,
              requiredFieldKeys: [],
              triggerDealConversion: false,
              autoCreateWorkTask: false,
            },
          },
        ],
      };
      const result = evaluateWorkflowTransition(customWf, "default.solution_fit", "default.discovery");
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_instant");
      expect(result.requiresScreen).toBe(false);
    });

    it("does not treat higher sortOrder -> Closed Lost via global * transition as a blocked rollback", () => {
      const customWf = {
        ...dealWorkflow,
        stages: [
          ...dealWorkflow.stages,
          {
            stageKey: "custom.legal_audit",
            labelEn: "Legal Audit",
            labelAr: "مراجعة قانونية",
            sortOrder: 8,
            category: "in_progress" as const,
            winProbabilityPercent: 65,
            requiredExitFields: [],
          },
        ],
      };
      const result = evaluateWorkflowTransition(customWf, "custom.legal_audit", "default.closed_lost", {
        lossReasonCode: "TIMING",
        fields: { closeNotes: "Deferred by board" },
      });
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("allowed_instant");
    });

    it("evaluates Solution Fit -> Proposal as allowed_instant when top-level solutionFitConfirmed, partyId, and amount are satisfied", () => {
      const partial = evaluateWorkflowTransition(dealWorkflow, "default.solution_fit", "default.proposal", {
        solutionFitConfirmed: true,
        partyId: "p-1",
      });
      expect(partial.allowed).toBe(true);
      expect(partial.requiredFields).not.toContain("solutionFitConfirmed");
      expect(partial.requiredFields).not.toContain("partyId");

      const full = evaluateWorkflowTransition(dealWorkflow, "default.solution_fit", "default.proposal", {
        solutionFitConfirmed: true,
        partyId: "p-1",
        estimatedAmount: 100000,
      });
      expect(full.allowed).toBe(true);
      expect(full.status).toBe("allowed_instant");
      expect(full.requiresScreen).toBe(false);
    });

    it("aliases evaluateCrmTransition identically to evaluateWorkflowTransition", () => {
      expect(evaluateCrmTransition).toBe(evaluateWorkflowTransition);
      const res = evaluateCrmTransition(dealWorkflow, "default.discovery", "default.qualification");
      expect(res.status).toBe("allowed_instant");
    });
  });

  describe("Bilingual Arabic RTL Parity", () => {
    it("returns localized Arabic actionLabel and reason when locale is ar", () => {
      const resAr = evaluateWorkflowTransition(dealWorkflow, "default.discovery", "default.qualification", {
        locale: "ar",
      });
      expect(resAr.actionLabel).toBe("⚡ أفلت للنقل");
      expect(resAr.reason).toBe("الانتقال متاح فوراً.");
    });

    it("returns localized Arabic blocked reason when transition is restricted", () => {
      const resAr = evaluateWorkflowTransition(dealWorkflow, "default.closed_lost", "default.negotiation", {
        locale: "ar",
      });
      expect(resAr.allowed).toBe(false);
      expect(resAr.actionLabel).toBe("محظور");
      expect(resAr.reason).toContain("لا يوجد انتقال مُعدّ");
    });
  });
});
