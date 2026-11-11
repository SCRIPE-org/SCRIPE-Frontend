"use client";

import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@core/ui/card";
import { cn } from "@core/common/utils";
import type { CardDensity } from "./types";
import type { CrudColumn } from "../components/generic-crud-view";

export interface KanbanSortableCardProps<TItem = any> {
  id: string;
  item: TItem;
  stageKey: string;
  index: number;
  density?: CardDensity;
  disabled?: boolean;
  renderCard?: (item: any, actions: React.ReactNode, index: number) => React.ReactNode;
  renderActionButtons?: (item: any) => React.ReactNode;
  columns?: CrudColumn<any>[];
  displayName?: string;
}

export const KanbanSortableCard = memo(function KanbanSortableCard({
  id,
  item,
  stageKey,
  index,
  density = "standard",
  disabled = false,
  renderCard,
  renderActionButtons,
  columns,
  displayName,
}: KanbanSortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "card",
      item,
      stageKey,
      index,
    },
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const actionButtons = renderActionButtons ? renderActionButtons(item) : null;

  const densityClasses =
    density === "compact"
      ? "p-2 gap-1.5 text-xs"
      : density === "comfortable"
      ? "p-4 gap-3 text-sm"
      : "p-3 gap-2 text-sm";

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "rounded-nx-md border border-dashed border-nx-line/80 bg-nx-raised/40 opacity-40 min-h-[80px]",
          densityClasses
        )}
        aria-hidden="true"
      />
    );
  }

  const rawItem = item as any;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!disabled ? listeners : {})}
      className={cn(
        "group relative select-none",
        !disabled ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      )}
    >
      {renderCard ? (
        renderCard(item, actionButtons, index)
      ) : (
        <Card
          className={cn(
            "flex flex-col justify-between rounded-nx-md border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors",
            densityClasses
          )}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-nx-ink truncate">
                {displayName || rawItem?.title || rawItem?.name || rawItem?.id || `Item #${index + 1}`}
              </span>
            </div>
            {columns && columns.length > 0 && (
              <div className="space-y-1 pt-1">
                {columns.slice(0, 3).map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-nx-ink-3 truncate">{col.label}</span>
                    <span className="font-medium text-nx-ink-2 truncate">
                      {col.render
                        ? col.render(rawItem?.[col.key], item, index)
                        : String(rawItem?.[col.key] ?? "—")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {actionButtons && (
            <div className="border-t border-nx-line/60 pt-2 mt-2 flex items-center justify-end gap-1">
              {actionButtons}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}) as <TItem = any>(props: KanbanSortableCardProps<TItem>) => React.ReactElement | null;
