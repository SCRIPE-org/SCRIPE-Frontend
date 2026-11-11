"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragCancelEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { cn } from "@core/common/utils";
import { AlertCircle, X, SlidersHorizontal } from "lucide-react";
import { KanbanStageColumn } from "./KanbanStageColumn";
import { KanbanSwimlaneSection } from "./KanbanSwimlaneSection";
import type {
  WorkflowKanbanConfig,
  CardDensity,
  WorkflowKanbanSwimlane,
} from "./types";
import type { CrudColumn } from "../components/generic-crud-view";

export interface GenericWorkflowKanbanProps<TItem = any> {
  config: WorkflowKanbanConfig<TItem>;
  items: TItem[];
  renderRowActionButtons?: (item: TItem) => React.ReactNode;
  columns?: CrudColumn<TItem>[];
  className?: string;
  emptyLabel?: string;
}

export function GenericWorkflowKanban<TItem = any>({
  config,
  items,
  renderRowActionButtons,
  columns,
  className,
  emptyLabel = "No items",
}: GenericWorkflowKanbanProps<TItem>) {
  const {
    stages,
    stageField = "stageKey",
    cardDensity: initialDensity = "standard",
    swimlaneMode = "none",
    swimlaneField,
    swimlanes: configuredSwimlanes,
    evaluateDropTarget,
    onMoveItem,
    renderCard,
    renderStageHeaderExtra,
    virtualizationThreshold = 25,
    errorMessage,
    onDismissError,
    isReadOnly = false,
    getItemDisplayName,
  } = config;

  const [activeItem, setActiveItem] = useState<TItem | null>(null);
  const [activeStageKey, setActiveStageKey] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentDensity, setCurrentDensity] = useState<CardDensity>(initialDensity);

  // Configure drag sensors with distance threshold to prevent click interference
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to extract stage key from item
  const getStageKey = useCallback(
    (item: TItem): string => {
      if (typeof stageField === "function") {
        return stageField(item);
      }
      return String((item as any)?.[stageField] ?? "");
    },
    [stageField]
  );

  // Group items by stage (when not in swimlane mode)
  const stageItemsMap = useMemo(() => {
    const map = new Map<string, TItem[]>();
    for (const stage of stages) {
      map.set(stage.stageKey, []);
    }
    for (const item of items) {
      const key = getStageKey(item);
      const list = map.get(key);
      if (list) {
        list.push(item);
      } else {
        // Fallback for custom or unmapped stages
        const firstKey = stages[0]?.stageKey || "unassigned";
        const fallbackList = map.get(firstKey);
        if (fallbackList) {
          fallbackList.push(item);
        } else {
          map.set(firstKey, [item]);
        }
      }
    }
    return map;
  }, [stages, items, getStageKey]);

  // Compute swimlanes if swimlane mode is active
  const computedSwimlanes = useMemo<WorkflowKanbanSwimlane<TItem>[]>(() => {
    if (swimlaneMode === "none") return [];
    if (configuredSwimlanes && configuredSwimlanes.length > 0) {
      return configuredSwimlanes;
    }

    if (!swimlaneField) return [];

    const getSwimlaneVal = (item: TItem): string => {
      if (typeof swimlaneField === "function") {
        return swimlaneField(item);
      }
      return String((item as any)?.[swimlaneField] ?? "Unassigned");
    };

    const swimlaneSet = new Set<string>();
    for (const item of items) {
      swimlaneSet.add(getSwimlaneVal(item));
    }

    return Array.from(swimlaneSet).map((val) => ({
      id: val,
      label: val,
      filter: (item: TItem) => getSwimlaneVal(item) === val,
    }));
  }, [swimlaneMode, configuredSwimlanes, swimlaneField, items]);

  // Drag handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (isReadOnly) return;
      const data = event.active.data.current;
      if (data && data.item) {
        setActiveItem(data.item as TItem);
        setActiveStageKey(data.stageKey || getStageKey(data.item as TItem));
        setLocalError(null);
      }
    },
    [isReadOnly, getStageKey]
  );

  const handleDragCancel = useCallback((_event: DragCancelEvent) => {
    setActiveItem(null);
    setActiveStageKey(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || !active) {
        setActiveItem(null);
        setActiveStageKey(null);
        return;
      }

      const draggedItem = active.data.current?.item as TItem | undefined;
      const sourceStageKey =
        active.data.current?.stageKey || (draggedItem ? getStageKey(draggedItem) : null);

      // Target stage resolution
      let targetStageKey: string | null = null;
      if (over.data.current?.type === "column") {
        targetStageKey = over.data.current.stageKey;
      } else if (over.data.current?.type === "card") {
        targetStageKey = over.data.current.stageKey;
      } else {
        // Fallback: match stage whose stageKey equals over.id
        const matched = stages.find((s) => s.stageKey === String(over.id));
        if (matched) {
          targetStageKey = matched.stageKey;
        }
      }

      if (draggedItem && targetStageKey && targetStageKey !== sourceStageKey) {
        // Smart 3-State Drop Evaluation
        const evalResult = evaluateDropTarget
          ? evaluateDropTarget(draggedItem, targetStageKey)
          : { state: "allowed_instant" as const };

        if (evalResult.state === "blocked") {
          // Reject drop
          setLocalError(
            evalResult.reason || "Transition is not permitted by workflow rules."
          );
        } else {
          // allowed_instant OR allowed_screen_required
          // For screen_required, onMoveItem will be called with evalResult so the caller pops the Jira Transition dialog!
          setLocalError(null);
          if (onMoveItem) {
            onMoveItem(draggedItem, targetStageKey, evalResult);
          }
        }
      }

      setActiveItem(null);
      setActiveStageKey(null);
    },
    [stages, getStageKey, evaluateDropTarget, onMoveItem]
  );

  const activeError = errorMessage || localError;

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {/* Error / Validation Banner */}
      {activeError && (
        <Alert variant="destructive" className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <AlertDescription className="text-sm font-medium">{activeError}</AlertDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 p-0 hover:bg-destructive/20"
            onClick={() => {
              setLocalError(null);
              onDismissError?.();
            }}
            aria-label="Dismiss error"
          >
            <X className="size-4" />
          </Button>
        </Alert>
      )}

      {/* Kanban Sub-Toolbar (Density & Stage count) */}
      <div className="flex items-center justify-between text-xs text-nx-ink-3 px-1 select-none">
        <div className="flex items-center gap-2">
          <span>
            {stages.length} {stages.length === 1 ? "Stage" : "Stages"}
          </span>
          <span>•</span>
          <span>
            {items.length} {items.length === 1 ? "Card" : "Cards"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="size-3.5 text-nx-ink-3" />
          <span className="text-[11px] font-medium text-nx-ink-3">Density:</span>
          {(["compact", "standard", "comfortable"] as CardDensity[]).map((d) => (
            <Button
              key={d}
              type="button"
              variant={currentDensity === d ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-6 px-2 text-[11px] capitalize",
                currentDensity === d && "font-semibold text-nx-ink border border-nx-line"
              )}
              onClick={() => setCurrentDensity(d)}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>

      {/* Dnd Board Area */}
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {swimlaneMode !== "none" && computedSwimlanes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {computedSwimlanes.map((swimlane) => {
              const swimlaneItems = swimlane.filter
                ? items.filter(swimlane.filter)
                : items;
              return (
                <KanbanSwimlaneSection
                  key={swimlane.id}
                  swimlane={swimlane}
                  stages={stages}
                  items={swimlaneItems}
                  getStageKey={getStageKey}
                  activeItem={activeItem}
                  activeStageKey={activeStageKey}
                  evaluateDropTarget={evaluateDropTarget}
                  cardDensity={currentDensity}
                  virtualizationThreshold={virtualizationThreshold}
                  disabled={isReadOnly}
                  renderCard={renderCard}
                  renderActionButtons={renderRowActionButtons}
                  renderStageHeaderExtra={renderStageHeaderExtra}
                  columns={columns}
                  getItemDisplayName={getItemDisplayName}
                  emptyLabel={emptyLabel}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex items-start gap-3.5 overflow-x-auto pb-4 pt-1 min-h-[500px]">
            {stages.map((stage) => (
              <KanbanStageColumn
                key={stage.stageKey}
                stage={stage}
                items={stageItemsMap.get(stage.stageKey) || []}
                activeItem={activeItem}
                activeStageKey={activeStageKey}
                evaluateDropTarget={evaluateDropTarget}
                cardDensity={currentDensity}
                virtualizationThreshold={virtualizationThreshold}
                disabled={isReadOnly}
                renderCard={renderCard}
                renderActionButtons={renderRowActionButtons}
                renderStageHeaderExtra={renderStageHeaderExtra}
                columns={columns}
                getItemDisplayName={getItemDisplayName}
                emptyLabel={emptyLabel}
              />
            ))}
          </div>
        )}

        {/* Drag Overlay — Tactical Ghost Preview ONLY while dragging */}
        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <div className="w-80 select-none">
              {renderCard ? (
                <div className="rounded-nx-md border border-nx-accent bg-nx-surface p-3 shadow-xl ring-1 ring-nx-accent/40 rotate-[1.5deg] scale-[1.02] cursor-grabbing opacity-95">
                  {renderCard(activeItem, null, 0)}
                </div>
              ) : (
                <Card className="flex flex-col justify-between rounded-nx-md border border-nx-accent bg-nx-surface p-3 shadow-xl ring-1 ring-nx-accent/40 rotate-[1.5deg] scale-[1.02] cursor-grabbing opacity-95">
                  <div className="space-y-1.5">
                    <span className="font-semibold text-nx-ink text-sm truncate">
                      {getItemDisplayName?.(activeItem) ||
                        (activeItem as any)?.title ||
                        (activeItem as any)?.name ||
                        (activeItem as any)?.id}
                    </span>
                    {columns && columns.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {columns.slice(0, 2).map((col) => (
                          <div
                            key={col.key}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="text-nx-ink-3 truncate">{col.label}</span>
                            <span className="font-medium text-nx-ink truncate">
                              {col.render
                                ? col.render((activeItem as any)[col.key], activeItem, 0)
                                : String((activeItem as any)[col.key] ?? "—")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
