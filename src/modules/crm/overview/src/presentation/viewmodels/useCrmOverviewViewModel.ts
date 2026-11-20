"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import {
  useCrmCurrency,
  useCrmTenantScope,
  useSafeQueryClient,
} from "@modules/crm/shared";
import {
  OverviewEntity,
  type CrmOverviewData,
  type CrmStageKey,
  type CrmPipelineOverview,
  type CrmStageSummary,
} from "../../domain/entities/OverviewEntity";
import { useCrmWorkflowsStore } from "@modules/crm";

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
 * Uses TanStack Query v5 for scoped overview retrieval, supports dynamic pipeline filtering,
 * and exposes responsive stage selection.
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
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(initialPipelineId);
  const [selectedStage, setSelectedStage] = useState<CrmStageKey | undefined>(undefined);

  const workflows = useCrmWorkflowsStore((s) => s.workflows);
  const dealWorkflows = workflows.filter((w) => w.entityType === "deal");
  const { baseCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();

  const overviewQuery = useQuery(
    {
      queryKey: qk.crm.overview(tenantId, searchQuery),
      queryFn: () => getCrmContainer().overviewRepository.getOverview(searchQuery),
    },
    safeQueryClient
  );

  const rawResult = overviewQuery.data;
  const overviewData: CrmOverviewData | null = rawResult
    ? rawResult instanceof OverviewEntity
      ? rawResult.toDto()
      : (rawResult as unknown as CrmOverviewData)
    : null;

  const state: CrmOverviewState = {
    stage: overviewQuery.isLoading
      ? "loading"
      : overviewQuery.isError
        ? "failed"
        : overviewData
          ? "success"
          : "idle",
    data: overviewData,
    error:
      overviewQuery.error instanceof Error
        ? overviewQuery.error.message
        : overviewQuery.isError
          ? "Failed to load CRM overview"
          : null,
  };

  const refresh = useCallback(() => {
    void overviewQuery.refetch();
  }, [overviewQuery]);

  const selectStage = useCallback((stageKey: CrmStageKey) => {
    setSelectedStage((curr) => (curr === stageKey ? undefined : stageKey));
  }, []);

  let effectivePipeline: CrmPipelineOverview | null = null;
  let pipelineDeals = overviewData?.recentDeals ?? [];

  if (overviewData) {
    if (selectedPipelineId === "all") {
      effectivePipeline = overviewData.pipeline;
      pipelineDeals = overviewData.recentDeals;
    } else {
      const selectedWf = workflows.find((w) => w.id === selectedPipelineId);
      if (!selectedWf || !selectedWf.stages || selectedWf.stages.length === 0) {
        effectivePipeline = overviewData.pipeline;
        pipelineDeals = overviewData.recentDeals;
      } else {
        const sortedStages = [...selectedWf.stages].sort((a, b) => a.sortOrder - b.sortOrder);
        const stageKeySet = new Set(sortedStages.map((s) => s.stageKey));
        const fallbackCurr = overviewData.pipeline.currency || "SAR";
        const targetCurrency = autoConvertToBase ? baseCurrency : fallbackCurr;

        const stageSummaries: CrmStageSummary[] = sortedStages.map((st) => {
          const stageDeals = overviewData.recentDeals.filter((d) => d.stageKey === st.stageKey);
          const stageValue = stageDeals.reduce((sum, d) => {
            const dealCurr = (d.currency || fallbackCurr).toUpperCase();
            const amt = d.amount || 0;
            if (autoConvertToBase) {
              return sum + Math.round(convertAmount(amt, dealCurr, targetCurrency));
            }
            return dealCurr === targetCurrency.toUpperCase() ? sum + amt : sum;
          }, 0);
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

        effectivePipeline = {
          id: selectedWf.id,
          name: isRtl ? (selectedWf.nameAr || selectedWf.nameEn) : selectedWf.nameEn,
          stages: stageSummaries,
          totalDeals,
          totalPipelineValue,
          currency: targetCurrency,
        };
        pipelineDeals = overviewData.recentDeals.filter((d) => stageKeySet.has(d.stageKey));
      }
    }
  }

  const filteredDeals = selectedStage
    ? pipelineDeals.filter((d) => d.stageKey === selectedStage)
    : pipelineDeals;

  return {
    state,
    dealWorkflows,
    selectedPipelineId,
    setSelectedPipelineId,
    effectivePipeline,
    selectedStage,
    filteredDeals,
    isPending: overviewQuery.isFetching,
    refresh,
    selectStage,
  };
}
