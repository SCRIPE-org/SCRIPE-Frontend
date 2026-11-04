"use client";

import { useState, useEffect, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  OpportunityDetailResult,
  OpportunityStatus,
  MoveOpportunityStageInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  AssignOpportunityOwnerInput,
  CrmPipelineConfig,
} from "../../domain/entities/OpportunityEntity";

/**
 * State contract for the single opportunity detail view.
 */
export interface OpportunityDetailState {
  loading: boolean;
  error: string | null;
  data: OpportunityDetailResult | null;
  isMoveStageOpen: boolean;
  isCloseOpen: boolean;
  isReopenOpen: boolean;
  isAssignOwnerOpen: boolean;
  closeInitialOutcome: OpportunityStatus;
  isSubmitting: boolean;
  submitError: string | null;
}

/**
 * ViewModel hook orchestrating single opportunity details, audit history, and lifecycle transitions.
 */
export function useOpportunityDetailViewModel(opportunityId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OpportunityDetailResult | null>(null);
  const [pipeline, setPipeline] = useState<CrmPipelineConfig | null>(null);

  const [isMoveStageOpen, setIsMoveStageOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [closeInitialOutcome, setCloseInitialOutcome] = useState<OpportunityStatus>("Won");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const container = getCrmContainer() as any;
      const repo = container.opportunityRepository;
      const [result, pipelineRes] = await Promise.all([
        repo.getOpportunityById(opportunityId),
        typeof repo.getDefaultPipeline === "function"
          ? repo.getDefaultPipeline().catch(() => null)
          : Promise.resolve(null),
      ]);
      setData(result);
      if (pipelineRes) {
        setPipeline(pipelineRes);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load opportunity details");
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lookupPartyOptions = useCallback(async () => {
    try {
      const container = getCrmContainer();
      const [accountsRes, candidates] = await Promise.all([
        typeof container.accountRepository?.getAccounts === "function"
          ? container.accountRepository.getAccounts({ page: 1, pageSize: 50 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        typeof container.accountRepository?.lookupCandidateParties === "function"
          ? container.accountRepository.lookupCandidateParties("Organization").catch(() => [])
          : Promise.resolve([]),
      ]);

      const map = new Map<string, { id: string; accountId?: string; displayName: string }>();
      for (const acc of accountsRes.items || []) {
        if (acc.partyId) {
          map.set(acc.partyId, {
            id: acc.partyId,
            accountId: acc.id,
            displayName: acc.legalNameEn || acc.legalNameAr || "Commercial Account",
          });
        }
      }
      for (const cand of candidates || []) {
        if (!map.has(cand.partyId)) {
          map.set(cand.partyId, {
            id: cand.partyId,
            displayName: cand.displayNameEn || cand.displayNameAr || "Organization",
          });
        }
      }
      return Array.from(map.values());
    } catch {
      return [];
    }
  }, []);

  const handleMoveStage = async (input: MoveOpportunityStageInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      await repo.moveStage(input);
      await loadData();
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to move stage");
      return false;
    }
  };

  const handleCloseOpportunity = async (input: CloseOpportunityInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      await repo.closeOpportunity(input);
      await loadData();
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to close opportunity");
      return false;
    }
  };

  const handleReopenOpportunity = async (input: ReopenOpportunityInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      await repo.reopenOpportunity(input);
      await loadData();
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to reopen opportunity");
      return false;
    }
  };

  const handleAssignOwner = async (input: AssignOpportunityOwnerInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      await repo.assignOwner(input);
      await loadData();
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to assign owner");
      return false;
    }
  };

  return {
    loading,
    error,
    data,
    pipeline,
    loadData,
    lookupPartyOptions,
    isMoveStageOpen,
    setIsMoveStageOpen,
    isCloseOpen,
    setIsCloseOpen,
    isReopenOpen,
    setIsReopenOpen,
    isAssignOwnerOpen,
    setIsAssignOwnerOpen,
    closeInitialOutcome,
    setCloseInitialOutcome,
    isSubmitting,
    submitError,
    setSubmitError,
    handleMoveStage,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
  };
}
