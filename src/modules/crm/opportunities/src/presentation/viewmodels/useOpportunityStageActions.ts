"use client";

import { useCallback } from "react";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } from "@core/crud/customFieldsExtension";
import type {
  CrmOpportunity,
  CreateOpportunityInput,
  MoveOpportunityStageInput,
  OpportunityStatus,
  PipelineStageConfig,
} from "../../domain/entities/OpportunityEntity";
import { evaluateOptimisticDealStageMove } from "../utils/opportunityViewModelHelpers";

/** Stage creation and transition mutation hooks for Opportunities with TanStack Query invalidation. */
export function useOpportunityStageActions(
  fetchOpportunities: (page?: number) => Promise<void>,
  currentPage: number,
  effectivePipelineStages: PipelineStageConfig[],
  onRequestCloseOutcome: (opp: CrmOpportunity, outcome: OpportunityStatus) => void,
  onRequestTransitionScreen: (opp: CrmOpportunity, targetStageKey?: string) => void,
  updateItemStageOptimistic: (oppId: string, newStageKey: string, fullItem?: CrmOpportunity) => void,
  setIsSubmitting: (val: boolean) => void,
  setSubmitError: (val: string | null) => void,
) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();

  const invalidateDealCaches = useCallback(async () => {
    await safeQueryClient.invalidateQueries({ queryKey: qk.crm.opportunities(tenantId) });
    await safeQueryClient.invalidateQueries({ queryKey: qk.crm.overview(tenantId) });
  }, [safeQueryClient, tenantId]);

  const handleCreateOpportunity = useCallback(
    async (input: CreateOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = getCrmContainer().opportunityRepository;
        const created = await repo.createOpportunity(input);
        if (created?.id && input.customFieldValues && Object.keys(input.customFieldValues).length > 0) {
          try {
            const normalized = normalizeCustomFieldValuesForSave(input.customFieldValues);
            if (Object.keys(normalized).length > 0) {
              await getCustomFieldsExtension()?.saveValues("crm.opportunity", created.id, normalized);
            }
          } catch { /* non-blocking custom field write */ }
        }
        await invalidateDealCaches();
        await fetchOpportunities(1);
        setIsSubmitting(false);
        return true;
      } catch (err: unknown) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to create opportunity");
        return false;
      }
    },
    [fetchOpportunities, invalidateDealCaches, setIsSubmitting, setSubmitError],
  );

  const handleMoveStage = useCallback(
    async (input: MoveOpportunityStageInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = getCrmContainer().opportunityRepository;
        await repo.moveStage(input);
        if (input.opportunityId && input.customFieldValues && Object.keys(input.customFieldValues).length > 0) {
          try {
            const normalized = normalizeCustomFieldValuesForSave(input.customFieldValues);
            if (Object.keys(normalized).length > 0) {
              await getCustomFieldsExtension()?.saveValues("crm.opportunity", input.opportunityId, normalized);
            }
          } catch { /* non-blocking custom field write */ }
        }
        await invalidateDealCaches();
        await fetchOpportunities(currentPage);
        setIsSubmitting(false);
        return true;
      } catch (err: unknown) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to move opportunity stage");
        return false;
      }
    },
    [currentPage, fetchOpportunities, invalidateDealCaches, setIsSubmitting, setSubmitError],
  );

  const handleMoveStageOptimistic = useCallback(
    async (opportunity: CrmOpportunity, targetStageKey: string, overrideReason?: string): Promise<boolean> => {
      if (opportunity.stageKey === targetStageKey) return true;
      const decision = evaluateOptimisticDealStageMove(opportunity, targetStageKey, effectivePipelineStages, overrideReason);
      if (decision.status === "close_won") { onRequestCloseOutcome(opportunity, "Won"); return false; }
      if (decision.status === "close_lost") { onRequestCloseOutcome(opportunity, "Lost"); return false; }
      if (decision.status === "blocked") { setSubmitError(decision.errorReason || "Transition restricted."); return false; }
      if (decision.status === "needs_modal") { onRequestTransitionScreen(opportunity, targetStageKey); return false; }

      setSubmitError(null);
      updateItemStageOptimistic(opportunity.id, targetStageKey);
      try {
        const repo = getCrmContainer().opportunityRepository;
        const updatedOpp = await repo.moveStage({
          opportunityId: opportunity.id,
          targetStageKey,
          reason: overrideReason,
          expectedRowVersion: opportunity.rowVersion,
        });
        if (updatedOpp && updatedOpp.id) {
          updateItemStageOptimistic(updatedOpp.id, updatedOpp.stageKey, updatedOpp);
        }
        await invalidateDealCaches();
        await fetchOpportunities(currentPage);
        return true;
      } catch (err: unknown) {
        updateItemStageOptimistic(opportunity.id, opportunity.stageKey);
        setSubmitError(err instanceof Error ? err.message : "Failed to move opportunity stage");
        return false;
      }
    },
    [currentPage, effectivePipelineStages, fetchOpportunities, invalidateDealCaches, onRequestCloseOutcome, onRequestTransitionScreen, setSubmitError, updateItemStageOptimistic],
  );

  return {
    handleCreateOpportunity,
    handleMoveStage,
    handleMoveStageOptimistic,
  };
}
