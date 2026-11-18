"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { useCrudI18n } from "../hooks/useCrudI18n";
import { AlertCircle, ChevronDown, ChevronRight, Lock, Sparkles } from "lucide-react";
import {
  resolveDropEvaluationBadgeLabel,
  resolveKanbanStageDotClass,
} from "./kanbanStageStyleUtils";
import type { DropEvaluationResult, WorkflowKanbanStageConfig } from "./types";

interface KanbanStageColumnHeaderProps<TItem = any> {
  stage: WorkflowKanbanStageConfig<TItem>;
  items: TItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasActiveItem: boolean;
  evalResult: DropEvaluationResult | null;
  renderStageHeaderExtra?: (
    stage: WorkflowKanbanStageConfig<TItem>,
    items: TItem[]
  ) => React.ReactNode;
}

/** Header bar for a workflow Kanban column including WIP count, collapse toggle, and drag status badge. */
export function KanbanStageColumnHeader<TItem = any>({
  stage,
  items,
  isCollapsed,
  onToggleCollapse,
  hasActiveItem,
  evalResult,
  renderStageHeaderExtra,
}: KanbanStageColumnHeaderProps<TItem>) {
  const { t } = useCrudI18n();
  const categoryDotClass = resolveKanbanStageDotClass(
    stage.swatchClass,
    stage.colorClass,
    stage.category
  );
  const isOverWipLimit = stage.wipLimit !== undefined && items.length > stage.wipLimit;

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-b border-nx-line p-3 select-none",
        stage.headerClass
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {stage.customColorHex ? (
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: stage.customColorHex }}
            />
          ) : (
            <span aria-hidden="true" className={cn("size-2.5 rounded-full shrink-0", categoryDotClass)} />
          )}
          {stage.icon && (
            <span aria-hidden="true" className="text-nx-ink-3 shrink-0">
              {stage.icon}
            </span>
          )}
          {!isCollapsed && (
            <span className="text-sm font-semibold text-nx-ink truncate" title={stage.label}>
              {stage.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isCollapsed && (
            <Badge
              variant={isOverWipLimit ? "destructive" : "secondary"}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                stage.colorClass
              )}
              title={
                stage.wipLimit !== undefined
                  ? `${items.length} of max ${stage.wipLimit} cards`
                  : `${items.length} cards`
              }
            >
              {items.length}
              {stage.wipLimit !== undefined && ` / ${stage.wipLimit}`}
            </Badge>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={!isCollapsed}
            className="h-8 w-8 p-0 text-nx-ink-3 hover:text-nx-ink"
            onClick={onToggleCollapse}
            aria-label={
              isCollapsed
                ? t("crud.kanban.expandStage", {
                    label: stage.label,
                    defaultValue: `Expand ${stage.label}`,
                  })
                : t("crud.kanban.collapseStage", {
                    label: stage.label,
                    defaultValue: `Collapse ${stage.label}`,
                  })
            }
          >
            {isCollapsed ? (
              <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {!isCollapsed && hasActiveItem && evalResult && (
        <div className="pt-1">
          {evalResult.state === "blocked" ? (
            <Badge
              variant="destructive"
              className="w-full justify-start text-[11px] font-medium gap-1 px-1.5 py-0.5 truncate"
              title={resolveDropEvaluationBadgeLabel(evalResult, t)}
            >
              <Lock className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{resolveDropEvaluationBadgeLabel(evalResult, t)}</span>
            </Badge>
          ) : evalResult.state === "allowed_screen_required" ? (
            <Badge
              variant="outline"
              className="w-full justify-start text-[11px] font-semibold gap-1 px-1.5 py-0.5 border-warning-strong/50 text-nx-warning-strong bg-warning/10 truncate"
            >
              <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{resolveDropEvaluationBadgeLabel(evalResult, t)}</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="w-full justify-start text-[11px] font-semibold gap-1 px-1.5 py-0.5 border-nx-accent/50 text-nx-accent bg-nx-accent-wash truncate"
            >
              <Sparkles className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{resolveDropEvaluationBadgeLabel(evalResult, t)}</span>
            </Badge>
          )}
        </div>
      )}

      {!isCollapsed && stage.headerSummary && (
        <div className="text-xs text-nx-ink-3 pt-0.5">{stage.headerSummary(items)}</div>
      )}

      {!isCollapsed && renderStageHeaderExtra && (
        <div className="pt-0.5">{renderStageHeaderExtra(stage, items)}</div>
      )}
    </div>
  );
}
