/**
 * useBuilderDnd — Shared DnD hook for the page builder
 *
 * Extracted from BuilderPanel so that DndContext can wrap BOTH
 * the sidebar (palette + layers) AND the full-width canvas.
 * Without this, palette→canvas drag doesn't work because they'd
 * be in different React trees.
 *
 * Supports both absolute (free-form) and grid positioning modes.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useBuilderStore } from "../viewmodels/useBuilderStore";
import type { CanvasComponentType } from "../../domain/entities/CanvasComponent";

export function useBuilderDnd() {
  const store = useBuilderStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over, delta } = event;
      if (!over) return;

      const activeData = active.data.current;
      const overId = String(over.id);

      // 1. Dragged from palette → canvas
      if (activeData?.source === "palette" && activeData?.type) {
        if (
          overId === "builder-canvas" ||
          overId.startsWith("comp_") ||
          overId.startsWith("default-")
        ) {
          const newComp = store.addComponent(activeData.type as CanvasComponentType);

          // In grid mode, if dropped ON a specific component, insert at that position
          if (newComp && store.positionMode === "grid" && overId.startsWith("comp_")) {
            const targetComp = store.components.find((c) => c.id === overId);
            if (targetComp) {
              // Assign the new component's grid position to match where it was dropped
              store.updateComponent(newComp.id, {
                gridRow: targetComp.gridRow,
                gridColumn: targetComp.gridColumn,
              });
              // Push the target and subsequent components down by one row
              const targetRowStart = parseInt(targetComp.gridRow.split("/")[0]?.trim(), 10) || 1;
              store.components.forEach((c) => {
                if (c.id === newComp.id) return;
                const rowStart = parseInt(c.gridRow.split("/")[0]?.trim(), 10) || 1;
                if (rowStart >= targetRowStart) {
                  store.updateComponent(c.id, {
                    gridRow: `${rowStart + 1} / ${rowStart + 2}`,
                  });
                }
              });
            }
          }

          // In absolute mode, offset the new component position by the drop delta
          if (newComp && store.positionMode === "absolute" && delta) {
            const scale = store.zoom / 100;
            const adjustedX = Math.max(0, Math.round(newComp.x + delta.x / scale));
            const adjustedY = Math.max(0, Math.round(newComp.y + delta.y / scale));
            store.moveComponentAbsolute(newComp.id, adjustedX, adjustedY);
          }
        }
        return;
      }

      // 2. Dragged within canvas (reorder) — grid mode only
      if (activeData?.source === "canvas" && active.id !== over.id) {
        if (store.positionMode === "grid") {
          // Swap grid positions between the two components
          const srcComp = store.components.find((c) => c.id === String(active.id));
          const dstComp = store.components.find((c) => c.id === String(over.id));
          if (srcComp && dstComp) {
            const srcRow = srcComp.gridRow;
            const srcCol = srcComp.gridColumn;
            store.updateComponent(String(active.id), {
              gridRow: dstComp.gridRow,
              gridColumn: dstComp.gridColumn,
            });
            store.updateComponent(String(over.id), {
              gridRow: srcRow,
              gridColumn: srcCol,
            });
          }
          // Also reorder in the array for layer list consistency
          store.reorderComponents(String(active.id), String(over.id));
        }
        // In absolute mode, drag is handled by DraggableCanvasItem's mouseDown
        return;
      }

      // 3. Dragged in layer list (z-reorder via array reorder)
      if (activeData?.source === "layer-list") {
        const activeCompId = activeData.componentId as string;
        const overData = over.data.current;
        if (overData?.source === "layer-list" && overData?.componentId) {
          const overCompId = overData.componentId as string;
          if (activeCompId !== overCompId) {
            store.reorderComponents(activeCompId, overCompId);
          }
        }
      }
    },
    [store]
  );

  // Find the component being dragged for the overlay
  const activeComponent = activeId ? store.components.find((c) => c.id === activeId) || null : null;

  // Find palette item being dragged
  const activePaletteType = activeId?.startsWith("palette-")
    ? activeId.replace("palette-", "")
    : null;

  // Compute overlapping component IDs (for free-form mode)
  const overlappingIds = useMemo(() => {
    if (store.positionMode !== "absolute") return new Set<string>();
    const pairs = store.getOverlaps();
    const ids = new Set<string>();
    for (const [a, b] of pairs) {
      ids.add(a);
      ids.add(b);
    }
    return ids;
  }, [store]);

  return {
    sensors,
    activeId,
    activeComponent,
    activePaletteType,
    handleDragStart,
    handleDragEnd,
    overlappingIds,
    store,
  };
}
