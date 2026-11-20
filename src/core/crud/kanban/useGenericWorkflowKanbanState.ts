"use client";

import { useCallback, useMemo, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCrudI18n } from "../hooks/useCrudI18n";
import type {
  CardDensity,
  WorkflowKanbanConfig,
  WorkflowKanbanStageConfig,
  WorkflowKanbanSwimlane,
} from "./types";

function extractTargetStageKey<TItem>(
  over: DragOverEvent["over"] | DragEndEvent["over"],
  stages: WorkflowKanbanStageConfig<TItem>[]
): string | null {
  if (!over) return null;
  const current = over.data.current;
  if (current?.stageKey) return String(current.stageKey);

  const overIdStr = String(over.id);
  if (overIdStr.startsWith("swimlane::")) {
    const parts = overIdStr.split("::");
    if (parts.length >= 3) return parts[2];
  }
  const matched = stages.find((s) => s.stageKey === overIdStr);
  return matched ? matched.stageKey : null;
}

/**
 * Encapsulates drag sensors, stage/swimlane grouping, and 3-state drop handling for GenericWorkflowKanban.
 */
export function useGenericWorkflowKanbanState<TItem = any>(
  config: WorkflowKanbanConfig<TItem>,
  items: TItem[]
) {
  const { t } = useCrudI18n();
  const {
    stages,
    stageField = "stageKey",
    cardDensity: initialDensity = "standard",
    swimlaneMode = "none",
    swimlaneField,
    swimlanes: configuredSwimlanes,
    evaluateDropTarget,
    onMoveItem,
    isReadOnly = false,
  } = config;

  const [activeItem, setActiveItem] = useState<TItem | null>(null);
  const [activeStageKey, setActiveStageKey] = useState<string | null>(null);
  const [overStageKey, setOverStageKey] = useState<string | null>(null);
  const [overSwimlaneKey, setOverSwimlaneKey] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentDensity, setCurrentDensity] = useState<CardDensity>(initialDensity);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const kanbanCollisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    return pointerCollisions.length > 0 ? pointerCollisions : closestCorners(args);
  }, []);

  const getStageKey = useCallback(
    (item: TItem): string =>
      typeof stageField === "function" ? stageField(item) : String((item as any)?.[stageField] ?? ""),
    [stageField]
  );

  const stageItemsMap = useMemo(() => {
    const map = new Map<string, TItem[]>();
    for (const stage of stages) map.set(stage.stageKey, []);
    for (const item of items) {
      const key = getStageKey(item);
      const list = map.get(key);
      if (list) {
        list.push(item);
      } else {
        const firstKey = stages[0]?.stageKey || "unassigned";
        const fallbackList = map.get(firstKey);
        if (fallbackList) fallbackList.push(item);
        else map.set(firstKey, [item]);
      }
    }
    return map;
  }, [stages, items, getStageKey]);

  const computedSwimlanes = useMemo<WorkflowKanbanSwimlane<TItem>[]>(() => {
    if (swimlaneMode === "none") return [];
    if (configuredSwimlanes && configuredSwimlanes.length > 0) return configuredSwimlanes;
    if (!swimlaneField) return [];

    const getSwimlaneVal = (item: TItem): string =>
      typeof swimlaneField === "function"
        ? swimlaneField(item)
        : String((item as any)?.[swimlaneField] ?? "Unassigned");

    const swimlaneSet = new Set<string>();
    for (const item of items) swimlaneSet.add(getSwimlaneVal(item));

    return Array.from(swimlaneSet).map((val) => ({
      id: val,
      label: val,
      filter: (item: TItem) => getSwimlaneVal(item) === val,
    }));
  }, [swimlaneMode, configuredSwimlanes, swimlaneField, items]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (isReadOnly) return;
      const data = event.active.data.current;
      if (data && data.item) {
        setActiveItem(data.item as TItem);
        setActiveStageKey(data.stageKey || getStageKey(data.item as TItem));
        setOverStageKey(null);
        setOverSwimlaneKey(null);
        setLocalError(null);
      }
    },
    [isReadOnly, getStageKey]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (!over) {
        setOverStageKey(null);
        setOverSwimlaneKey(null);
        return;
      }
      setOverStageKey(extractTargetStageKey(over, stages));
      setOverSwimlaneKey(over.data.current?.swimlaneKey ? String(over.data.current.swimlaneKey) : null);
    },
    [stages]
  );

  const handleDragCancel = useCallback((_event: DragCancelEvent) => {
    setActiveItem(null);
    setActiveStageKey(null);
    setOverStageKey(null);
    setOverSwimlaneKey(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setOverStageKey(null);
      setOverSwimlaneKey(null);

      if (!over || !active) {
        setActiveItem(null);
        setActiveStageKey(null);
        return;
      }

      const draggedItem = active.data.current?.item as TItem | undefined;
      const sourceStageKey =
        active.data.current?.stageKey || (draggedItem ? getStageKey(draggedItem) : null);
      const targetStageKey = extractTargetStageKey(over, stages);

      if (draggedItem && targetStageKey && targetStageKey !== sourceStageKey) {
        const evalResult = evaluateDropTarget
          ? evaluateDropTarget(draggedItem, targetStageKey)
          : { state: "allowed_instant" as const };

        if (evalResult.state === "blocked") {
          setLocalError(
            evalResult.reason ||
              t("crud.kanban.transitionBlocked", {
                defaultValue: "Transition is not permitted by workflow rules.",
              })
          );
        } else {
          setLocalError(null);
          onMoveItem?.(draggedItem, targetStageKey, evalResult);
        }
      }

      setActiveItem(null);
      setActiveStageKey(null);
    },
    [stages, getStageKey, evaluateDropTarget, onMoveItem, t]
  );

  return {
    activeItem,
    activeStageKey,
    overStageKey,
    overSwimlaneKey,
    localError,
    setLocalError,
    currentDensity,
    setCurrentDensity,
    sensors,
    kanbanCollisionDetection,
    getStageKey,
    stageItemsMap,
    computedSwimlanes,
    handleDragStart,
    handleDragOver,
    handleDragCancel,
    handleDragEnd,
  };
}
