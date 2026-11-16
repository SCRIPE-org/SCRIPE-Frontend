"use client";

import { useState, useEffect, useCallback } from "react";
import type { IAcademySeasonsRepository } from "../../domain/interfaces/IAcademySeasonsRepository";
import type { AcademySeason, CreateSeasonPayload, UpdateSeasonPayload } from "../../domain/entities/AcademySeason";

export interface AcademySeasonsViewModelState {
  stage: "loading" | "ready" | "error";
  seasons: AcademySeason[];
  selectedSeasonId: string | null;
  isCreateOpen: boolean;
  submitting: boolean;
  errorMessage: string | null;
}

export function useAcademySeasonsViewModel(
  repository: IAcademySeasonsRepository,
  initialSeasonId?: string | null
) {
  const [state, setState] = useState<AcademySeasonsViewModelState>({
    stage: "loading",
    seasons: [],
    selectedSeasonId: initialSeasonId || null,
    isCreateOpen: false,
    submitting: false,
    errorMessage: null,
  });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, stage: "loading", errorMessage: null }));
    try {
      const seasons = await repository.fetchSeasons();
      setState((prev) => {
        let activeId = prev.selectedSeasonId;
        if (!activeId && seasons.length > 0) {
          const activeSeason = seasons.find((s) => s.status === "Active") || seasons[0];
          activeId = activeSeason.id;
        } else if (activeId && !seasons.some((s) => s.id === activeId) && seasons.length > 0) {
          activeId = seasons[0].id;
        }
        return {
          ...prev,
          stage: "ready",
          seasons,
          selectedSeasonId: activeId,
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load seasons.";
      setState((prev) => ({ ...prev, stage: "error", errorMessage: msg }));
    }
  }, [repository]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectSeason = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedSeasonId: id }));
  }, []);

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
        selectedSeasonId: newSeason.id,
      }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create season.";
      setState((prev) => ({ ...prev, submitting: false, errorMessage: msg }));
      return false;
    }
  };

  const updateSeason = async (id: string, payload: UpdateSeasonPayload) => {
    setState((prev) => ({ ...prev, submitting: true, errorMessage: null }));
    try {
      const updated = await repository.updateSeason(id, payload);
      setState((prev) => ({
        ...prev,
        submitting: false,
        seasons: prev.seasons.map((s) => (s.id === id ? updated : s)),
      }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update season.";
      setState((prev) => ({ ...prev, submitting: false, errorMessage: msg }));
      return false;
    }
  };

  return {
    state,
    selectSeason,
    openCreateDialog,
    closeCreateDialog,
    createSeason,
    updateSeason,
    reload: loadData,
  };
}
