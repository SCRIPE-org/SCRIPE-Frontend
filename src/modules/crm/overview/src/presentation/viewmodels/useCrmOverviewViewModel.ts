"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmOverviewData,
  CrmStageKey,
} from "../../domain/models/crm-overview.types";

/**
 * State contract for the top-level CRM overview dashboard.
 */
export interface CrmOverviewState {
  stage: "idle" | "loading" | "success" | "failed";
  data: CrmOverviewData | null;
  error: string | null;
}

/**
 * ViewModel hook aggregating commercial KPIs, pipeline health, and stage distribution metrics.
 * @param searchQuery - Optional text search query for filtering overview metrics.
 * @returns State and stage filter operations for the CRM overview dashboard.
 */
export function useCrmOverviewViewModel(searchQuery?: string) {
  const [state, setState] = useState<CrmOverviewState>({
    stage: "loading",
    data: null,
    error: null,
  });
  const [selectedStage, setSelectedStage] = useState<CrmStageKey | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async (query?: string) => {
    setState((prev) => ({ ...prev, stage: "loading", error: null }));
    try {
      const container = getCrmContainer();
      const overview = await container.overviewRepository.getOverview(query);
      setState({
        stage: "success",
        data: overview,
        error: null,
      });
    } catch (err) {
      setState({
        stage: "failed",
        data: null,
        error: err instanceof Error ? err.message : "Failed to load CRM overview",
      });
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadData(searchQuery);
    });
  }, [loadData, searchQuery]);

  const refresh = useCallback(() => {
    loadData(searchQuery);
  }, [loadData, searchQuery]);

  const selectStage = useCallback((stageKey: CrmStageKey) => {
    setSelectedStage((curr) => (curr === stageKey ? undefined : stageKey));
  }, []);

  // Filter deals by stage if a stage is selected
  const filteredDeals = state.data
    ? selectedStage
      ? state.data.recentDeals.filter((d) => d.stageKey === selectedStage)
      : state.data.recentDeals
    : [];

  return {
    state,
    selectedStage,
    filteredDeals,
    isPending,
    refresh,
    selectStage,
  };
}
