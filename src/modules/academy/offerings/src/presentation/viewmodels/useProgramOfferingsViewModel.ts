"use client";

import { useState, useEffect, useCallback } from "react";
import type { IProgramOfferingsRepository } from "../../domain/interfaces/IProgramOfferingsRepository";
import type { ProgramOffering, CreateOfferingPayload } from "../../domain/entities/ProgramOffering";

export interface ProgramOfferingsViewModelState {
  stage: "loading" | "ready" | "error";
  offerings: ProgramOffering[];
  isCreateOpen: boolean;
  submitting: boolean;
  errorMessage: string | null;
}

export function useProgramOfferingsViewModel(repository: IProgramOfferingsRepository) {
  const [state, setState] = useState<ProgramOfferingsViewModelState>({
    stage: "loading",
    offerings: [],
    isCreateOpen: false,
    submitting: false,
    errorMessage: null,
  });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, stage: "loading", errorMessage: null }));
    try {
      const offerings = await repository.fetchOfferings();
      setState((prev) => ({
        ...prev,
        stage: "ready",
        offerings,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load program offerings.";
      setState((prev) => ({ ...prev, stage: "error", errorMessage: msg }));
    }
  }, [repository]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateDialog = () => {
    setState((prev) => ({ ...prev, isCreateOpen: true, errorMessage: null }));
  };

  const closeCreateDialog = () => {
    setState((prev) => ({ ...prev, isCreateOpen: false, errorMessage: null }));
  };

  const createOffering = async (payload: CreateOfferingPayload) => {
    setState((prev) => ({ ...prev, submitting: true, errorMessage: null }));
    try {
      const newOffering = await repository.createOffering(payload);
      setState((prev) => ({
        ...prev,
        submitting: false,
        isCreateOpen: false,
        offerings: [newOffering, ...prev.offerings],
      }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create program offering.";
      setState((prev) => ({ ...prev, submitting: false, errorMessage: msg }));
      return false;
    }
  };

  return {
    state,
    openCreateDialog,
    closeCreateDialog,
    createOffering,
    reload: loadData,
  };
}
