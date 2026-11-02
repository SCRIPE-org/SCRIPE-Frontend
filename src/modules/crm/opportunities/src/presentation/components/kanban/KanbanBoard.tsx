"use client";

import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { KanbanColumn, type KanbanStageDef } from "./KanbanColumn";
import type {
  CrmOpportunity,
  PipelineStageConfig,
} from "../../../domain/entities/OpportunityEntity";

export const CANONICAL_KANBAN_STAGES: KanbanStageDef[] = [
  {
    key: "default.discovery",
    labelKey: "crmOpportunities.stages.discovery",
    defaultLabelEn: "Discovery",
    sortOrder: 1,
  },
  {
    key: "default.qualification",
    labelKey: "crmOpportunities.stages.qualification",
    defaultLabelEn: "Qualification",
    sortOrder: 2,
  },
  {
    key: "default.solution_fit",
    labelKey: "crmOpportunities.stages.solution_fit",
    defaultLabelEn: "Solution Fit",
    sortOrder: 3,
  },
  {
    key: "default.proposal",
    labelKey: "crmOpportunities.stages.proposal",
    defaultLabelEn: "Proposal",
    sortOrder: 4,
    requiresParty: true,
  },
  {
    key: "default.negotiation",
    labelKey: "crmOpportunities.stages.negotiation",
    defaultLabelEn: "Negotiation",
    sortOrder: 5,
    requiresParty: true,
  },
];

export interface KanbanBoardProps {
  opportunities: CrmOpportunity[];
  stages?: PipelineStageConfig[];
  onMoveStage: (opportunity: CrmOpportunity, targetStageKey: string) => Promise<boolean> | void;
  errorMessage?: string | null;
  onClearError?: () => void;
}

/**
 * 5-Stage interactive CRM Kanban Board adhering to PD-1 non-bypassable party gates,
 * WCAG accessible keyboard controls, and optimistic rollback mechanics.
 * Dynamically supports server-provided default pipeline configuration and ordering.
 */
export function KanbanBoard({
  opportunities,
  stages,
  onMoveStage,
  errorMessage,
  onClearError,
}: KanbanBoardProps) {
  const { t } = useI18n();

  // Compute effective stages: server-provided default pipeline if present, else canonical fallbacks
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
    return CANONICAL_KANBAN_STAGES;
  }, [stages]);

  // Group open opportunities by effective stage key
  const groupedOpportunities = useMemo(() => {
    const map = new Map<string, CrmOpportunity[]>();
    for (const stage of effectiveStages) {
      map.set(stage.key, []);
    }

    for (const opp of opportunities) {
      // If opportunity is Open, place in its stage column if mapped
      if (opp.status === "Open" && map.has(opp.stageKey)) {
        map.get(opp.stageKey)!.push(opp);
      }
    }

    return map;
  }, [opportunities, effectiveStages]);

  const handleDropOpportunity = (opportunityId: string, targetStageKey: string) => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (!opp || opp.stageKey === targetStageKey) return;
    onMoveStage(opp, targetStageKey);
  };

  const handleMoveForward = (opp: CrmOpportunity) => {
    const currentIndex = effectiveStages.findIndex((s) => s.key === opp.stageKey);
    if (currentIndex >= 0 && currentIndex < effectiveStages.length - 1) {
      const nextStage = effectiveStages[currentIndex + 1];
      onMoveStage(opp, nextStage.key);
    }
  };

  const handleMoveBackward = (opp: CrmOpportunity) => {
    const currentIndex = effectiveStages.findIndex((s) => s.key === opp.stageKey);
    if (currentIndex > 0) {
      const prevStage = effectiveStages[currentIndex - 1];
      onMoveStage(opp, prevStage.key);
    }
  };

  return (
    <section
      role="region"
      aria-label="Opportunity Kanban Board"
      className="space-y-3"
    >
      {/* Dynamic Error / Rollback Notice */}
      {errorMessage && (
        <Alert variant="destructive" className="animate-in fade-in duration-200">
          <AlertCircle className="size-4 shrink-0" />
          <AlertTitle className="text-xs font-bold">
            {t("crmOpportunities.kanban.stageMoveFailed", {
              defaultValue: "Stage Transition Rejected",
            })}
          </AlertTitle>
          <AlertDescription className="text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            {onClearError && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearError}
                className="h-6 px-2 text-[11px] font-mono underline hover:no-underline ml-4"
              >
                Dismiss
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Horizontal Scrollable 5-Column Grid */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 min-h-[550px] scrollbar-thin">
        {effectiveStages.map((stage, index) => {
          const colOpps = groupedOpportunities.get(stage.key) || [];
          return (
            <KanbanColumn
              key={stage.key}
              stage={stage}
              opportunities={colOpps}
              stageIndex={index}
              totalStages={effectiveStages.length}
              onDropOpportunity={handleDropOpportunity}
              onMoveForward={handleMoveForward}
              onMoveBackward={handleMoveBackward}
            />
          );
        })}
      </div>
    </section>
  );
}
