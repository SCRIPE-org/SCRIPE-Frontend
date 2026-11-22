import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useWorkflowKeyboardShortcuts } from "./useWorkflowKeyboardShortcuts";

describe("useWorkflowKeyboardShortcuts", () => {
  const onUndo = vi.fn();
  const onRedo = vi.fn();
  const onClearSelection = vi.fn();
  const onDeleteSelectedStage = vi.fn();
  const onDeleteSelectedTransition = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fires onUndo when Ctrl+Z is pressed and canUndo is true", () => {
    renderHook(() =>
      useWorkflowKeyboardShortcuts({
        enabled: true,
        canUndo: true,
        canRedo: false,
        onUndo,
        onRedo,
        selectedStageKey: null,
        selectedTransitionId: null,
        onClearSelection,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true });
    window.dispatchEvent(event);

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).not.toHaveBeenCalled();
  });

  it("does not fire onUndo when canUndo is false", () => {
    renderHook(() =>
      useWorkflowKeyboardShortcuts({
        enabled: true,
        canUndo: false,
        canRedo: true,
        onUndo,
        onRedo,
        selectedStageKey: null,
        selectedTransitionId: null,
        onClearSelection,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true });
    window.dispatchEvent(event);

    expect(onUndo).not.toHaveBeenCalled();
  });

  it("fires onRedo when Ctrl+Y or Shift+Ctrl+Z is pressed and canRedo is true", () => {
    renderHook(() =>
      useWorkflowKeyboardShortcuts({
        enabled: true,
        canUndo: true,
        canRedo: true,
        onUndo,
        onRedo,
        selectedStageKey: null,
        selectedTransitionId: null,
        onClearSelection,
      }),
    );

    const eventY = new KeyboardEvent("keydown", { key: "y", ctrlKey: true, bubbles: true });
    window.dispatchEvent(eventY);
    expect(onRedo).toHaveBeenCalledTimes(1);

    const eventShiftZ = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    window.dispatchEvent(eventShiftZ);
    expect(onRedo).toHaveBeenCalledTimes(2);
  });

  it("fires onDeleteSelectedTransition when Delete is pressed and a transition is selected", () => {
    renderHook(() =>
      useWorkflowKeyboardShortcuts({
        enabled: true,
        canUndo: false,
        canRedo: false,
        onUndo,
        onRedo,
        selectedStageKey: null,
        selectedTransitionId: "tr-100",
        onDeleteSelectedTransition,
        onClearSelection,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "Delete", bubbles: true });
    window.dispatchEvent(event);

    expect(onDeleteSelectedTransition).toHaveBeenCalledWith("tr-100");
  });

  it("fires onDeleteSelectedStage when Delete is pressed and a stage is selected", () => {
    renderHook(() =>
      useWorkflowKeyboardShortcuts({
        enabled: true,
        canUndo: false,
        canRedo: false,
        onUndo,
        onRedo,
        selectedStageKey: "default.custom_stage",
        selectedTransitionId: null,
        onDeleteSelectedStage,
        onClearSelection,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "Delete", bubbles: true });
    window.dispatchEvent(event);

    expect(onDeleteSelectedStage).toHaveBeenCalledWith("default.custom_stage");
  });

  it("fires onClearSelection when Escape is pressed", () => {
    renderHook(() =>
      useWorkflowKeyboardShortcuts({
        enabled: true,
        canUndo: false,
        canRedo: false,
        onUndo,
        onRedo,
        selectedStageKey: "default.discovery",
        selectedTransitionId: null,
        onClearSelection,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    window.dispatchEvent(event);

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("ignores shortcuts when enabled is false or a modal is open", () => {
    renderHook(() =>
      useWorkflowKeyboardShortcuts({
        enabled: false,
        canUndo: true,
        canRedo: true,
        onUndo,
        onRedo,
        selectedStageKey: "default.discovery",
        selectedTransitionId: null,
        onClearSelection,
        isAnyModalOpen: true,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true });
    window.dispatchEvent(event);
    expect(onUndo).not.toHaveBeenCalled();
  });

  it("fires onSave when Ctrl+S or Cmd+S is pressed", () => {
    const onSave = vi.fn();
    renderHook(() =>
      useWorkflowKeyboardShortcuts({
        enabled: true,
        canUndo: false,
        canRedo: false,
        onUndo,
        onRedo,
        onSave,
        selectedStageKey: null,
        selectedTransitionId: null,
        onClearSelection,
      }),
    );

    const ctrlS = new KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true });
    window.dispatchEvent(ctrlS);
    expect(onSave).toHaveBeenCalledTimes(1);

    const cmdS = new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true });
    window.dispatchEvent(cmdS);
    expect(onSave).toHaveBeenCalledTimes(2);
  });
});
