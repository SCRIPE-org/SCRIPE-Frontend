"use client";

import { useState, useEffect, useCallback } from "react";
import type { IExternalLocationsRepository } from "../../domain/interfaces/IExternalLocationsRepository";
import type { ExternalLocation, CreateLocationPayload } from "../../domain/entities/ExternalLocation";

export interface ExternalLocationsViewModelState {
  stage: "loading" | "ready" | "error";
  locations: ExternalLocation[];
  isCreateOpen: boolean;
  submitting: boolean;
  errorMessage: string | null;
}

export function useExternalLocationsViewModel(repository: IExternalLocationsRepository) {
  const [state, setState] = useState<ExternalLocationsViewModelState>({
    stage: "loading",
    locations: [],
    isCreateOpen: false,
    submitting: false,
    errorMessage: null,
  });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, stage: "loading", errorMessage: null }));
    try {
      const locations = await repository.fetchLocations();
      setState((prev) => ({
        ...prev,
        stage: "ready",
        locations,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load external locations.";
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

  const createLocation = async (payload: CreateLocationPayload) => {
    setState((prev) => ({ ...prev, submitting: true, errorMessage: null }));
    try {
      const newLoc = await repository.createLocation(payload);
      setState((prev) => ({
        ...prev,
        submitting: false,
        isCreateOpen: false,
        locations: [newLoc, ...prev.locations],
      }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create external location.";
      setState((prev) => ({ ...prev, submitting: false, errorMessage: msg }));
      return false;
    }
  };

  return {
    state,
    openCreateDialog,
    closeCreateDialog,
    createLocation,
    reload: loadData,
  };
}
