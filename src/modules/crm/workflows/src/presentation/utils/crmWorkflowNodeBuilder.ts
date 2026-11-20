"use client";

import type { Node } from "@xyflow/react";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "../components/studio/CrmWorkflowCanvas2D";
import type { StagePortId } from "./crmWorkflowEdgeRouting";

interface BuildWorkflowCanvasNodesParams {
  stages: CrmWorkflowStageNode[];
  firstStage?: CrmWorkflowStageNode;
  selectedStageKey: string | null;
  selectedTransitionId: string | null;
  isAr: boolean;
  crmCustomFields: CrmCustomFieldDefinition[];
  wildcardTransitions: CrmWorkflowTransition[];
  showGlobalWires: boolean;
  onSelectStage: (stageKey: string | null) => void;
  onSelectTransition: (transitionId: string | null) => void;
  onStartWireDraft: (fromStageKey: string, fromPortId: StagePortId) => void;
  onFinishWireDraft: (targetStageKey: string, targetPortId?: StagePortId) => void;
}

/** Builds ReactFlow stage, start-trigger, and global wildcard nodes for 2D Workflow Studio. */
export function buildWorkflowCanvasNodes({
  stages,
  firstStage,
  selectedStageKey,
  selectedTransitionId,
  isAr,
  crmCustomFields,
  wildcardTransitions,
  showGlobalWires,
  onSelectStage,
  onSelectTransition,
  onStartWireDraft,
  onFinishWireDraft,
}: BuildWorkflowCanvasNodesParams): Node[] {
  const stageNodes: Node[] = stages.map((st) => ({
    id: st.stageKey,
    type: "stageNode",
    position: { x: st.x, y: st.y },
    data: {
      stage: st,
      isSelected: selectedStageKey === st.stageKey,
      selectedTransitionId,
      isAr,
      crmCustomFields,
      globalIncoming: wildcardTransitions.filter((w) => w.toStageKey === st.stageKey),
      onSelectStage: (key: string) => {
        onSelectStage(key);
        onSelectTransition(null);
      },
      onSelectGlobalTransition: (id: string) => {
        onSelectTransition(id);
        onSelectStage(null);
      },
      onStartWireDraft,
      onFinishWireDraft,
    },
  }));

  if (firstStage) {
    const startFlowsRight = stages.length <= 1 || stages.every((s) => s.x >= firstStage.x - 20);
    const startX = startFlowsRight ? firstStage.x - 156 : firstStage.x + 300;
    stageNodes.unshift({
      id: "__start__",
      type: "startNode",
      position: { x: startX, y: firstStage.y + 46 },
      data: { isAr },
      selectable: false,
      draggable: false,
    });
  }

  if (showGlobalWires && wildcardTransitions.length > 0 && firstStage) {
    stageNodes.unshift({
      id: "__global_all__",
      type: "globalAllNode",
      position: { x: firstStage.x, y: firstStage.y - 96 },
      data: {
        isAr,
        onSelectGlobalTransition: () => {
          const firstW = wildcardTransitions[0];
          if (firstW) {
            onSelectTransition(firstW.id);
            onSelectStage(null);
          }
        },
      },
      selectable: true,
      draggable: true,
    });
  }

  return stageNodes;
}
