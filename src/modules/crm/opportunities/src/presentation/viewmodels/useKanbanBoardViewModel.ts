"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  CANONICAL_KANBAN_STAGES,
  type KanbanStageDef,
} from "../../domain/constants/crmCanonicalStages";
import type {
  CrmOpportunity,
  PipelineStageConfig,
} from "../../domain/entities/OpportunityEntity";
import { buildEffectiveKanbanStages } from "../utils/kanbanStageResolutionHelpers";

export { CANONICAL_KANBAN_STAGES, type KanbanStageDef };

export interface UseKanbanBoardViewModelProps {
  opportunities: CrmOpportunity[];
  stages?: PipelineStageConfig[];
  onMoveStage: (opportunity: CrmOpportunity, targetStageKey: string) => Promise<boolean> | void;
  canUpdateOpportunity?: boolean;
  canManagePipelines?: boolean;
  includeOutcomeStagesAsColumns?: boolean;
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
  includeOutcomeStagesAsColumns = true,
}: UseKanbanBoardViewModelProps) {
  const canUpdate = propCanUpdate !== undefined ? propCanUpdate : true;
  const canManage = propCanManage !== undefined ? propCanManage : true;

  const [dragOverOutcome, setDragOverOutcome] = useState<"won" | "lost" | null>(null);
  const [draggedOpportunity, setDraggedOpportunity] = useState<CrmOpportunity | null>(null);

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

  const effectiveStages: KanbanStageDef[] = useMemo(
    () => buildEffectiveKanbanStages(stages, includeOutcomeStagesAsColumns),
    [stages, includeOutcomeStagesAsColumns]
  );

  const groupedOpportunities = useMemo(() => {
    const map = new Map<string, CrmOpportunity[]>();
    for (const stage of effectiveStages) {
      map.set(stage.key, []);
    }
    const fallbackKey = effectiveStages[0]?.key;
    const wonStageKey = effectiveStages.find(
      (s) => s.category === "done" || s.key.includes("won") || s.winProbabilityPercent === 100,
    )?.key;
    const lostStageKey = effectiveStages.find(
      (s) => s.category === "lost" || s.key.includes("lost") || s.winProbabilityPercent === 0,
    )?.key;

    for (const opp of opportunities) {
      if (opp.status === "Open") {
        if (map.has(opp.stageKey)) {
          map.get(opp.stageKey)!.push(opp);
        } else if (fallbackKey && map.has(fallbackKey)) {
          map.get(fallbackKey)!.push(opp);
        }
      } else if (includeOutcomeStagesAsColumns && opp.status === "Won" && wonStageKey && map.has(wonStageKey)) {
        map.get(wonStageKey)!.push(opp);
      } else if (includeOutcomeStagesAsColumns && opp.status === "Lost" && lostStageKey && map.has(lostStageKey)) {
        map.get(lostStageKey)!.push(opp);
      }
    }

    return map;
  }, [opportunities, effectiveStages, includeOutcomeStagesAsColumns]);

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
