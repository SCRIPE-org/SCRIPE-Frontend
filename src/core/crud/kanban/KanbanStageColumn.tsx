"use client";

import React, { memo, useMemo, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { useCrudI18n } from "../hooks/useCrudI18n";
import { ChevronDown, ChevronRight, Lock, Sparkles, AlertCircle } from "lucide-react";
import { KanbanSortableCard } from "./KanbanSortableCard";
import type {
  WorkflowKanbanStageConfig,
  DropEvaluationResult,
  CardDensity,
} from "./types";
import type { CrudColumn } from "../components/generic-crud-view";

export interface KanbanStageColumnProps<TItem = any> {
  stage: WorkflowKanbanStageConfig<any>;
  items: TItem[];
  activeItem: any | null;
  activeStageKey: string | null;
  isOverStage?: boolean;
  droppableId?: string;
  droppableData?: Record<string, any>;
  evaluateDropTarget?: (item: any, targetStageKey: string) => DropEvaluationResult;
  cardDensity?: CardDensity;
  virtualizationThreshold?: number;
  disabled?: boolean;
  renderCard?: (item: any, actions: React.ReactNode, index: number) => React.ReactNode;
  renderActionButtons?: (item: any) => React.ReactNode;
  renderStageHeaderExtra?: (stage: WorkflowKanbanStageConfig<any>, items: any[]) => React.ReactNode;
  columns?: CrudColumn<any>[];
  getItemDisplayName?: (item: any) => string;
  emptyLabel?: string;
}

export const KanbanStageColumn = memo(function KanbanStageColumn({
  stage,
  items,
  activeItem,
  activeStageKey,
  isOverStage = false,
  droppableId,
  droppableData,
  evaluateDropTarget,
  cardDensity = "standard",
  virtualizationThreshold = 25,
  disabled = false,
  renderCard,
  renderActionButtons,
  renderStageHeaderExtra,
  columns,
  getItemDisplayName,
  emptyLabel,
}: KanbanStageColumnProps) {
  const { t } = useCrudI18n();
  const resolvedEmptyLabel = emptyLabel || t("crud.kanban.noItems", { defaultValue: "No items" });
  const [isCollapsed, setIsCollapsed] = useState(stage.isCollapsed ?? false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId || stage.stageKey,
    data: droppableData || {
      type: "column",
      stageKey: stage.stageKey,
    },
    disabled,
  });

  const isActiveSourceStage = activeStageKey === stage.stageKey;
  const isColumnHovered = (isOver || Boolean(isOverStage)) && !isActiveSourceStage;

  const itemIds = useMemo(() => items.map((i: any) => String(i?.id)), [items]);

  // Smart 3-state Jira Drop Evaluation
  const evalResult = useMemo<DropEvaluationResult | null>(() => {
    if (!activeItem) return null;
    if (activeStageKey === stage.stageKey) {
      return {
        state: "allowed_instant",
        badgeText: t("crud.kanban.currentStage", { defaultValue: "Current Stage" }),
      };
    }
    if (evaluateDropTarget) {
      return evaluateDropTarget(activeItem, stage.stageKey);
    }
    return {
      state: "allowed_instant",
      badgeText: t("crud.kanban.moveHere", { defaultValue: "Move Here" }),
    };
  }, [activeItem, activeStageKey, stage.stageKey, evaluateDropTarget, t]);

  // Virtualization for heavy lists (> threshold)
  const isVirtual = items.length > virtualizationThreshold;
  const estimatedCardSize =
    cardDensity === "compact" ? 76 : cardDensity === "comfortable" ? 128 : 96;

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimatedCardSize,
    overscan: 4,
    enabled: isVirtual && !isCollapsed,
  });

  // Category swatch / dot styling
  const categoryDotClass = useMemo(() => {
    if (stage.swatchClass) return stage.swatchClass;
    if (stage.colorClass) return stage.colorClass;
    switch (stage.category) {
      case "todo":
        return "bg-nx-ink-3";
      case "in_progress":
        return "bg-info";
      case "done":
        return "bg-success";
      case "lost":
        return "bg-nx-danger";
      default:
        return "bg-nx-accent";
    }
  }, [stage.swatchClass, stage.colorClass, stage.category]);

  // Dynamic drop styling based on 3-State evaluation
  const dropStateClasses = useMemo(() => {
    if (!activeItem || isActiveSourceStage) {
      return "border-nx-line bg-nx-surface";
    }
    if (evalResult?.state === "blocked") {
      return isColumnHovered
        ? "border-nx-danger/80 ring-2 ring-nx-danger/40 bg-nx-danger/10"
        : "border-nx-line/50 opacity-60 bg-nx-surface";
    }
    if (evalResult?.state === "allowed_screen_required") {
      return isColumnHovered
        ? "border-warning ring-2 ring-warning/30 bg-warning/10"
        : "border-warning/40 bg-warning/5";
    }
    // allowed_instant
    return isColumnHovered
      ? "border-nx-accent ring-2 ring-nx-accent/30 bg-nx-accent-wash/40"
      : "border-nx-line hover:border-nx-line-hi bg-nx-surface";
  }, [activeItem, isActiveSourceStage, evalResult, isColumnHovered]);

  // WIP Limit calculation
  const isOverWipLimit = stage.wipLimit !== undefined && items.length > stage.wipLimit;

  return (
    <div
      ref={setNodeRef}
      data-testid={`kanban-column-${stage.stageKey}`}
      data-stage-key={stage.stageKey}
      data-over-stage={isColumnHovered ? "true" : "false"}
      data-drop-status={evalResult?.state ?? "idle"}
      className={cn(
        "flex flex-col rounded-nx-lg border transition-colors duration-nx-micro motion-reduce:transition-none shrink-0",
        isCollapsed ? "w-14 min-h-[300px]" : "w-80 min-h-[420px]",
        dropStateClasses,
        stage.columnClass
      )}
    >
      {/* Column Header */}
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
              <span
                aria-hidden="true"
                className={cn("size-2.5 rounded-full shrink-0", categoryDotClass)}
              />
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
              onClick={() => setIsCollapsed((prev) => !prev)}
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

        {/* Drop Evaluation Badge Indicator during Drag */}
        {!isCollapsed && activeItem && evalResult && (
          <div className="pt-1">
            {evalResult.state === "blocked" ? (
              <Badge
                variant="destructive"
                className="w-full justify-start text-[11px] font-medium gap-1 px-1.5 py-0.5 truncate"
                title={
                  evalResult.reason ||
                  t("crud.kanban.transitionBlocked", { defaultValue: "Transition blocked" })
                }
              >
                <Lock className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {evalResult.reason ||
                    t("crud.kanban.transitionBlocked", { defaultValue: "Transition blocked" })}
                </span>
              </Badge>
            ) : evalResult.state === "allowed_screen_required" ? (
              <Badge
                variant="outline"
                className="w-full justify-start text-[11px] font-semibold gap-1 px-1.5 py-0.5 border-warning/50 text-warning bg-warning/10 truncate"
              >
                <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {evalResult.badgeText ||
                    evalResult.actionLabel ||
                    (evalResult.transitions && evalResult.transitions.length > 1
                      ? t("crud.kanban.pathsAvailable", {
                          count: evalResult.transitions.length,
                          defaultValue: `${evalResult.transitions.length} Paths Available`,
                        })
                      : t("crud.kanban.transitionScreen", {
                          defaultValue: "Transition Screen",
                        }))}
                </span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="w-full justify-start text-[11px] font-semibold gap-1 px-1.5 py-0.5 border-nx-accent/50 text-nx-accent bg-nx-accent-wash truncate"
              >
                <Sparkles className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {evalResult.badgeText ||
                    evalResult.actionLabel ||
                    (evalResult.transitions && evalResult.transitions.length > 1
                      ? t("crud.kanban.pathsAvailable", {
                          count: evalResult.transitions.length,
                          defaultValue: `${evalResult.transitions.length} Paths Available`,
                        })
                      : t("crud.kanban.instantMove", { defaultValue: "Instant Move" }))}
                </span>
              </Badge>
            )}
          </div>
        )}

        {/* Column Aggregate / Summary */}
        {!isCollapsed && stage.headerSummary && (
          <div className="text-xs text-nx-ink-3 pt-0.5">{stage.headerSummary(items)}</div>
        )}

        {/* Custom Header Extra */}
        {!isCollapsed && renderStageHeaderExtra && (
          <div className="pt-0.5">{renderStageHeaderExtra(stage, items)}</div>
        )}
      </div>

      {/* Column Cards Container */}
      {!isCollapsed && (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[320px] max-h-[calc(100dvh-280px)]"
        >
          {isColumnHovered && activeItem && (
            <div
              data-testid={`kanban-drop-slot-${stage.stageKey}`}
              className={cn(
                "w-full rounded-nx-md border-2 border-dashed p-3 text-center text-xs font-semibold transition-colors select-none mb-1",
                evalResult?.state === "blocked"
                  ? "border-nx-danger/60 bg-nx-danger/10 text-nx-danger"
                  : evalResult?.state === "allowed_screen_required"
                  ? "border-warning/60 bg-warning/10 text-warning"
                  : "border-nx-accent bg-nx-accent-wash text-nx-accent"
              )}
            >
              <span>
                {evalResult?.badgeText ||
                  evalResult?.reason ||
                  evalResult?.actionLabel ||
                  (evalResult?.state === "blocked"
                    ? t("crud.kanban.transitionBlocked", { defaultValue: "Transition blocked" })
                    : evalResult?.state === "allowed_screen_required"
                    ? t("crud.kanban.transitionScreen", { defaultValue: "Transition Screen" })
                    : t("crud.kanban.instantMove", { defaultValue: "Instant Move" }))}
              </span>
            </div>
          )}

          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {items.length === 0 ? (
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-6 text-center text-xs text-nx-ink-3",
                  "border border-dashed border-nx-line/60 rounded-nx-md min-h-[140px]"
                )}
              >
                <span>{resolvedEmptyLabel}</span>
              </div>
            ) : isVirtual ? (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = items[virtualRow.index];
                  if (!row) return null;
                  return (
                    <div
                      key={String((row as any)?.id)}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        insetInlineStart: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="pb-2"
                    >
                      <KanbanSortableCard
                        id={String((row as any)?.id)}
                        item={row}
                        stageKey={stage.stageKey}
                        index={virtualRow.index}
                        density={cardDensity}
                        disabled={disabled}
                        renderCard={renderCard}
                        renderActionButtons={renderActionButtons}
                        columns={columns}
                        displayName={getItemDisplayName?.(row)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              items.map((row: any, idx) => (
                <KanbanSortableCard
                  key={String(row?.id)}
                  id={String(row?.id)}
                  item={row}
                  stageKey={stage.stageKey}
                  index={idx}
                  density={cardDensity}
                  disabled={disabled}
                  renderCard={renderCard}
                  renderActionButtons={renderActionButtons}
                  columns={columns}
                  displayName={getItemDisplayName?.(row)}
                />
              ))
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
}) as <TItem = any>(props: KanbanStageColumnProps<TItem>) => React.ReactElement | null;
