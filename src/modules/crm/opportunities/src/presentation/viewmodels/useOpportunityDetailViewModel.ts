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
      const repo = (getCrmContainer() as any).opportunityRepository;
      const result = await repo.getOpportunityById(opportunityId);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load opportunity details");
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    loadData,
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
