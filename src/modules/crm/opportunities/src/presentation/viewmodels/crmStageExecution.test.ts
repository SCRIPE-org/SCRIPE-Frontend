import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { setCrmContainer, type CrmContainer } from "@modules/crm/di";
import { useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";
import { evaluateOptimisticDealStageMove } from "../utils/opportunityViewModelHelpers";
import { useOpportunityStageActions } from "./useOpportunityStageActions";

const baseOpp: CrmOpportunity = {
  id: "opp-exec-1",
  title: "Al-Ittihad Arena Naming Deal",
  leadId: null,
  accountId: null,
  partyId: "party-100",
  pipelineId: "wf-deal-default",
  stageId: "stg-fit",
  stageKey: "default.solution_fit",
  stageLabelEnSnapshot: "Solution Fit",
  pipelineVersionSnapshot: 1,
  lastActiveStageKey: null,
  ownerUserId: "user-1",
  ownerTeamId: null,
  dealKind: "NewBusiness",
  hqOutcomeKind: null,
  targetExistingTenantId: null,
  estimatedAmount: 450000,
  currencyCode: "SAR",
  targetCloseDate: "2026-12-31T00:00:00Z",
  status: "Open",
  statusName: "Open",
  solutionFitConfirmed: true,
  primaryContactRole: "DecisionMaker",
  createdAt: "2026-11-01T00:00:00Z",
  rowVersion: "AAAA==",
  maskedFieldKeys: [],
};

describe("Deal Kanban dynamic stage execution & error rollback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCrmWorkflowsStore.getState().resetDefaults();
  });

  afterEach(() => {
    useCrmWorkflowsStore.getState().resetDefaults();
  });

  it("blocks unconnected Solution Fit -> Discovery when no transition edge exists in active workflow", () => {
    const res = evaluateOptimisticDealStageMove(baseOpp, "default.discovery", []);
    expect(res.status).toBe("blocked");
    expect(res.errorReason).toBeTruthy();
  });

  it("evaluates instant workflow edge directly even when target stageKey is default.closed_won (no hardcoded modal hijack)", () => {
    const wf = useCrmWorkflowsStore.getState().getActiveWorkflow("deal");
    useCrmWorkflowsStore.getState().saveWorkflow({
      ...wf,
      transitions: [
        ...wf.transitions.filter((tr) => tr.toStageKey !== "default.closed_won"),
        {
          id: "tr-instant-won",
          nameEn: "Instant Win",
          nameAr: "إغلاق فوري",
          fromStageKey: "default.solution_fit",
          toStageKey: "default.closed_won",
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
      ],
    });

    const res = evaluateOptimisticDealStageMove(baseOpp, "default.closed_won", []);
    expect(res.status).toBe("allowed");
  });

  it("passes solutionFitConfirmed and primaryContactRole into evaluateTransition checks", () => {
    const wf = useCrmWorkflowsStore.getState().getActiveWorkflow("deal");
    useCrmWorkflowsStore.getState().saveWorkflow({
      ...wf,
      stages: wf.stages.map((s) =>
        s.stageKey === "default.solution_fit"
          ? { ...s, requiredExitFields: ["solutionFitConfirmed", "primaryContactRole"] }
          : s,
      ),
      transitions: wf.transitions.map((tr) =>
        tr.fromStageKey === "default.solution_fit" && tr.toStageKey === "default.proposal"
          ? { ...tr, rules: { ...tr.rules, promptForComment: false, promptFields: [] } }
          : tr,
      ),
    });

    const missingInputs = { ...baseOpp, solutionFitConfirmed: false, primaryContactRole: null };
    expect(evaluateOptimisticDealStageMove(missingInputs, "default.proposal", []).status).toBe("needs_modal");
    expect(evaluateOptimisticDealStageMove(baseOpp, "default.proposal", []).status).toBe("allowed");
  });

  it("reverts optimistic stage move and sets error without opening MoveStageDialog when backend rejects", async () => {
    const mockMoveStage = vi.fn().mockRejectedValue(new Error("Backend rejected stage transition"));
    setCrmContainer({
      overviewService: {} as never,
      overviewRepository: {} as never,

      workflowService: {} as never,

      workflowRepository: {} as never,
      reportsService: {} as never,
      reportsRepository: {} as never,
      settingsService: {} as never,
      settingsRepository: {} as never,
      leadService: {} as never,
      leadRepository: {} as never,
      opportunityService: {} as never,
      opportunityRepository: { moveStage: mockMoveStage } as never,
      accountService: {} as never,
      accountRepository: {} as never,
      contactService: {} as never,
      contactRepository: {} as never,
      activityService: {} as never,
      activityRepository: {} as never,
      entityLookup: {} as never,
    } as CrmContainer);

    const wf = useCrmWorkflowsStore.getState().getActiveWorkflow("deal");
    useCrmWorkflowsStore.getState().saveWorkflow({
      ...wf,
      transitions: wf.transitions.map((tr) =>
        tr.fromStageKey === "default.discovery" && tr.toStageKey === "default.qualification"
          ? { ...tr, rules: { ...tr.rules, promptForComment: false, promptFields: [], requiredFieldKeys: [] } }
          : tr,
      ),
    });

    const discoveryOpp: CrmOpportunity = { ...baseOpp, stageKey: "default.discovery" };
    const fetchOpportunities = vi.fn().mockResolvedValue(undefined);
    const openCloseDialog = vi.fn();
    const openMoveStageDialog = vi.fn();
    const updateItemStageOptimistic = vi.fn();
    const setIsSubmitting = vi.fn();
    const setSubmitError = vi.fn();

    const { result } = renderHook(() =>
      useOpportunityStageActions(
        fetchOpportunities,
        1,
        [],
        openCloseDialog,
        openMoveStageDialog,
        updateItemStageOptimistic,
        setIsSubmitting,
        setSubmitError,
      ),
    );

    let ok = true;
    await act(async () => {
      ok = await result.current.handleMoveStageOptimistic(discoveryOpp, "default.qualification");
    });

    expect(ok).toBe(false);
    expect(updateItemStageOptimistic).toHaveBeenNthCalledWith(1, discoveryOpp.id, "default.qualification");
    expect(updateItemStageOptimistic).toHaveBeenNthCalledWith(2, discoveryOpp.id, "default.discovery");
    expect(openMoveStageDialog).not.toHaveBeenCalled();
    expect(openCloseDialog).not.toHaveBeenCalled();
    expect(setSubmitError).toHaveBeenCalledWith("Backend rejected stage transition");
  });
});
