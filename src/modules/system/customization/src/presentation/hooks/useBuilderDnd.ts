/**
 * useBuilderDnd — Shared DnD hook for the page builder
 *
 * Extracted from BuilderPanel so that DndContext can wrap BOTH
 * the sidebar (palette + layers) AND the full-width canvas.
 * Without this, palette→canvas drag doesn't work because they'd
 * be in different React trees.
 */
"use client";

import { useState, useCallback } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useBuilderStore } from "../viewmodels/useBuilderStore";
import type { CanvasComponentType } from "../../domain/entities/CanvasComponent";

export function useBuilderDnd() {
  const store = useBuilderStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
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
          store.addComponent(activeData.type as CanvasComponentType);
        }
        return;
      }

      // 2. Dragged within canvas (reorder)
      if (activeData?.source === "canvas" && active.id !== over.id) {
        const oldIndex = store.components.findIndex((c) => c.id === active.id);
        const newIndex = store.components.findIndex((c) => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const activeComp = store.components[oldIndex];
          const overComp = store.components[newIndex];
          store.moveComponent(
            activeComp.id,
            overComp.gridColumn,
            overComp.gridRow,
          );
          store.moveComponent(
            overComp.id,
            activeComp.gridColumn,
            activeComp.gridRow,
          );
        }
        return;
      }

      // 3. Dragged in layer list (z-reorder)
      if (activeData?.source === "layer-list") {
        const activeCompId = activeData.componentId as string;
        const overData = over.data.current;
        if (overData?.source === "layer-list" && overData?.componentId) {
          const overCompId = overData.componentId as string;
          if (activeCompId !== overCompId) {
            const activeComp = store.components.find(
              (c) => c.id === activeCompId,
            );
            const overComp = store.components.find(
              (c) => c.id === overCompId,
            );
            if (activeComp && overComp) {
              const activeZ = activeComp.zIndex;
              store.updateComponent(activeCompId, { zIndex: overComp.zIndex });
              store.updateComponent(overCompId, { zIndex: activeZ });
            }
          }
        }
      }
    },
    [store],
  );

  // Find the component being dragged for the overlay
  const activeComponent = activeId
    ? store.components.find((c) => c.id === activeId) || null
    : null;

  // Find palette item being dragged
  const activePaletteType = activeId?.startsWith("palette-")
    ? activeId.replace("palette-", "")
    : null;

  return {
    sensors,
    activeId,
    activeComponent,
    activePaletteType,
    handleDragStart,
    handleDragEnd,
    store,
  };
}
