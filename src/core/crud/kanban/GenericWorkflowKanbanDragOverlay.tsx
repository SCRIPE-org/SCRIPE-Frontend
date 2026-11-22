"use client";

import React from "react";
import { createPortal } from "react-dom";
import { DragOverlay } from "@dnd-kit/core";
import { Card } from "@core/ui/card";
import type { CrudColumn } from "../components/generic-crud-view";

interface GenericWorkflowKanbanDragOverlayProps<TItem = any> {
  activeItem: TItem | null;
  renderCard?: (item: TItem, actions: React.ReactNode, index: number) => React.ReactNode;
  getItemDisplayName?: (item: TItem) => string;
  columns?: CrudColumn<TItem>[];
}

/** Portaled tactical ghost card overlay displayed while dragging a Kanban item. */
export function GenericWorkflowKanbanDragOverlay<TItem = any>({
  activeItem,
  renderCard,
  getItemDisplayName,
  columns,
}: GenericWorkflowKanbanDragOverlayProps<TItem>) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <DragOverlay zIndex={9999} dropAnimation={null}>
      {activeItem ? (
        <div
          data-testid="kanban-drag-overlay"
          className="pointer-events-none w-[288px] cursor-grabbing opacity-95 ring-2 ring-nx-accent rounded-xl select-none"
        >
          {renderCard ? (
            <div className="rounded-nx-md ring-1 ring-nx-accent/50 shadow-nx-modal rotate-[1deg] scale-[1.02] overflow-hidden bg-nx-surface">
              {renderCard(activeItem, null, 0)}
            </div>
          ) : (
            <Card className="flex flex-col justify-between rounded-nx-md border border-nx-accent bg-nx-surface p-3 shadow-nx-modal ring-1 ring-nx-accent/40 rotate-[1.5deg] scale-[1.02]">
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
    </DragOverlay>,
    document.body
  );
}
