"use client";

import { useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } from "@core/crud/customFieldsExtension";
import type {
  CrmOpportunity,
  CreateOpportunityInput,
  MoveOpportunityStageInput,
  OpportunityStatus,
} from "../../domain/entities/OpportunityEntity";
import { evaluateOptimisticDealStageMove } from "./useOpportunityViewModelHelpers";

export function useOpportunityStageActions(
  fetchOpportunities: (page?: number) => Promise<void>,
  currentPage: number,
  effectivePipelineStages: any[],
  openCloseDialog: (opp: CrmOpportunity, outcome: OpportunityStatus) => void,
  openMoveStageDialog: (opp: CrmOpportunity, targetStageKeyParam?: string) => void,
  updateItemStageOptimistic: (oppId: string, newStageKey: string, fullItem?: CrmOpportunity) => void,
  setIsSubmitting: (val: boolean) => void,
  setSubmitError: (val: string | null) => void,
) {
  const handleCreateOpportunity = useCallback(
    async (input: CreateOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        const created = await repo.createOpportunity(input);
        if (created?.id && input.customFieldValues && Object.keys(input.customFieldValues).length > 0) {
          try {
            const normalized = normalizeCustomFieldValuesForSave(input.customFieldValues);
            if (Object.keys(normalized).length > 0) {
              await getCustomFieldsExtension()?.saveValues("crm.opportunity", created.id, normalized);
            }
          } catch {}
        }
        await fetchOpportunities(1);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to create opportunity");
        return false;
      }
    },
    [fetchOpportunities, setIsSubmitting, setSubmitError],
  );

  const handleMoveStage = useCallback(
    async (input: MoveOpportunityStageInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.moveStage(input);
        if (input.opportunityId && input.customFieldValues && Object.keys(input.customFieldValues).length > 0) {
          try {
            const normalized = normalizeCustomFieldValuesForSave(input.customFieldValues);
            if (Object.keys(normalized).length > 0) {
              await getCustomFieldsExtension()?.saveValues("crm.opportunity", input.opportunityId, normalized);
            }
          } catch {}
        }
        await fetchOpportunities(currentPage);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to move opportunity stage");
        return false;
      }
    },
    [fetchOpportunities, currentPage, setIsSubmitting, setSubmitError],
  );

  const handleMoveStageOptimistic = useCallback(
    async (opportunity: CrmOpportunity, targetStageKey: string, overrideReason?: string): Promise<boolean> => {
      if (opportunity.stageKey === targetStageKey) return true;
      const decision = evaluateOptimisticDealStageMove(
        opportunity,
        targetStageKey,
        effectivePipelineStages,
        overrideReason,
      );
      if (decision.status === "close_won") {
        openCloseDialog(opportunity, "Won");
        return false;
      }
      if (decision.status === "close_lost") {
        openCloseDialog(opportunity, "Lost");
        return false;
      }
      if (decision.status === "blocked") {
        setSubmitError(decision.errorReason || "Transition restricted.");
        return false;
      }
      if (decision.status === "needs_modal") {
        openMoveStageDialog(opportunity, targetStageKey);
        return false;
      }

      setSubmitError(null);
      updateItemStageOptimistic(opportunity.id, targetStageKey);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        const updatedOpp = await repo.moveStage({
          opportunityId: opportunity.id,
          targetStageKey,
          reason: overrideReason,
          expectedRowVersion: opportunity.rowVersion,
        });
        if (updatedOpp && updatedOpp.id) {
          updateItemStageOptimistic(updatedOpp.id, updatedOpp.stageKey, updatedOpp);
        }
        await fetchOpportunities(currentPage);
        return true;
      } catch (err: any) {
        updateItemStageOptimistic(opportunity.id, opportunity.stageKey);
        setSubmitError(err.message || "Failed to move opportunity stage");
        return false;
      }
    },
    [
      effectivePipelineStages,
      fetchOpportunities,
      openCloseDialog,
      openMoveStageDialog,
      currentPage,
      setSubmitError,
      updateItemStageOptimistic,
    ],
  );

  return {
    handleCreateOpportunity,
    handleMoveStage,
    handleMoveStageOptimistic,
  };
}
