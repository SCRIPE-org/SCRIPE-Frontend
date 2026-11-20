import React from "react";
import { act, render, renderHook } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it, vi } from "vitest";
import type { CrmWorkflowDefinition } from "@modules/crm";
import { CrmStageFlowHandles } from "./CrmStageFlowHandles";
import { STAGE_PORTS } from "../../utils/crmWorkflowEdgeRouting";
import { resolveConnectEndTarget, resolveDirectedConnection } from "../../utils/crmWorkflowConnectHelpers";
import { buildStageNodesFromWorkflow, buildTransitionsFromWorkflow, serializeStudioDraftToWorkflow } from "../../utils/crmWorkflowStudioMappers";
import { useCrmWorkflowCanvasGraph } from "../../viewmodels/useCrmWorkflowCanvasGraph";
import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";

const TEST_STAGES: CrmWorkflowStageNode[] = [
  { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "الاستكشاف", probability: 10, slaDays: 7, order: 1, category: "todo", isTerminalWon: false, isTerminalLost: false, requiredExitFields: [], x: 240, y: 110 },
  { stageKey: "default.solution_fit", labelEn: "Solution Fit", labelAr: "ملاءمة الحل", probability: 50, slaDays: 14, order: 3, category: "in_progress", isTerminalWon: false, isTerminalLost: false, requiredExitFields: ["solutionFitConfirmed"], x: 700, y: 110 },
];

