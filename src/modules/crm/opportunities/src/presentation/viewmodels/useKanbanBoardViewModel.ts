"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  resolveDefaultStageColor,
  useCrmWorkflowsStore,
  type CrmWorkflowStageCategory,
} from "@modules/crm";
import {
  CANONICAL_KANBAN_STAGES,
  CANONICAL_TERMINAL_LABELS,
  type KanbanStageDef,
} from "../../domain/constants/crmCanonicalStages";
import type {
  CrmOpportunity,
  PipelineStageConfig,
} from "../../domain/entities/OpportunityEntity";

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

  const effectiveStages: KanbanStageDef[] = useMemo(() => {
    const activeWorkflow = useCrmWorkflowsStore.getState().getActiveWorkflow("deal");
    const wfStagesByKey = new Map((activeWorkflow?.stages ?? []).map((ws) => [ws.stageKey, ws]));
    const canonicalByKey = new Map(CANONICAL_KANBAN_STAGES.map((cs) => [cs.key, cs]));

    let baseStages: KanbanStageDef[] = [];

    if (stages && stages.length > 0) {
      const sorted = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
      const allUniform50OrNull =
        sorted.length >= 3 &&
        sorted.every((st) => (st.winProbabilityPercent ?? st.probabilityPercent ?? 50) === 50);
      baseStages = sorted.map((s) => {
        const wfStage = wfStagesByKey.get(s.stageKey);
        const canonical = canonicalByKey.get(s.stageKey);
        const category = (s.statusCategory ?? wfStage?.category ?? canonical?.category ?? "in_progress") as CrmWorkflowStageCategory;
        const color = resolveDefaultStageColor(
          s.stageKey,
          category,
          s.sortOrder,
          s.color ?? wfStage?.color,
        );
        const rawProb = s.winProbabilityPercent ?? s.probabilityPercent;
        const resolvedProb =
          rawProb == null || allUniform50OrNull
            ? (wfStage?.winProbabilityPercent ?? canonical?.winProbabilityPercent ?? rawProb ?? null)
            : rawProb;
        return {
          key: s.stageKey,
          labelKey: `crmOpportunities.stages.${s.stageKey.replace("default.", "")}`,
          defaultLabelEn: s.labelEn || wfStage?.labelEn || canonical?.defaultLabelEn || s.stageKey,
          labelAr: s.labelAr || wfStage?.labelAr || canonical?.labelAr,
          sortOrder: s.sortOrder,
          winProbabilityPercent: resolvedProb,
          requiresParty: s.requiresVerifiedParty,
          category,
          color,
          customColorHex: wfStage?.customColorHex || wfStage?.properties?.customColorHex,
        };
      });
    } else if (activeWorkflow?.stages && activeWorkflow.stages.length >= 2) {
      const raw = includeOutcomeStagesAsColumns
        ? activeWorkflow.stages
        : activeWorkflow.stages.filter((s) => s.category !== "done" && s.category !== "lost");
      const sorted = [...raw].sort((a, b) => a.sortOrder - b.sortOrder);
      baseStages = sorted.map((s) => {
        const category = (s.category ?? "in_progress") as CrmWorkflowStageCategory;
        const color = resolveDefaultStageColor(s.stageKey, category, s.sortOrder, s.color);
        return {
          key: s.stageKey,
          labelKey: `crmOpportunities.stages.${s.stageKey.replace("default.", "")}`,
          defaultLabelEn: s.labelEn,
          labelAr: s.labelAr,
          sortOrder: s.sortOrder,
          winProbabilityPercent: s.winProbabilityPercent ?? null,
          requiresParty: s.requiresVerifiedParty ?? (s.stageKey.includes("proposal") || s.stageKey.includes("negotiation")),
          category,
          color,
          customColorHex: s.customColorHex || s.properties?.customColorHex,
        };
      });
    } else {
      baseStages = [...CANONICAL_KANBAN_STAGES];
    }

    if (includeOutcomeStagesAsColumns) {
      const hasDone = baseStages.some(
        (s) => s.category === "done" || s.key.includes("won") || s.winProbabilityPercent === 100,
      );
      if (!hasDone) {
        const wfWon = wfStagesByKey.get("terminal-won") ?? wfStagesByKey.get("default.closed_won");
        baseStages.push({
          key: wfWon?.stageKey ?? "default.closed_won",
          labelKey: "crmOpportunities.dialogs.close.outcomeWon",
          defaultLabelEn: wfWon?.labelEn ?? CANONICAL_TERMINAL_LABELS.wonStageEn,
          labelAr: wfWon?.labelAr ?? CANONICAL_TERMINAL_LABELS.wonColumnAr,
          sortOrder: baseStages.length + 1,
          winProbabilityPercent: 100,
          requiresParty: Boolean(wfWon?.requiresVerifiedParty || wfWon?.requiredExitFields?.includes("partyId")),
          category: "done",
          color: resolveDefaultStageColor("default.closed_won", "done", baseStages.length + 1, wfWon?.color),
          customColorHex: wfWon?.customColorHex || wfWon?.properties?.customColorHex,
        });
      }
      const hasLost = baseStages.some(
        (s) => s.category === "lost" || s.key.includes("lost") || s.winProbabilityPercent === 0,
      );
      if (!hasLost) {
        const wfLost = wfStagesByKey.get("terminal-lost") ?? wfStagesByKey.get("default.closed_lost");
        baseStages.push({
          key: wfLost?.stageKey ?? "default.closed_lost",
          labelKey: "crmOpportunities.dialogs.close.outcomeLost",
          defaultLabelEn: wfLost?.labelEn ?? CANONICAL_TERMINAL_LABELS.lostStageEn,
          labelAr: wfLost?.labelAr ?? CANONICAL_TERMINAL_LABELS.lostColumnAr,
          sortOrder: baseStages.length + 1,
          winProbabilityPercent: 0,
          requiresParty: false,
          category: "lost",
          color: resolveDefaultStageColor("default.closed_lost", "lost", baseStages.length + 1, wfLost?.color),
          customColorHex: wfLost?.customColorHex || wfLost?.properties?.customColorHex,
        });
      }
    }

    return baseStages;
  }, [stages, includeOutcomeStagesAsColumns]);

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
