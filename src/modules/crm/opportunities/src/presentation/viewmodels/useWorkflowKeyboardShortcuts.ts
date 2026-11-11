"use client";

import { useEffect } from "react";

export interface UseWorkflowKeyboardShortcutsOptions {
  enabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedStageKey: string | null;
  selectedTransitionId: string | null;
  onDeleteSelectedStage?: (stageKey: string) => void;
  onDeleteSelectedTransition?: (transitionId: string) => void;
  onClearSelection: () => void;
  isAnyModalOpen?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  if (target.closest("[contenteditable='true']")) return true;
  return false;
}

/**
 * Keyboard shortcuts listener for 2D Workflow Studio (<100 lines).
 * Handles Ctrl+Z (Undo), Ctrl+Y / Shift+Ctrl+Z (Redo), Delete / Backspace, and Escape.
 */
export function useWorkflowKeyboardShortcuts({
  enabled,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedStageKey,
  selectedTransitionId,
  onDeleteSelectedStage,
  onDeleteSelectedTransition,
  onClearSelection,
  isAnyModalOpen = false,
}: UseWorkflowKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen || isEditableTarget(e.target)) return;

      const isModifier = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if (isModifier && !e.shiftKey && key === "z") {
        if (canUndo) {
          e.preventDefault();
          onUndo();
        }
        return;
      }

      // Redo: Ctrl+Y, Cmd+Y, or Ctrl+Shift+Z, Cmd+Shift+Z
      if ((isModifier && key === "y") || (isModifier && e.shiftKey && key === "z")) {
        if (canRedo) {
          e.preventDefault();
          onRedo();
        }
        return;
      }

      // Delete / Backspace: Remove selected transition or non-terminal stage
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedTransitionId) {
          e.preventDefault();
          onDeleteSelectedTransition?.(selectedTransitionId);
        } else if (selectedStageKey) {
          e.preventDefault();
          onDeleteSelectedStage?.(selectedStageKey);
        }
        return;
      }

      // Escape: Deselect current node or transition
      if (e.key === "Escape") {
        if (selectedStageKey !== null || selectedTransitionId !== null) {
          e.preventDefault();
          onClearSelection();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    selectedStageKey,
    selectedTransitionId,
    onDeleteSelectedStage,
    onDeleteSelectedTransition,
    onClearSelection,
    isAnyModalOpen,
  ]);
}
