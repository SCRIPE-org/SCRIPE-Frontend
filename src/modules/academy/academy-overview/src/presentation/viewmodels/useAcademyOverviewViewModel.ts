"use client";

import { useState, useEffect, useCallback } from "react";
import type { AcademyOverviewState } from "../../domain/entities/AcademyOverview";
import type { IAcademyOverviewRepository } from "../../domain/interfaces/IAcademyOverviewRepository";

const INITIAL_STATE: AcademyOverviewState = {
  stage: "loading",
  isEnabled: false,
  tenantId: null,
  maxAthletes: 0,
  maxPrograms: 0,
  maxTrainingGroups: 0,
  activeProgramsCount: 0,
  activeOfferingsCount: 0,
  activeEnrollmentsCount: 0,
  pendingTrialsCount: 0,
  configuredFeatures: [],
  statusMessage: "",
  error: null,
};

export function useAcademyOverviewViewModel(repository: IAcademyOverviewRepository) {
  const [state, setState] = useState<AcademyOverviewState>(INITIAL_STATE);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await repository.getOverview();
      setState(data);
    } catch (err: unknown) {
      setState({
        ...INITIAL_STATE,
        stage: "failed",
        error: err instanceof Error ? err.message : "Failed to load Academy overview",
      });
    }
  }, [repository]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOverview();
    } finally {
      setRefreshing(false);
    }
  }, [fetchOverview]);

  return {
    state,
    refreshing,
    refresh,
  };
}
