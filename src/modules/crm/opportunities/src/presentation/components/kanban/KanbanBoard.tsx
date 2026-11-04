"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
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
  const [dragOverOutcome, setDragOverOutcome] = useState<"won" | "lost" | null>(null);

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

  const wonDealsCount = useMemo(
    () => opportunities.filter((o) => o.status === "Won").length,
    [opportunities]
  );
  const lostDealsCount = useMemo(
    () => opportunities.filter((o) => o.status === "Lost").length,
    [opportunities]
  );

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

      {/* Responsive 5-Column Jira-Grade Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pb-2 pt-1 min-h-[520px] w-full">
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

      {/* Terminal Outcome Drop Zones (Closed Won & Closed Lost) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div
          data-testid="kanban-dropzone-closed-won"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (dragOverOutcome !== "won") setDragOverOutcome("won");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOverOutcome(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverOutcome(null);
            const oppId = e.dataTransfer.getData("text/plain");
            if (oppId) {
              handleDropOpportunity(oppId, "default.closed_won");
            }
          }}
          className={cn(
            "flex items-center justify-between rounded-nx-lg border border-dashed px-4 py-3 transition-colors",
            dragOverOutcome === "won"
              ? "border-success bg-success/15 ring-2 ring-success text-success"
              : "border-success/30 bg-success/5 text-nx-ink-2 hover:border-success/60"
          )}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 text-success shrink-0" />
            <div>
              <div className="text-xs font-bold text-success uppercase tracking-wider">
                {t("crmOpportunities.dialogs.close.outcomeWon", { defaultValue: "Closed Won" })}
              </div>
              <div className="text-[11px] text-nx-ink-3">
                Drag an open deal here to verify Party & record Close Won notes
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-success bg-success/10 border border-success/30 rounded px-2 py-0.5">
            {wonDealsCount}
          </span>
        </div>

        <div
          data-testid="kanban-dropzone-closed-lost"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (dragOverOutcome !== "lost") setDragOverOutcome("lost");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOverOutcome(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverOutcome(null);
            const oppId = e.dataTransfer.getData("text/plain");
            if (oppId) {
              handleDropOpportunity(oppId, "default.closed_lost");
            }
          }}
          className={cn(
            "flex items-center justify-between rounded-nx-lg border border-dashed px-4 py-3 transition-colors",
            dragOverOutcome === "lost"
              ? "border-destructive bg-destructive/15 ring-2 ring-destructive text-destructive"
              : "border-destructive/30 bg-destructive/5 text-nx-ink-2 hover:border-destructive/60"
          )}
        >
          <div className="flex items-center gap-2.5">
            <XCircle className="size-4 text-destructive shrink-0" />
            <div>
              <div className="text-xs font-bold text-destructive uppercase tracking-wider">
                {t("crmOpportunities.dialogs.close.outcomeLost", { defaultValue: "Closed Lost" })}
              </div>
              <div className="text-[11px] text-nx-ink-3">
                Drag an open deal here to capture loss reason & competitor intel
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-0.5">
            {lostDealsCount}
          </span>
        </div>
      </div>
    </section>
  );
}
