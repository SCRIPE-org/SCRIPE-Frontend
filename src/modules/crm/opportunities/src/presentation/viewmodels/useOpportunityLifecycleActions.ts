"use client";

import { useState, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmWorkflowsStore } from "@modules/crm";
import type {
  CrmOpportunity,
  AssignOpportunityOwnerInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  OpportunityStatus,
  PipelineDefinition,
  UpdateDefaultPipelineInput,
} from "../../domain/entities/OpportunityEntity";

export function useOpportunityLifecycleActions(
  fetchOpportunities: (page?: number) => Promise<void>,
  currentPage: number,
  setIsSubmitting: (val: boolean) => void,
  setSubmitError: (val: string | null) => void,
) {
  const [pipeline, setPipeline] = useState<PipelineDefinition | null>(null);
  const [isPipelineAdminOpen, setIsPipelineAdminOpen] = useState(false);
  const [isMoveStageOpen, setIsMoveStageOpen] = useState(false);
  const [targetMoveStageKey, setTargetMoveStageKey] = useState<string | undefined>(undefined);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [activeOpportunity, setActiveOpportunity] = useState<CrmOpportunity | null>(null);
  const [closeInitialOutcome, setCloseInitialOutcome] = useState<OpportunityStatus>("Won");
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      if (repo?.getDefaultPipeline) {
        const pipe = await repo.getDefaultPipeline();
        setPipeline(pipe);
        if (pipe && pipe.stages && pipe.stages.length >= 2) {
          useCrmWorkflowsStore.getState().syncBackendDealPipeline(pipe as any);
        }
      }
    } catch {
      // Fallback to default canonical stages
    }
    void useCrmWorkflowsStore.getState().fetchPipelinesFromBackend();
  }, []);

  const handleUpdatePipeline = useCallback(
    async (input: UpdateDefaultPipelineInput): Promise<boolean> => {
      setIsSubmitting(true);
      setPipelineError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        const updated = await repo.updateDefaultPipeline(input);
        setPipeline(updated);
        if (updated && updated.stages && updated.stages.length >= 2) {
          useCrmWorkflowsStore.getState().syncBackendDealPipeline(updated as any);
        }
        await fetchOpportunities(currentPage);
        setIsSubmitting(false);
        setIsPipelineAdminOpen(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setPipelineError(err.message || "Failed to update pipeline configuration");
        return false;
      }
    },
    [fetchOpportunities, currentPage, setIsSubmitting],
  );

  const openMoveStageDialog = useCallback(
    (opp: CrmOpportunity, targetStageKeyParam?: string) => {
      setActiveOpportunity(opp);
      setTargetMoveStageKey(targetStageKeyParam);
      setSubmitError(null);
      setIsMoveStageOpen(true);
    },
    [setSubmitError],
  );

  const openCloseDialog = useCallback(
    (opp: CrmOpportunity, outcome: OpportunityStatus = "Won") => {
      setActiveOpportunity(opp);
      setCloseInitialOutcome(outcome);
      setSubmitError(null);
      setIsCloseOpen(true);
    },
    [setSubmitError],
  );

  const openReopenDialog = useCallback(
    (opp: CrmOpportunity) => {
      setActiveOpportunity(opp);
      setSubmitError(null);
      setIsReopenOpen(true);
    },
    [setSubmitError],
  );

  const openAssignOwnerDialog = useCallback(
    (opp: CrmOpportunity) => {
      setActiveOpportunity(opp);
      setSubmitError(null);
      setIsAssignOwnerOpen(true);
    },
    [setSubmitError],
  );

  const handleCloseOpportunity = useCallback(
    async (input: CloseOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.closeOpportunity(input);
        await fetchOpportunities(currentPage);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to close opportunity");
        return false;
      }
    },
    [fetchOpportunities, currentPage, setIsSubmitting, setSubmitError],
  );

  const handleReopenOpportunity = useCallback(
    async (input: ReopenOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.reopenOpportunity(input);
        await fetchOpportunities(currentPage);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to reopen opportunity");
        return false;
      }
    },
    [fetchOpportunities, currentPage, setIsSubmitting, setSubmitError],
  );

  const handleAssignOwner = useCallback(
    async (input: AssignOpportunityOwnerInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.assignOwner(input);
        await fetchOpportunities(currentPage);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to assign owner");
        return false;
      }
    },
    [fetchOpportunities, currentPage, setIsSubmitting, setSubmitError],
  );

  return {
    pipeline,
    isPipelineAdminOpen,
    setIsPipelineAdminOpen,
    isMoveStageOpen,
    setIsMoveStageOpen,
    targetMoveStageKey,
    isCloseOpen,
    setIsCloseOpen,
    isReopenOpen,
    setIsReopenOpen,
    isAssignOwnerOpen,
    setIsAssignOwnerOpen,
    activeOpportunity,
    closeInitialOutcome,
    pipelineError,
    setPipelineError,
    fetchPipeline,
    handleUpdatePipeline,
    openMoveStageDialog,
    openCloseDialog,
    openReopenDialog,
    openAssignOwnerDialog,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
  };
}
