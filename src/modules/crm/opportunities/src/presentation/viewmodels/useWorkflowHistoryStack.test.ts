import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWorkflowHistoryStack } from "./useWorkflowHistoryStack";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "../components/workflow/CrmWorkflowCanvas2D";

const mockInitialStages: CrmWorkflowStageNode[] = [
  {
    stageKey: "default.discovery",
    labelEn: "Discovery",
    labelAr: "استكشاف",
    probability: 10,
    slaDays: 5,
    order: 1,
    isTerminalWon: false,
    isTerminalLost: false,
    requiredExitFields: [],
    x: 100,
    y: 200,
  },
  {
    stageKey: "default.qualification",
    labelEn: "Qualification",
    labelAr: "تأهيل",
    probability: 30,
    slaDays: 7,
    order: 2,
    isTerminalWon: false,
    isTerminalLost: false,
    requiredExitFields: [],
    x: 400,
    y: 200,
  },
];

const mockInitialTransitions: CrmWorkflowTransition[] = [
  {
    id: "tr-1",
    nameEn: "Qualify",
    nameAr: "تأهيل",
    fromStageKey: "default.discovery",
    toStageKey: "default.qualification",
    direction: "forward",
    requiredFields: [],
  },
];

describe("useWorkflowHistoryStack", () => {
  it("initializes with empty past/future and canUndo/canRedo = false", () => {
    const { result } = renderHook(() => useWorkflowHistoryStack());

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.pastCount).toBe(0);
    expect(result.current.futureCount).toBe(0);
  });

  it("resets history with initial stages and transitions", () => {
    const { result } = renderHook(() => useWorkflowHistoryStack());

    act(() => {
      result.current.resetHistory(mockInitialStages, mockInitialTransitions);
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("pushes a new snapshot and allows undo", () => {
    const onApply = vi.fn();
    const { result } = renderHook(() => useWorkflowHistoryStack(onApply));

    act(() => {
      result.current.resetHistory(mockInitialStages, mockInitialTransitions);
    });

    const updatedStages = [
      ...mockInitialStages,
      {
        stageKey: "default.proposal",
        labelEn: "Proposal",
        labelAr: "عرض",
        probability: 60,
        slaDays: 5,
        order: 3,
        isTerminalWon: false,
        isTerminalLost: false,
        requiredExitFields: [],
        x: 700,
        y: 200,
      },
    ];

    act(() => {
      result.current.pushSnapshot(updatedStages, mockInitialTransitions);
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.pastCount).toBe(1);

    // Perform Undo
    let undoneSnapshot: unknown = null;
    act(() => {
      undoneSnapshot = result.current.undo();
    });

    expect(undoneSnapshot).toBeDefined();
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    expect(onApply).toHaveBeenCalled();

    // Perform Redo
    let redoneSnapshot: unknown = null;
    act(() => {
      redoneSnapshot = result.current.redo();
    });

    expect(redoneSnapshot).toBeDefined();
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("deduplicates identical consecutive snapshots", () => {
    const { result } = renderHook(() => useWorkflowHistoryStack());

    act(() => {
      result.current.resetHistory(mockInitialStages, mockInitialTransitions);
    });

    // Pushing the identical snapshot should not add a duplicate past entry
    act(() => {
      result.current.pushSnapshot(mockInitialStages, mockInitialTransitions);
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.pastCount).toBe(0);
  });

  it("truncates future stack when a new mutation is pushed after undo", () => {
    const { result } = renderHook(() => useWorkflowHistoryStack());

    act(() => {
      result.current.resetHistory(mockInitialStages, mockInitialTransitions);
    });

    const step1 = [
      ...mockInitialStages,
      { ...mockInitialStages[0], stageKey: "default.step1", order: 3 },
    ];
    act(() => {
      result.current.pushSnapshot(step1, mockInitialTransitions);
    });

    // Undo step 1
    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    // Push new step 2
    const step2 = [
      ...mockInitialStages,
      { ...mockInitialStages[0], stageKey: "default.step2", order: 3 },
    ];
    act(() => {
      result.current.pushSnapshot(step2, mockInitialTransitions);
    });

    // Future stack must now be empty
    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("bounds past history to maxSnapshots capacity", () => {
    const maxSnapshots = 5;
    const { result } = renderHook(() => useWorkflowHistoryStack(undefined, maxSnapshots));

    act(() => {
      result.current.resetHistory(mockInitialStages, mockInitialTransitions);
    });

    for (let i = 1; i <= 10; i++) {
      const step = [
        ...mockInitialStages,
        { ...mockInitialStages[0], stageKey: `default.step_${i}`, x: i * 50, order: 2 + i },
      ];
      act(() => {
        result.current.pushSnapshot(step, mockInitialTransitions);
      });
    }

    expect(result.current.pastCount).toBeLessThanOrEqual(maxSnapshots);
  });
});
