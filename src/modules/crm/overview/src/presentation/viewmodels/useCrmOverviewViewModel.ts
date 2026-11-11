"use client";

import { useState, useEffect, useCallback, useTransition, useMemo } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmOverviewData,
  CrmStageKey,
  CrmPipelineOverview,
  CrmStageSummary,
} from "../../domain/models/crm-overview.types";
import { useCrmWorkflowsStore } from "../stores/useCrmWorkflowsStore";

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
 * Supports dynamic deal pipeline filtering and responsive stage selection.
 *
 * @param searchQuery - Optional text search query for filtering overview metrics.
 * @param initialPipelineId - Initial deal pipeline identifier or "all" (default: "all").
 * @param isRtl - Whether right-to-left layout is active for localized stage names.
 * @returns State, dynamic pipeline projection, filtered deals, and stage selection actions.
 */
export function useCrmOverviewViewModel(
  searchQuery?: string,
  initialPipelineId: string = "all",
  isRtl: boolean = false
) {
  const [state, setState] = useState<CrmOverviewState>({
    stage: "loading",
    data: null,
    error: null,
  });
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(initialPipelineId);
  const [selectedStage, setSelectedStage] = useState<CrmStageKey | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const workflows = useCrmWorkflowsStore((s) => s.workflows);

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

  // Compute dynamic pipeline overview when a specific pipeline is selected
  const { effectivePipeline, pipelineDeals } = useMemo(() => {
    if (!state.data) {
      return { effectivePipeline: null, pipelineDeals: [] };
    }

    if (selectedPipelineId === "all") {
      return {
        effectivePipeline: state.data.pipeline,
        pipelineDeals: state.data.recentDeals,
      };
    }

    const selectedWf = workflows.find((w) => w.id === selectedPipelineId);
    if (!selectedWf || !selectedWf.stages || selectedWf.stages.length === 0) {
      return {
        effectivePipeline: state.data.pipeline,
        pipelineDeals: state.data.recentDeals,
      };
    }

    const sortedStages = [...selectedWf.stages].sort((a, b) => a.sortOrder - b.sortOrder);
    const stageKeySet = new Set(sortedStages.map((s) => s.stageKey));

    const stageSummaries: CrmStageSummary[] = sortedStages.map((st) => {
      const stageDeals = state.data!.recentDeals.filter((d) => d.stageKey === st.stageKey);
      const stageValue = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
      return {
        key: st.stageKey as CrmStageKey,
        name: isRtl ? (st.labelAr || st.labelEn) : st.labelEn,
        count: stageDeals.length,
        value: stageValue,
        sortOrder: st.sortOrder,
        requiresVerifiedParty: Boolean(st.requiresVerifiedParty),
      };
    });

    const totalDeals = stageSummaries.reduce((sum, s) => sum + s.count, 0);
    const totalPipelineValue = stageSummaries.reduce((sum, s) => sum + s.value, 0);

    const pipeline: CrmPipelineOverview = {
      id: selectedWf.id,
      name: isRtl ? (selectedWf.nameAr || selectedWf.nameEn) : selectedWf.nameEn,
      stages: stageSummaries,
      totalDeals,
      totalPipelineValue,
      currency: state.data.pipeline.currency || "SAR",
    };

    const deals = state.data.recentDeals.filter((d) => stageKeySet.has(d.stageKey));

    return { effectivePipeline: pipeline, pipelineDeals: deals };
  }, [state.data, selectedPipelineId, workflows, isRtl]);

  // Filter deals by stage if a stage is selected
  const filteredDeals = useMemo(() => {
    if (!selectedStage) return pipelineDeals;
    return pipelineDeals.filter((d) => d.stageKey === selectedStage);
  }, [pipelineDeals, selectedStage]);

  return {
    state,
    selectedPipelineId,
    setSelectedPipelineId,
    effectivePipeline,
    selectedStage,
    filteredDeals,
    isPending,
    refresh,
    selectStage,
  };
}