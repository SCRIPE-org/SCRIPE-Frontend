import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { setCrmContainer, type CrmContainer } from "@modules/crm/di";
import { useCrmWorkflowsStore } from "@modules/crm";
import type { CrmLead } from "../../domain/entities/LeadEntity";
import { useLeadWorkflowActions } from "./useLeadWorkflowActions";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params?.defaultValue ? String(params.defaultValue) : key,
    language: "en",
  }),
}));

const workingLead: CrmLead = {
  id: "lead-exec-1",
  title: "Al-Shabab Academy Sponsorship",
  firstName: "Tariq",
  lastName: "Al-Harbi",
  fullName: "Tariq Al-Harbi",
  companyName: "Al-Shabab FC",
  status: "Working",
  statusName: "Working",
  stageKey: "lead.working",
  estimatedValue: 180000,
  currency: "SAR",
  verifiedPartyId: "party-200",
  createdAt: "2026-11-01T00:00:00Z",
  rowVersion: "AAAA==",
};

describe("Lead Kanban dynamic status/stage execution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCrmWorkflowsStore.getState().resetDefaults();
  });

  afterEach(() => {
    useCrmWorkflowsStore.getState().resetDefaults();
  });

  it("executes Qualified and Disqualified moves instantly without QualifyLeadDialog hijack when workflow edge requires no input", async () => {
    const wf = useCrmWorkflowsStore.getState().getActiveWorkflow("lead");
    useCrmWorkflowsStore.getState().saveWorkflow({
      ...wf,
      stages: wf.stages.map((s) =>
        s.stageKey === "lead.working" ? { ...s, requiredExitFields: [] } : s,
      ),
      transitions: [
        ...wf.transitions.filter(
          (tr) =>
            !(tr.fromStageKey === "lead.working" && tr.toStageKey === "lead.qualified") &&
            !(tr.fromStageKey === "*" && tr.toStageKey === "lead.disqualified"),
        ),
        {
          id: "tr-lead-qualify-instant",
          nameEn: "Instant Qualify",
          nameAr: "تأهيل فوري",
          fromStageKey: "lead.working",
          toStageKey: "lead.qualified",
          direction: "forward",
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
        {
          id: "tr-lead-disq-instant",
          nameEn: "Instant Disqualify",
          nameAr: "استبعاد فوري",
          fromStageKey: "*",
          toStageKey: "lead.disqualified",
          direction: "global",
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
    });

    const mockMoveLeadStage = vi.fn().mockResolvedValue({ ...workingLead, status: "Disqualified", stageKey: "lead.disqualified" });
    setCrmContainer({
      overviewService: {} as never,
      overviewRepository: {} as never,
      leadService: {} as never,
      leadRepository: { moveLeadStage: mockMoveLeadStage } as never,
      opportunityService: {} as never,
      opportunityRepository: {} as never,
      accountService: {} as never,
      accountRepository: {} as never,
      contactService: {} as never,
      contactRepository: {} as never,
    } as CrmContainer);

    const loadLeads = vi.fn().mockResolvedValue(undefined);
    const setStateItemsAndError = vi.fn();
    const setStateError = vi.fn();
    const setIsSubmitting = vi.fn();
    const setSubmitError = vi.fn();

    const { result } = renderHook(() =>
      useLeadWorkflowActions(
        [workingLead],
        1,
        20,
        "",
        undefined,
        loadLeads,
        setStateItemsAndError,
        setStateError,
        setIsSubmitting,
        setSubmitError,
      ),
    );

    await act(async () => {
      const okQual = await result.current.handleUpdateLeadStatus(workingLead, "Qualified");
      expect(okQual).toBe(true);
    });
    expect(result.current.isQualifyOpen).toBe(false);
    expect(mockMoveLeadStage).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: "lead-exec-1", targetStageKey: "lead.qualified" }),
    );

    await act(async () => {
      const okDisq = await result.current.handleUpdateLeadStatus(workingLead, "Disqualified");
      expect(okDisq).toBe(true);
    });
    expect(result.current.isQualifyOpen).toBe(false);
    expect(mockMoveLeadStage).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: "lead-exec-1", targetStageKey: "lead.disqualified" }),
    );
  });

  it("uses qualificationNotes in workflow evaluation when transition requires qualificationNotes", () => {
    const wf = useCrmWorkflowsStore.getState().getActiveWorkflow("lead");
    useCrmWorkflowsStore.getState().saveWorkflow({
      ...wf,
      stages: wf.stages.map((s) =>
        s.stageKey === "lead.working" ? { ...s, requiredExitFields: ["qualificationNotes"] } : s,
      ),
      transitions: wf.transitions.map((tr) =>
        tr.fromStageKey === "lead.working" && tr.toStageKey === "lead.qualified"
          ? { ...tr, rules: { ...tr.rules, promptForComment: false, promptFields: [] } }
          : tr,
      ),
    });

    const missingNotes = useCrmWorkflowsStore.getState().evaluateTransition("lead", "lead.working", "lead.qualified", {
      qualificationNotes: null,
    });
    expect(missingNotes.status).toBe("allowed_screen_required");

    const satisfiedNotes = useCrmWorkflowsStore.getState().evaluateTransition("lead", "lead.working", "lead.qualified", {
      qualificationNotes: "Confirmed sponsorship budget",
    });
    expect(satisfiedNotes.status).toBe("allowed_instant");
  });
});
