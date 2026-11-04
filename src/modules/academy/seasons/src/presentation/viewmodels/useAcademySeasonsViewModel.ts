"use client";

import { useState, useEffect, useCallback } from "react";
import type { IAcademySeasonsRepository } from "../../domain/interfaces/IAcademySeasonsRepository";
import type { AcademySeason, CreateSeasonPayload } from "../../domain/entities/AcademySeason";

export interface AcademySeasonsViewModelState {
  stage: "loading" | "ready" | "error";
  seasons: AcademySeason[];
  isCreateOpen: boolean;
  submitting: boolean;
  errorMessage: string | null;
}

export function useAcademySeasonsViewModel(repository: IAcademySeasonsRepository) {
  const [state, setState] = useState<AcademySeasonsViewModelState>({
    stage: "loading",
    seasons: [],
    isCreateOpen: false,
    submitting: false,
    errorMessage: null,
  });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, stage: "loading", errorMessage: null }));
    try {
      const seasons = await repository.fetchSeasons();
      setState((prev) => ({
        ...prev,
        stage: "ready",
        seasons,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load seasons.";
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

  const createSeason = async (payload: CreateSeasonPayload) => {
    setState((prev) => ({ ...prev, submitting: true, errorMessage: null }));
    try {
      const newSeason = await repository.createSeason(payload);
      setState((prev) => ({
        ...prev,
        submitting: false,
        isCreateOpen: false,
        seasons: [newSeason, ...prev.seasons],
      }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create season.";
      setState((prev) => ({ ...prev, submitting: false, errorMessage: msg }));
      return false;
    }
  };

  return {
    state,
    openCreateDialog,
    closeCreateDialog,
    createSeason,
    reload: loadData,
  };
}
