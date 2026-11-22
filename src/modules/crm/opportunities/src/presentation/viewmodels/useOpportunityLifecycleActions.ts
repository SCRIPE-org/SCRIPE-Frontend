"use client";

import { useState, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import { qk } from "@core/common/query-keys";
import { useCrmTenantScope, useSafeQueryClient, useCrmWorkflowsStore } from "@modules/crm";
import type {
  CrmOpportunity,
  AssignOpportunityOwnerInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  PipelineDefinition,
} from "../../domain/entities/OpportunityEntity";

/** Lifecycle dialog & mutation actions for CRM Opportunities (owner assignment & pipeline hydration). */
export function useOpportunityLifecycleActions(
  fetchOpportunities: (page?: number) => Promise<void>,
  currentPage: number,
  setIsSubmitting: (val: boolean) => void,
  setSubmitError: (val: string | null) => void,
) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [pipeline, setPipeline] = useState<PipelineDefinition | null>(null);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [activeOpportunity, setActiveOpportunity] = useState<CrmOpportunity | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      const wfRepo = getCrmContainer().workflowRepository;
      if (typeof wfRepo?.getPipelines === "function") {
        const pipes = await wfRepo.getPipelines("deal");
        if (Array.isArray(pipes) && pipes.length > 0) {
          const activePipe = pipes.find((p) => p.isDefault) ?? pipes[0];
          setPipeline(activePipe);
          useCrmWorkflowsStore.getState().hydrateFromBackendPipelines(pipes);
        }
      }
    } catch {
      // Fallback to default workflow catalog
    }
  }, []);

  const openAssignOwnerDialog = useCallback(
    (opp: CrmOpportunity) => {
      setActiveOpportunity(opp);
      setSubmitError(null);
      setIsAssignOwnerOpen(true);
    },
    [setSubmitError],
  );

  const runMutation = useCallback(
    async (op: () => Promise<unknown>, fallbackMsg: string): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await op();
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.opportunities(tenantId) });
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.overview(tenantId) });
        await fetchOpportunities(currentPage);
        setIsSubmitting(false);
        return true;
      } catch (err: unknown) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : fallbackMsg);
        return false;
      }
    },
    [currentPage, fetchOpportunities, safeQueryClient, setIsSubmitting, setSubmitError, tenantId],
  );

  const handleCloseOpportunity = useCallback(
    (input: CloseOpportunityInput) =>
      runMutation(() => getCrmContainer().opportunityRepository.closeOpportunity(input), "Failed to close opportunity"),
    [runMutation],
  );

  const handleReopenOpportunity = useCallback(
    (input: ReopenOpportunityInput) =>
      runMutation(() => getCrmContainer().opportunityRepository.reopenOpportunity(input), "Failed to reopen opportunity"),
    [runMutation],
  );

  const handleAssignOwner = useCallback(
    (input: AssignOpportunityOwnerInput) =>
      runMutation(() => getCrmContainer().opportunityRepository.assignOwner(input), "Failed to assign owner"),
    [runMutation],
  );

  return {
    pipeline,
    isAssignOwnerOpen,
    setIsAssignOwnerOpen,
    activeOpportunity,
    fetchPipeline,
    openAssignOwnerDialog,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
  };
}
