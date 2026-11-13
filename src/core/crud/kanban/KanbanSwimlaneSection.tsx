"use client";

import React, { memo, useState } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { useCrudI18n } from "../hooks/useCrudI18n";
import { KanbanStageColumn } from "./KanbanStageColumn";
import type {
  WorkflowKanbanStageConfig,
  WorkflowKanbanSwimlane,
  DropEvaluationResult,
  CardDensity,
} from "./types";
import type { CrudColumn } from "../components/generic-crud-view";

export interface KanbanSwimlaneSectionProps<TItem = any> {
  swimlane: WorkflowKanbanSwimlane<any>;
  stages: WorkflowKanbanStageConfig<any>[];
  items: TItem[];
  getStageKey: (item: any) => string;
  activeItem: any | null;
  activeStageKey: string | null;
  overStageKey?: string | null;
  overSwimlaneKey?: string | null;
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

export const KanbanSwimlaneSection = memo(function KanbanSwimlaneSection({
  swimlane,
  stages,
  items,
  getStageKey,
  activeItem,
  activeStageKey,
  overStageKey,
  overSwimlaneKey,
  evaluateDropTarget,
  cardDensity,
  virtualizationThreshold,
  disabled,
  renderCard,
  renderActionButtons,
  renderStageHeaderExtra,
  columns,
  getItemDisplayName,
  emptyLabel,
}: KanbanSwimlaneSectionProps) {
  const { t } = useCrudI18n();
  const [isExpanded, setIsExpanded] = useState(true);
  const swimlaneKey = swimlane.key || swimlane.id;

  // Group items by stage inside this swimlane
  const stageItemsMap = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const stage of stages) {
      map.set(stage.stageKey, []);
    }
    for (const item of items) {
      const key = getStageKey(item);
      const list = map.get(key);
      if (list) {
        list.push(item);
      } else {
        // Fallback for unmapped custom stage key
        const unmappedList = map.get("other") || [];
        unmappedList.push(item);
        map.set("other", unmappedList);
      }
    }
    return map;
  }, [stages, items, getStageKey]);

  return (
    <div className="flex flex-col gap-2 rounded-nx-lg border border-nx-line bg-nx-raised/20 p-2">
      {/* Swimlane Header */}
      <div className="flex items-center justify-between border-b border-nx-line pb-2 px-2 select-none">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 p-0 text-nx-ink-3 hover:text-nx-ink"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={
              isExpanded
                ? t("crud.kanban.collapseSwimlane", {
                    label: swimlane.label,
                    defaultValue: `Collapse ${swimlane.label}`,
                  })
                : t("crud.kanban.expandSwimlane", {
                    label: swimlane.label,
                    defaultValue: `Expand ${swimlane.label}`,
                  })
            }
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4 rtl:rotate-180" />
            )}
          </Button>
          <Layers className="size-4 text-nx-ink-3" />
          <span className="font-semibold text-nx-ink text-sm">{swimlane.label}</span>
          <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs tabular-nums">
            {items.length}
          </Badge>
        </div>
      </div>

      {/* Swimlane Stage Columns */}
      {isExpanded && (
        <div className="flex items-start gap-3 overflow-x-auto pb-2 pt-1">
          {stages.map((stage) => {
            const isOverStage =
              overStageKey === stage.stageKey &&
              (!overSwimlaneKey || overSwimlaneKey === swimlaneKey);

            return (
              <KanbanStageColumn
                key={stage.stageKey}
                stage={stage}
                droppableId={`swimlane::${swimlaneKey}::${stage.stageKey}`}
                droppableData={{
                  type: "stage",
                  stageKey: stage.stageKey,
                  swimlaneKey,
                }}
                isOverStage={isOverStage}
                items={stageItemsMap.get(stage.stageKey) || []}
                activeItem={activeItem}
                activeStageKey={activeStageKey}
                evaluateDropTarget={evaluateDropTarget}
                cardDensity={cardDensity}
                virtualizationThreshold={virtualizationThreshold}
                disabled={disabled}
                renderCard={renderCard}
                renderActionButtons={renderActionButtons}
                renderStageHeaderExtra={renderStageHeaderExtra}
                columns={columns}
                getItemDisplayName={getItemDisplayName}
                emptyLabel={emptyLabel}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}) as <TItem = any>(props: KanbanSwimlaneSectionProps<TItem>) => React.ReactElement | null;
