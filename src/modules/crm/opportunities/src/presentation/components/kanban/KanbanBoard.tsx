"use client";

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { KanbanColumn } from "./KanbanColumn";
import {
  useKanbanBoardViewModel,
} from "../../viewmodels/useKanbanBoardViewModel";
import type {
  CrmOpportunity,
  PipelineStageConfig,
} from "../../../domain/entities/OpportunityEntity";

import type { BoardSettingsConfig } from "../BoardSettingsDialog";

export {
  type KanbanStageDef,
  CANONICAL_KANBAN_STAGES,
} from "../../viewmodels/useKanbanBoardViewModel";

export interface KanbanBoardProps {
  opportunities: CrmOpportunity[];
  stages?: PipelineStageConfig[];
  boardSettings?: BoardSettingsConfig;
  onMoveStage: (opportunity: CrmOpportunity, targetStageKey: string) => Promise<boolean> | void;
  canUpdateOpportunity?: boolean;
  canManagePipelines?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
  hideOutcomeDropzones?: boolean;
  isLoading?: boolean;
}

/**
 * Presentation View for the CRM Opportunity Kanban Board.
 * Adheres strictly to MVVM architecture: delegates all state, adjacency logic,
 * drag-and-drop state, and permissions to `useKanbanBoardViewModel`.
 */
export function KanbanBoard({
  opportunities,
  stages,
  boardSettings,
  onMoveStage,
  canUpdateOpportunity,
  canManagePipelines,
  errorMessage,
  onClearError,
  hideOutcomeDropzones = false,
  isLoading = false,
}: KanbanBoardProps) {
  const { t } = useI18n();

  const {
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
  } = useKanbanBoardViewModel({
    opportunities,
    stages,
    onMoveStage,
    canUpdateOpportunity,
    canManagePipelines,
    includeOutcomeStagesAsColumns: hideOutcomeDropzones,
  });

  const swimlaneMode = boardSettings?.swimlaneMode ?? "none";

  if (isLoading && opportunities.length === 0) {
    return (
      <section
        role="region"
        aria-label={t("crmOpportunities.kanban.boardRegionLabel", {
          defaultValue: "Opportunity Kanban Board",
        })}
        data-testid="kanban-board-skeleton"
        className="w-full overflow-x-auto no-scrollbar pb-2"
      >
        <div
          className="grid gap-1.5 pb-2 pt-1 min-h-[520px] w-full"
          style={{ gridTemplateColumns: "repeat(7, minmax(136px, 1fr))" }}
        >
          {Array.from({ length: 7 }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="rounded-xl border border-nx-line bg-nx-surface p-2.5 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-nx-line pb-2">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-4 w-6 rounded-full" />
              </div>
              {Array.from({ length: 3 }).map((__, cardIdx) => (
                <Card key={cardIdx} className="p-2.5 border-nx-line bg-nx-raised/40 space-y-2">
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-3.5 w-14 rounded" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      role="region"
      aria-label={t("crmOpportunities.kanban.boardRegionLabel", {
        defaultValue: "Opportunity Kanban Board",
      })}
      className="space-y-3"
    >
      {/* Dynamic Error / Rollback Notice */}
      {errorMessage && (
        <Alert
          variant="destructive"
          data-testid="kanban-error-banner"
          className="border-destructive/40 bg-destructive/10 text-destructive text-xs py-2 px-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <div>
              <AlertTitle className="text-xs font-semibold">
                {t("crmOpportunities.kanban.moveRejectedTitle", { defaultValue: "Stage Transition Rejected" })}
              </AlertTitle>
              <AlertDescription className="text-[11px] leading-tight">
                {errorMessage}
              </AlertDescription>
            </div>
          </div>
          {onClearError && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearError}
              className="h-6 px-2 text-xs text-destructive hover:bg-destructive/20"
            >
              {t("common.dismiss", { defaultValue: "Dismiss" })}
            </Button>
          )}
        </Alert>
      )}

      {swimlaneMode !== "none" && (
        <div
          data-testid="kanban-swimlane-banner"
          className="rounded-nx-md border border-nx-line bg-nx-raised/40 px-3 py-1.5 flex items-center justify-between text-xs text-nx-ink-2"
        >
          <span className="font-semibold">
            Swimlanes Active: <span className="text-nx-accent uppercase font-mono">{swimlaneMode}</span>
          </span>
          <span className="text-[11px] text-nx-ink-3">{opportunities.length} deals grouped</span>
        </div>
      )}

      {/* Horizontal Scrollable Kanban Columns Container */}
      <div className="w-full overflow-x-auto no-scrollbar pb-2">
        <div
          data-testid="kanban-columns-container"
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 pb-2 pt-1 min-h-[520px] w-full",
            effectiveStages.length >= 6 ? "gap-1.5" : "gap-2.5"
          )}
          style={{
            gridTemplateColumns:
              effectiveStages.length >= 6
                ? `repeat(${effectiveStages.length}, minmax(136px, 1fr))`
                : effectiveStages.length >= 2
                  ? `repeat(${effectiveStages.length}, minmax(185px, 1fr))`
                  : undefined,
          }}
        >
          {effectiveStages.map((stage, index) => {
            const colOpps = groupedOpportunities.get(stage.key) || [];
            return (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                opportunities={colOpps}
                stageIndex={index}
                totalStages={effectiveStages.length}
                allStages={effectiveStages}
                wipLimit={boardSettings?.wipLimits?.[stage.key]}
                draggedOpportunity={draggedOpportunity}
                onCardDragStart={handleCardDragStart}
                onCardDragEnd={handleCardDragEnd}
                canUpdateOpportunity={canUpdate}
                canManagePipelines={canManage}
                onDropOpportunity={handleDropOpportunity}
                onMoveForward={handleMoveForward}
                onMoveBackward={handleMoveBackward}
              />
            );
          })}
        </div>
      </div>

      {/* Legacy Outcome Drop Zones (only rendered when hideOutcomeDropzones is false) */}
      {!hideOutcomeDropzones && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div
            data-testid="kanban-dropzone-closed-won"
            onDragOver={(e) => handleDragOverOutcome(e, "won")}
            onDragLeave={handleDragLeaveOutcome}
            onDrop={(e) => handleDropOutcome(e, "default.closed_won")}
            className={cn(
              "flex items-center justify-between rounded-nx-lg border border-dashed px-4 py-3 transition-colors",
              canUpdate === false && "cursor-not-allowed opacity-60",
              dragOverOutcome === "won" && canUpdate !== false
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
                  {t("crmOpportunities.kanban.dropWonHint", {
                    defaultValue: "Drag an open deal here to verify Account/Contact & record Close Won notes",
                  })}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-success bg-success/10 border border-success/30 rounded px-2 py-0.5">
              {wonDealsCount}
            </span>
          </div>

          <div
            data-testid="kanban-dropzone-closed-lost"
            onDragOver={(e) => handleDragOverOutcome(e, "lost")}
            onDragLeave={handleDragLeaveOutcome}
            onDrop={(e) => handleDropOutcome(e, "default.closed_lost")}
            className={cn(
              "flex items-center justify-between rounded-nx-lg border border-dashed px-4 py-3 transition-colors",
              canUpdate === false && "cursor-not-allowed opacity-60",
              dragOverOutcome === "lost" && canUpdate !== false
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
                  {t("crmOpportunities.kanban.dropLostHint", {
                    defaultValue: "Drag an open deal here to capture loss competitor and root-cause reasons",
                  })}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-0.5">
              {lostDealsCount}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
