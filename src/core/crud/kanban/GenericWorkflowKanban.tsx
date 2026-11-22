"use client";

import React from "react";
import { DndContext } from "@dnd-kit/core";
import { EmptyState } from "@core/ui/empty-state";
import { useCrudI18n } from "../hooks/useCrudI18n";
import { cn } from "@core/common/utils";
import { Inbox } from "lucide-react";
import { KanbanStageColumn } from "./KanbanStageColumn";
import { KanbanSwimlaneSection } from "./KanbanSwimlaneSection";
import { GenericWorkflowKanbanToolbar } from "./GenericWorkflowKanbanToolbar";
import { GenericWorkflowKanbanDragOverlay } from "./GenericWorkflowKanbanDragOverlay";
import { useGenericWorkflowKanbanState } from "./useGenericWorkflowKanbanState";
import type { WorkflowKanbanConfig } from "./types";
import type { CrudColumn } from "../components/generic-crud-view";

export interface GenericWorkflowKanbanProps<TItem = any> {
  config: WorkflowKanbanConfig<TItem>;
  items: TItem[];
  renderRowActionButtons?: (item: TItem) => React.ReactNode;
  columns?: CrudColumn<TItem>[];
  className?: string;
  emptyState?: React.ReactNode;
  emptyLabel?: string;
}

/** Unified workflow-aware drag-and-drop Kanban board with swimlane and density support. */
export function GenericWorkflowKanban<TItem = any>({
  config,
  items,
  renderRowActionButtons,
  columns,
  className,
  emptyState,
  emptyLabel,
}: GenericWorkflowKanbanProps<TItem>) {
  const { t, direction } = useCrudI18n();
  const resolvedEmptyLabel = emptyLabel || t("crud.kanban.noItems", { defaultValue: "No items" });
  const {
    stages,
    swimlaneMode = "none",
    evaluateDropTarget,
    renderCard,
    renderStageHeaderExtra,
    virtualizationThreshold = 25,
    errorMessage,
    onDismissError,
    isReadOnly = false,
    getItemDisplayName,
  } = config;

  const state = useGenericWorkflowKanbanState(config, items);
  const activeError = errorMessage || state.localError;

  return (
    <div dir={direction} className={cn("flex flex-col gap-3 w-full", className)}>
      <GenericWorkflowKanbanToolbar
        stageCount={stages.length}
        itemCount={items.length}
        currentDensity={state.currentDensity}
        onDensityChange={state.setCurrentDensity}
        activeError={activeError ?? null}
        onDismissError={() => {
          state.setLocalError(null);
          onDismissError?.();
        }}
      />

      {items.length === 0 && emptyState && (
        <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-6">
          {emptyState}
        </div>
      )}

      <DndContext
        sensors={state.sensors}
        collisionDetection={state.kanbanCollisionDetection}
        onDragStart={state.handleDragStart}
        onDragOver={state.handleDragOver}
        onDragEnd={state.handleDragEnd}
        onDragCancel={state.handleDragCancel}
      >
        {stages.length === 0 ? (
          <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-8">
            {emptyState || <EmptyState bare icon={Inbox} title={resolvedEmptyLabel} />}
          </div>
        ) : swimlaneMode !== "none" && state.computedSwimlanes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {state.computedSwimlanes.map((swimlane) => {
              const swimlaneItems = swimlane.filter ? items.filter(swimlane.filter) : items;
              return (
                <KanbanSwimlaneSection
                  key={swimlane.id}
                  swimlane={swimlane}
                  stages={stages}
                  items={swimlaneItems}
                  getStageKey={state.getStageKey}
                  activeItem={state.activeItem}
                  activeStageKey={state.activeStageKey}
                  overStageKey={state.overStageKey}
                  overSwimlaneKey={state.overSwimlaneKey}
                  evaluateDropTarget={evaluateDropTarget}
                  cardDensity={state.currentDensity}
                  virtualizationThreshold={virtualizationThreshold}
                  disabled={isReadOnly}
                  renderCard={renderCard}
                  renderActionButtons={renderRowActionButtons}
                  renderStageHeaderExtra={renderStageHeaderExtra}
                  columns={columns}
                  getItemDisplayName={getItemDisplayName}
                  emptyLabel={resolvedEmptyLabel}
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
                items={state.stageItemsMap.get(stage.stageKey) || []}
                activeItem={state.activeItem}
                activeStageKey={state.activeStageKey}
                isOverStage={state.overStageKey === stage.stageKey}
                evaluateDropTarget={evaluateDropTarget}
                cardDensity={state.currentDensity}
                virtualizationThreshold={virtualizationThreshold}
                disabled={isReadOnly}
                renderCard={renderCard}
                renderActionButtons={renderRowActionButtons}
                renderStageHeaderExtra={renderStageHeaderExtra}
                columns={columns}
                getItemDisplayName={getItemDisplayName}
                emptyLabel={resolvedEmptyLabel}
              />
            ))}
          </div>
        )}

        <GenericWorkflowKanbanDragOverlay
          activeItem={state.activeItem}
          renderCard={renderCard}
          getItemDisplayName={getItemDisplayName}
          columns={columns}
        />
      </DndContext>
    </div>
  );
}
