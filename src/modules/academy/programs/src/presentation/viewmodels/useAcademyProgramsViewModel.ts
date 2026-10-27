"use client";

import { useState, useEffect, useCallback } from "react";
import type { IAcademyProgramsRepository } from "../../domain/interfaces/IAcademyProgramsRepository";
import type { AcademyProgram, CreateProgramPayload, SportTaxonomyItem } from "../../domain/entities/AcademyProgram";

export interface AcademyProgramsViewModelState {
  stage: "loading" | "ready" | "error";
  programs: AcademyProgram[];
  sports: SportTaxonomyItem[];
  selectedSportId?: string;
  isCreateOpen: boolean;
  submitting: boolean;
  errorMessage: string | null;
}

export function useAcademyProgramsViewModel(repository: IAcademyProgramsRepository) {
  const [state, setState] = useState<AcademyProgramsViewModelState>({
    stage: "loading",
    programs: [],
    sports: [],
    selectedSportId: undefined,
    isCreateOpen: false,
    submitting: false,
    errorMessage: null,
  });

  const loadData = useCallback(async (sportId?: string) => {
    setState((prev) => ({ ...prev, stage: "loading", errorMessage: null }));
    try {
      const [programs, sports] = await Promise.all([
        repository.fetchPrograms(sportId),
        repository.fetchSports(),
      ]);
      setState((prev) => ({
        ...prev,
        stage: "ready",
        programs,
        sports,
        selectedSportId: sportId,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load Academy programs.";
      setState((prev) => ({ ...prev, stage: "error", errorMessage: msg }));
    }
  }, [repository]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setFilterSport = (sportId?: string) => {
    loadData(sportId);
  };

  const openCreateDialog = () => {
    setState((prev) => ({ ...prev, isCreateOpen: true, errorMessage: null }));
  };

  const closeCreateDialog = () => {
    setState((prev) => ({ ...prev, isCreateOpen: false, errorMessage: null }));
  };

  const createProgram = async (payload: CreateProgramPayload) => {
    setState((prev) => ({ ...prev, submitting: true, errorMessage: null }));
    try {
      const newProgram = await repository.createProgram(payload);
      setState((prev) => ({
        ...prev,
        submitting: false,
        isCreateOpen: false,
        programs: [newProgram, ...prev.programs],
      }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create program.";
      setState((prev) => ({ ...prev, submitting: false, errorMessage: msg }));
      return false;
    }
  };

  const publishProgram = async (id: string) => {
    setState((prev) => ({ ...prev, submitting: true, errorMessage: null }));
    try {
      const updated = await repository.publishProgram(id);
      setState((prev) => ({
        ...prev,
        submitting: false,
        programs: prev.programs.map((p) => (p.id === id ? updated : p)),
      }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish program.";
      setState((prev) => ({ ...prev, submitting: false, errorMessage: msg }));
      return false;
    }
  };

  return {
    state,
    setFilterSport,
    openCreateDialog,
    closeCreateDialog,
    createProgram,
    publishProgram,
    reload: () => loadData(state.selectedSportId),
  };
}
