"use client";

import { useCallback, useRef, useState } from "react";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "../components/workflow/CrmWorkflowCanvas2D";

export interface WorkflowDraftSnapshot {
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
}

interface HistoryState {
  past: WorkflowDraftSnapshot[];
  present: WorkflowDraftSnapshot | null;
  future: WorkflowDraftSnapshot[];
}

function cloneSnapshot(snapshot: WorkflowDraftSnapshot): WorkflowDraftSnapshot {
  return {
    stages: snapshot.stages.map((s) => ({
      ...s,
      requiredExitFields: [...(s.requiredExitFields || [])],
      properties: s.properties ? { ...s.properties } : undefined,
    })),
    transitions: snapshot.transitions.map((tr) => ({
      ...tr,
      fromStageKeys: tr.fromStageKeys ? [...tr.fromStageKeys] : undefined,
      requiredFields: [...(tr.requiredFields || [])],
      restrictToRoles: tr.restrictToRoles ? [...tr.restrictToRoles] : undefined,
      triggers: tr.triggers ? [...tr.triggers] : undefined,
      properties: tr.properties ? { ...tr.properties } : undefined,
      catalogRules: tr.catalogRules ? [...tr.catalogRules] : undefined,
    })),
  };
}

function areSnapshotsEqual(a: WorkflowDraftSnapshot, b: WorkflowDraftSnapshot): boolean {
  if (a.stages.length !== b.stages.length || a.transitions.length !== b.transitions.length) {
    return false;
  }
  for (let i = 0; i < a.stages.length; i++) {
    const sA = a.stages[i];
    const sB = b.stages[i];
    if (
      sA.stageKey !== sB.stageKey ||
      sA.x !== sB.x ||
      sA.y !== sB.y ||
      sA.order !== sB.order ||
      sA.labelEn !== sB.labelEn ||
      sA.probability !== sB.probability ||
      sA.slaDays !== sB.slaDays ||
      sA.allowInboundFromAny !== sB.allowInboundFromAny ||
      sA.requiredExitFields.length !== sB.requiredExitFields.length
    ) {
      return false;
    }
  }
  for (let i = 0; i < a.transitions.length; i++) {
    const tA = a.transitions[i];
    const tB = b.transitions[i];
    if (
      tA.id !== tB.id ||
      tA.fromStageKey !== tB.fromStageKey ||
      tA.toStageKey !== tB.toStageKey ||
      tA.nameEn !== tB.nameEn ||
      tA.direction !== tB.direction ||
      tA.requireReason !== tB.requireReason ||
      tA.allowRollback !== tB.allowRollback ||
      tA.requiredFields.length !== tB.requiredFields.length
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Bounded (max 40) multi-step Undo/Redo stack for CRM Workflow Studio draft mutations (<150 lines).
 */
export function useWorkflowHistoryStack(
  onApplySnapshot?: (snapshot: WorkflowDraftSnapshot) => void,
  maxSnapshots = 40,
) {
  const [historyState, setHistoryState] = useState<HistoryState>({
    past: [],
    present: null,
    future: [],
  });

  const stateRef = useRef<HistoryState>(historyState);
  stateRef.current = historyState;

  const resetHistory = useCallback((stages: CrmWorkflowStageNode[], transitions: CrmWorkflowTransition[]) => {
    const initial = cloneSnapshot({ stages, transitions });
    const nextState: HistoryState = {
      past: [],
      present: initial,
      future: [],
    };
    stateRef.current = nextState;
    setHistoryState(nextState);
  }, []);

  const pushSnapshot = useCallback(
    (stages: CrmWorkflowStageNode[], transitions: CrmWorkflowTransition[]) => {
      const current = stateRef.current;
      const next = cloneSnapshot({ stages, transitions });

      if (current.present && areSnapshotsEqual(current.present, next)) {
        return;
      }

      const newPast = current.present
        ? [...current.past, current.present].slice(-maxSnapshots)
        : current.past.slice(-maxSnapshots);

      const nextState: HistoryState = {
        past: newPast,
        present: next,
        future: [],
      };
      stateRef.current = nextState;
      setHistoryState(nextState);
    },
    [maxSnapshots],
  );

  const undo = useCallback((): WorkflowDraftSnapshot | null => {
    const current = stateRef.current;
    if (current.past.length === 0 || !current.present) return null;

    const previous = current.past[current.past.length - 1];
    const newPast = current.past.slice(0, current.past.length - 1);
    const newFuture = [current.present, ...current.future];

    const nextState: HistoryState = {
      past: newPast,
      present: previous,
      future: newFuture,
    };
    stateRef.current = nextState;
    setHistoryState(nextState);

    const cloned = cloneSnapshot(previous);
    onApplySnapshot?.(cloned);
    return cloned;
  }, [onApplySnapshot]);

  const redo = useCallback((): WorkflowDraftSnapshot | null => {
    const current = stateRef.current;
    if (current.future.length === 0 || !current.present) return null;

    const next = current.future[0];
    const newFuture = current.future.slice(1);
    const newPast = [...current.past, current.present];

    const nextState: HistoryState = {
      past: newPast,
      present: next,
      future: newFuture,
    };
    stateRef.current = nextState;
    setHistoryState(nextState);

    const cloned = cloneSnapshot(next);
    onApplySnapshot?.(cloned);
    return cloned;
  }, [onApplySnapshot]);

  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  return {
    canUndo,
    canRedo,
    pushSnapshot,
    undo,
    redo,
    resetHistory,
    pastCount: historyState.past.length,
    futureCount: historyState.future.length,
  };
}
