"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useCrmWorkflowsStore } from "@modules/crm";
import type {
  CrmOpportunity,
  PipelineStageConfig,
} from "../../domain/entities/OpportunityEntity";

export interface KanbanStageDef {
  key: string;
  labelKey: string;
  defaultLabelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  winProbabilityPercent?: number | null;
  requiresParty?: boolean;
}

export const CANONICAL_KANBAN_STAGES: KanbanStageDef[] = [
  { key: "default.discovery", labelKey: "crmOpportunities.stages.discovery", defaultLabelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1 },
  { key: "default.qualification", labelKey: "crmOpportunities.stages.qualification", defaultLabelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2 },
  { key: "default.solution_fit", labelKey: "crmOpportunities.stages.solution_fit", defaultLabelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3 },
  { key: "default.proposal", labelKey: "crmOpportunities.stages.proposal", defaultLabelEn: "Proposal", labelAr: "عرض تجاري", sortOrder: 4, requiresParty: true },
  { key: "default.negotiation", labelKey: "crmOpportunities.stages.negotiation", defaultLabelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, requiresParty: true },
];

export interface UseKanbanBoardViewModelProps {
  opportunities: CrmOpportunity[];
  stages?: PipelineStageConfig[];
  onMoveStage: (opportunity: CrmOpportunity, targetStageKey: string) => Promise<boolean> | void;
  canUpdateOpportunity?: boolean;
  canManagePipelines?: boolean;
}

/**
 * Dedicated ViewModel hook for the CRM Opportunity Kanban Board.
 * Adheres strictly to MVVM architecture: encapsulates all drag-and-drop state,
 * stage adjacency evaluation, dynamic pipeline resolution, and terminal outcome drops.
 */
