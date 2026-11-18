"use client";

import React, { memo, useMemo, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@core/common/utils";
import { useCrudI18n } from "../hooks/useCrudI18n";
import { KanbanSortableCard } from "./KanbanSortableCard";
import { KanbanStageColumnHeader } from "./KanbanStageColumnHeader";
import {
  resolveDropEvaluationBadgeLabel,
  resolveKanbanDropStateClasses,
} from "./kanbanStageStyleUtils";
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
    data: droppableData || { type: "column", stageKey: stage.stageKey },
    disabled,
  });

  const isActiveSourceStage = activeStageKey === stage.stageKey;
  const isColumnHovered = (isOver || Boolean(isOverStage)) && !isActiveSourceStage;
  const itemIds = useMemo(() => items.map((i: any) => String(i?.id)), [items]);

  const evalResult = useMemo<DropEvaluationResult | null>(() => {
    if (!activeItem) return null;
    if (activeStageKey === stage.stageKey) {
      return {
        state: "allowed_instant",
        badgeText: t("crud.kanban.currentStage", { defaultValue: "Current Stage" }),
      };
    }
    if (evaluateDropTarget) return evaluateDropTarget(activeItem, stage.stageKey);
    return {
      state: "allowed_instant",
      badgeText: t("crud.kanban.moveHere", { defaultValue: "Move Here" }),
    };
  }, [activeItem, activeStageKey, stage.stageKey, evaluateDropTarget, t]);

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

  const dropStateClasses = resolveKanbanDropStateClasses(
    Boolean(activeItem),
    isActiveSourceStage,
    evalResult,
    isColumnHovered
  );

  return (
    <div
      ref={setNodeRef}
      data-testid={`kanban-column-${stage.stageKey}`}
      data-stage-key={stage.stageKey}
      data-over-stage={isColumnHovered ? "true" : "false"}
      data-drop-status={evalResult?.state ?? "idle"}
      className={cn(
        "flex flex-col rounded-nx-lg border transition-colors duration-nx-micro motion-reduce:transition-none shrink-0",
        isCollapsed ? "w-14 min-h-[300px]" : "w-72 sm:w-80 min-h-[420px]",
        dropStateClasses,
        stage.columnClass
      )}
    >
      <KanbanStageColumnHeader
        stage={stage}
        items={items}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        hasActiveItem={Boolean(activeItem)}
        evalResult={evalResult}
        renderStageHeaderExtra={renderStageHeaderExtra}
      />

      {!isCollapsed && (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[320px] max-h-[calc(100dvh-280px)]"
        >
          {isColumnHovered && activeItem && evalResult && (
            <div
              data-testid={`kanban-drop-slot-${stage.stageKey}`}
              className={cn(
                "w-full rounded-nx-md border-2 border-dashed p-3 text-center text-xs font-semibold transition-colors select-none mb-1",
                evalResult.state === "blocked"
                  ? "border-nx-danger/60 bg-nx-danger/10 text-nx-danger"
                  : evalResult.state === "allowed_screen_required"
                  ? "border-warning-strong/60 bg-warning/10 text-nx-warning-strong"
                  : "border-nx-accent bg-nx-accent-wash text-nx-accent"
              )}
            >
              <span>{resolveDropEvaluationBadgeLabel(evalResult, t)}</span>
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
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
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