describe("2D Workflow Studio — Directed Wire Creation & Lossless Mapper", () => {
  it("renders all 12 interactive ports as type=source and 12 non-connectable type=target companion handles", () => {
    const TestNode = () => <div className="relative w-[248px] h-[140px]"><CrmStageFlowHandles stageKey="default.solution_fit" /></div>;
    const { container } = render(
      <div style={{ width: 800, height: 600 }}>
        <ReactFlowProvider>
          <ReactFlow nodes={[{ id: "default.solution_fit", type: "stageStub", position: { x: 0, y: 0 }, data: {} }]} edges={[]} nodeTypes={{ stageStub: TestNode }} />
        </ReactFlowProvider>
      </div>,
    );

    for (const port of STAGE_PORTS) {
      const interactive = container.querySelector(`[data-testid="node-port-default.solution_fit-${port.id}"]`);
      expect(interactive).not.toBeNull();
      expect(interactive?.classList.contains("source")).toBe(true);
      expect(interactive?.classList.contains("target")).toBe(false);
      expect(interactive?.classList.contains("connectable")).toBe(true);

      const companion = container.querySelector(`.react-flow__handle.target[data-handleid="${port.id}"][data-nodeid="default.solution_fit"]`) as HTMLElement | null;
      expect(companion).not.toBeNull();
      expect(companion?.classList.contains("connectable")).toBe(false);
      expect(companion?.style.pointerEvents).toBe("none");
      expect(companion?.style.opacity).toBe("0");
    }
  });

  it("enforces drag origin as source for Solution Fit -> Discovery in both onConnect and onConnectEnd card-body drops", () => {
    const reversedFix = resolveDirectedConnection(
      { source: "default.discovery", sourceHandle: "right-2", target: "default.solution_fit", targetHandle: "bottom-2" },
      { nodeId: "default.solution_fit", handleId: "bottom-2" },
    );
    expect(reversedFix).toEqual({ fromStageKey: "default.solution_fit", toStageKey: "default.discovery", sourcePort: "bottom-2", targetPort: "right-2" });

    const targetCard = document.createElement("div");
    targetCard.setAttribute("data-stage-node-key", "default.discovery");
    expect(resolveConnectEndTarget({ clientX: 320, clientY: 160, target: targetCard } as unknown as MouseEvent, undefined, { nodeId: "default.solution_fit", handleId: "bottom-2" }, TEST_STAGES, (pt) => pt))
      .toEqual({ fromStageKey: "default.solution_fit", toStageKey: "default.discovery", sourcePort: "bottom-2", targetPort: "bottom-3" });

    expect(resolveConnectEndTarget({ clientX: 20, clientY: 500, target: document.body } as unknown as MouseEvent, undefined, { nodeId: "default.solution_fit", handleId: "bottom-2" }, TEST_STAGES, (pt) => pt)).toBeNull();

    const onOpenAddTransition = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => <ReactFlowProvider>{children}</ReactFlowProvider>;
    const { result } = renderHook(
      () => useCrmWorkflowCanvasGraph({
        stages: TEST_STAGES, transitions: [], selectedStageKey: null, selectedTransitionId: null, isAr: false,
        onSelectStage: vi.fn(), onSelectTransition: vi.fn(), onNodeMove: vi.fn(), onOpenAddTransition,
      }),
      { wrapper },
    );

    act(() => {
      result.current.onConnectStart(new MouseEvent("mousedown"), { nodeId: "default.solution_fit", handleId: "bottom-2", handleType: "source" });
      result.current.onConnect({ source: "default.discovery", sourceHandle: "right-2", target: "default.solution_fit", targetHandle: "bottom-2" });
      result.current.onConnectEnd({ clientX: 300, clientY: 160, target: targetCard } as unknown as MouseEvent, { isValid: true } as any);
    });
    expect(onOpenAddTransition).toHaveBeenCalledTimes(1);
    expect(onOpenAddTransition).toHaveBeenCalledWith("default.solution_fit", "default.discovery", "bottom-2", "right-2");

    onOpenAddTransition.mockClear();
    act(() => {
      result.current.onConnectStart(new MouseEvent("mousedown"), { nodeId: "default.solution_fit", handleId: "left-2", handleType: "source" });
      result.current.onConnectEnd({ clientX: 300, clientY: 160, target: targetCard } as unknown as MouseEvent, { isValid: false } as any);
    });
    expect(onOpenAddTransition).toHaveBeenCalledTimes(1);
    expect(onOpenAddTransition).toHaveBeenCalledWith("default.solution_fit", "default.discovery", "left-2", "right-2");
  });

  it("round-trips Deal promptFields, allowInboundFromAny, and ports losslessly in crmWorkflowStudioMappers", () => {
    const baseRules = {
      allowRollback: true, requiredPermission: null, blockIfLinkedDealProgressed: false, promptForComment: true,
      requireVerifiedParty: false, requireEstimatedAmountPositive: false, requireTargetCloseDate: false,
      triggerDealConversion: false, autoCreateWorkTask: false,
    };
    const dealWorkflow: CrmWorkflowDefinition = {
      id: "wf-deal-default", code: "default", entityType: "deal", nameEn: "Standard Commercial Pipeline", nameAr: "مسار الصفقات القياسي",
      descriptionEn: "", descriptionAr: "", isActive: true, version: 1, updatedAtUtc: "2026-01-01T00:00:00Z",
      stages: [
        { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "الاستكشاف", sortOrder: 1, category: "todo", winProbabilityPercent: 10, slaDays: 7, requiredExitFields: [], allowInboundFromAny: false },
        { stageKey: "default.closed_won", labelEn: "Closed Won", labelAr: "إغلاق ناجح", sortOrder: 2, category: "done", winProbabilityPercent: 100, slaDays: 0, requiredExitFields: [], allowInboundFromAny: false },
        { stageKey: "default.closed_lost", labelEn: "Closed Lost", labelAr: "إغلاق خاسر", sortOrder: 3, category: "lost", winProbabilityPercent: 0, slaDays: 0, requiredExitFields: ["lossReasonCode"], allowInboundFromAny: true },
      ],
      transitions: [
        {
          id: "tr-deal-mark-lost", nameEn: "Close as Lost", nameAr: "إغلاق كخسارة",
          fromStageKey: "*", fromStageKeys: ["*"], toStageKey: "default.closed_lost", direction: "global",
          domainEventKey: "DealClosedLostEvent", triggers: [], properties: { sourcePort: "bottom-3", targetPort: "bottom-2" }, catalogRules: [],
          rules: { ...baseRules, promptFields: ["lossReasonCode", "closeNotes"], requiredFieldKeys: ["lossReasonCode"] },
        },
        {
          id: "tr-deal-reopen", nameEn: "Reopen Deal", nameAr: "إعادة فتح الصفقة",
          fromStageKey: "default.closed_lost", fromStageKeys: ["default.closed_lost"], toStageKey: "default.discovery", direction: "backward",
          domainEventKey: "DealReopenedEvent", triggers: [], properties: { sourcePort: "left-2", targetPort: "right-2" }, catalogRules: [],
          rules: { ...baseRules, promptFields: ["reason"], requiredFieldKeys: [] },
        },
      ],
    };

    const draftStages = buildStageNodesFromWorkflow(dealWorkflow);
    const draftTransitions = buildTransitionsFromWorkflow(dealWorkflow);

    expect(draftTransitions[0].promptFields).toEqual(["lossReasonCode", "closeNotes"]);
    expect(draftTransitions[0].requireNote).toBe(true);
    expect(draftTransitions[0].sourcePort).toBe("bottom-3");
    expect(draftTransitions[0].targetPort).toBe("bottom-2");
    expect(draftTransitions[1].promptFields).toEqual(["reason"]);
    expect(draftTransitions[1].requireNote).toBe(false);

    draftTransitions.push({
      id: "tr-deal-custom-note", nameEn: "Custom Transition", nameAr: "انتقال مخصص",
      fromStageKey: "default.discovery", fromStageKeys: ["default.discovery"], toStageKey: "default.closed_won",
      direction: "forward", requiredFields: [], requireNote: true, sourcePort: "right-2", targetPort: "left-2",
    });

    const serialized = serializeStudioDraftToWorkflow(dealWorkflow, draftStages, draftTransitions);
    const lostStage = serialized.stages.find((s) => s.stageKey === "default.closed_lost")!;
    expect(lostStage.allowInboundFromAny).toBe(true);
    expect(lostStage.properties?.allowInboundFromAny).toBe("true");

    const markLost = serialized.transitions.find((t) => t.id === "tr-deal-mark-lost")!;
    expect(markLost.rules.promptFields).toEqual(["lossReasonCode", "closeNotes"]);
    expect(markLost.properties?.sourcePort).toBe("bottom-3");
    expect(markLost.properties?.targetPort).toBe("bottom-2");

    const reopen = serialized.transitions.find((t) => t.id === "tr-deal-reopen")!;
    expect(reopen.rules.promptFields).toEqual(["reason"]);
    expect(reopen.properties?.sourcePort).toBe("left-2");
    expect(reopen.properties?.targetPort).toBe("right-2");

    const custom = serialized.transitions.find((t) => t.id === "tr-deal-custom-note")!;
    expect(custom.rules.promptFields).toEqual(["closeNotes"]);

    draftTransitions[0].requireNote = false;
    const stripped = serializeStudioDraftToWorkflow(dealWorkflow, draftStages, draftTransitions);
    expect(stripped.transitions.find((t) => t.id === "tr-deal-mark-lost")!.rules.promptFields).toEqual(["lossReasonCode"]);
  });
});