export function useKanbanBoardViewModel({
  opportunities,
  stages,
  onMoveStage,
  canUpdateOpportunity: propCanUpdate,
  canManagePipelines: propCanManage,
}: UseKanbanBoardViewModelProps) {
  const canUpdate = propCanUpdate !== undefined ? propCanUpdate : true;
  const canManage = propCanManage !== undefined ? propCanManage : true;

  const [dragOverOutcome, setDragOverOutcome] = useState<"won" | "lost" | null>(null);
  const [draggedOpportunity, setDraggedOpportunity] = useState<CrmOpportunity | null>(null);

  // Global window dragend listener ensuring draggedOpportunity resets if drag cancels outside columns
  useEffect(() => {
    const handleWindowDragEnd = () => {
      setDraggedOpportunity(null);
      setDragOverOutcome(null);
    };
    window.addEventListener("dragend", handleWindowDragEnd);
    return () => {
      window.removeEventListener("dragend", handleWindowDragEnd);
    };
  }, []);

  // Dynamically compute effective stages:
  // 1. Server-provided pipeline stages from props
  // 2. Active workflow stages from tenant workflow store
  const effectiveStages: KanbanStageDef[] = useMemo(() => {
    if (stages && stages.length > 0) {
      const sorted = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
      return sorted.map((s) => ({
        key: s.stageKey,
        labelKey: `crmOpportunities.stages.${s.stageKey.replace("default.", "")}`,
        defaultLabelEn: s.labelEn,
        labelAr: s.labelAr,
        sortOrder: s.sortOrder,
        winProbabilityPercent: s.winProbabilityPercent ?? s.probabilityPercent ?? null,
        requiresParty: s.requiresVerifiedParty,
      }));
    }

    // Dynamic fallback to the tenant's active deal workflow from store
    const activeWorkflow = useCrmWorkflowsStore.getState().getActiveWorkflow("deal");
    if (activeWorkflow?.stages && activeWorkflow.stages.length >= 2) {
      const sorted = [...activeWorkflow.stages].sort((a, b) => a.sortOrder - b.sortOrder);
      return sorted.map((s) => ({
        key: s.stageKey,
        labelKey: `crmOpportunities.stages.${s.stageKey.replace("default.", "")}`,
        defaultLabelEn: s.labelEn,
        labelAr: s.labelAr,
        sortOrder: s.sortOrder,
        winProbabilityPercent: s.winProbabilityPercent ?? null,
        requiresParty: s.requiresVerifiedParty ?? (s.stageKey.includes("proposal") || s.stageKey.includes("negotiation")),
      }));
    }

    return CANONICAL_KANBAN_STAGES;
  }, [stages]);

  // Group open opportunities by effective stage key
  const groupedOpportunities = useMemo(() => {
    const map = new Map<string, CrmOpportunity[]>();
    for (const stage of effectiveStages) {
      map.set(stage.key, []);
    }
    const fallbackKey = effectiveStages[0]?.key;

    for (const opp of opportunities) {
      if (opp.status === "Open") {
        if (map.has(opp.stageKey)) {
          map.get(opp.stageKey)!.push(opp);
        } else if (fallbackKey && map.has(fallbackKey)) {
          map.get(fallbackKey)!.push(opp);
        }
      }
    }

    return map;
  }, [opportunities, effectiveStages]);

  const wonDealsCount = useMemo(
    () => opportunities.filter((o) => o.status === "Won").length,
    [opportunities]
  );
  const lostDealsCount = useMemo(
    () => opportunities.filter((o) => o.status === "Lost").length,
    [opportunities]
  );

  const handleCardDragStart = useCallback((opp: CrmOpportunity) => {
    setDraggedOpportunity(opp);
  }, []);

  const handleCardDragEnd = useCallback(() => {
    setDraggedOpportunity(null);
  }, []);

  const handleDropOpportunity = useCallback(
    (opportunityId: string, targetStageKey: string) => {
      setDraggedOpportunity(null);
      const opp = opportunities.find((o) => o.id === opportunityId);
      if (!opp || opp.stageKey === targetStageKey) return;
      onMoveStage(opp, targetStageKey);
    },
    [opportunities, onMoveStage]
  );

  const handleMoveForward = useCallback(
    (opp: CrmOpportunity) => {
      const foundIndex = effectiveStages.findIndex((s) => s.key === opp.stageKey);
      const currentIndex = foundIndex >= 0 ? foundIndex : 0;
      if (currentIndex >= 0 && currentIndex < effectiveStages.length - 1) {
        const nextStage = effectiveStages[currentIndex + 1];
        onMoveStage(opp, nextStage.key);
      }
    },
    [effectiveStages, onMoveStage]
  );

  const handleMoveBackward = useCallback(
    (opp: CrmOpportunity) => {
      const currentIndex = effectiveStages.findIndex((s) => s.key === opp.stageKey);
      if (currentIndex > 0) {
        const prevStage = effectiveStages[currentIndex - 1];
        onMoveStage(opp, prevStage.key);
      }
    },
    [effectiveStages, onMoveStage]
  );

  const handleDragOverOutcome = useCallback(
    (e: React.DragEvent, outcome: "won" | "lost") => {
      e.preventDefault();
      if (canUpdate === false) {
        e.dataTransfer.dropEffect = "none";
        return;
      }
      e.dataTransfer.dropEffect = "move";
      if (dragOverOutcome !== outcome) {
        setDragOverOutcome(outcome);
      }
    },
    [canUpdate, dragOverOutcome]
  );

  const handleDragLeaveOutcome = useCallback(() => {
    setDragOverOutcome(null);
  }, []);

  const handleDropOutcome = useCallback(
    (e: React.DragEvent, outcomeStageKey: string) => {
      e.preventDefault();
      setDragOverOutcome(null);
      setDraggedOpportunity(null);
      if (canUpdate === false) return;
      const oppId = e.dataTransfer.getData("text/plain");
      if (oppId) {
        handleDropOpportunity(oppId, outcomeStageKey);
      }
    },
    [canUpdate, handleDropOpportunity]
  );

  return {
    effectiveStages,
    groupedOpportunities,
    wonDealsCount,
    lostDealsCount,
    draggedOpportunity,
    dragOverOutcome,
    canUpdate,
    canManage,
    handleCardDragStart,
    handleCardDragEnd,
    handleDropOpportunity,
    handleMoveForward,
    handleMoveBackward,
    handleDragOverOutcome,
    handleDragLeaveOutcome,
    handleDropOutcome,
  };
}
