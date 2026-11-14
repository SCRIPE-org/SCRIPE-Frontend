"use client";

import { MarkerType } from "@xyflow/react";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import type { TransitionFlowEdge } from "./CrmTransitionFlowEdge";
import type { StagePortId } from "./CrmWorkflowCanvasSubViews";

export interface BuildWorkflowEdgesParams {
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
  directTransitions: CrmWorkflowTransition[];
  wildcardTransitions: CrmWorkflowTransition[];
  firstStage?: CrmWorkflowStageNode;
  selectedTransitionId: string | null;
  isAr: boolean;
  showGlobalWires: boolean;
  showTransitionLabels: boolean;
  onSelectTransition: (transitionId: string | null) => void;
  onSelectStage: (stageKey: string | null) => void;
}

/** Builds React Flow TransitionFlowEdge array with smart multi-port routing and obstacle avoidance. */
export function buildWorkflowCanvasEdges(params: BuildWorkflowEdgesParams): TransitionFlowEdge[] {
  const {
    stages, transitions, directTransitions, wildcardTransitions, firstStage,
    selectedTransitionId, isAr, showGlobalWires, showTransitionLabels,
    onSelectTransition, onSelectStage,
  } = params;

  const resultEdges: TransitionFlowEdge[] = [];
  const stageBoxes = stages.map((s) => {
    const hasGlobalSatellite = s.allowInboundFromAny || wildcardTransitions.some((w) => w.toStageKey === s.stageKey);
    return { x: s.x, y: hasGlobalSatellite ? s.y - 40 : s.y, w: 248, h: hasGlobalSatellite ? 180 : 140 };
  });
  const stageMap = new Map(stages.map((s) => [s.stageKey, s]));

  let defaultSrcPort: StagePortId = "right-2";
  let defaultDstPort: StagePortId = "left-2";
  if (isAr) {
    defaultSrcPort = "left-2";
    defaultDstPort = "right-2";
  }

  if (firstStage) {
    const startFlowsRight = stages.length <= 1 || stages.every((s) => s.x >= firstStage.x - 20);
    resultEdges.push({
      id: "edge-start-to-first",
      source: "__start__",
      target: firstStage.stageKey,
      sourceHandle: startFlowsRight ? "right-2" : "left-2",
      targetHandle: startFlowsRight ? "left-2" : "right-2",
      type: "smoothstep",
      animated: true,
      selectable: false,
      style: { stroke: "var(--nx-success)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "var(--nx-success)" },
    } as unknown as TransitionFlowEdge);
  }

  const activeTransitions = showGlobalWires ? transitions : directTransitions;
  const pairCounts = new Map<string, number>();
  const pairIndices = new Map<string, number>();

  activeTransitions.forEach((tr) => {
    const isWildcard = tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*");
    const src = isWildcard ? (showGlobalWires ? "__global_all__" : firstStage?.stageKey ?? "") : tr.fromStageKey;
    const key = `${src}->${tr.toStageKey}`;
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
  });

  let backwardCount = 0;
  let crossLaneCount = 0;

  activeTransitions.forEach((tr) => {
    const isWildcard = tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*");
    const resolvedSource = isWildcard
      ? (showGlobalWires ? "__global_all__" : firstStage?.stageKey ?? stages[0]?.stageKey ?? "")
      : tr.fromStageKey;
    const fromNode = stageMap.get(resolvedSource);
    const toNode = stageMap.get(tr.toStageKey);
    const fromOrd = fromNode?.order ?? 0;
    const toOrd = toNode?.order ?? 0;
    const isBackward = !isWildcard && (tr.direction === "backward" || (fromOrd > 0 && toOrd > 0 && toOrd < fromOrd));
    const isCrossRow = Math.abs((fromNode?.y ?? 0) - (toNode?.y ?? 0)) > 60;

    let edgeOffset = 24;
    let labelStaggerX = 0;
    let labelStaggerY = 0;
    if (isBackward || isCrossRow) {
      crossLaneCount++;
      edgeOffset = 28 + (crossLaneCount % 4) * 20;
      labelStaggerX = (crossLaneCount % 3) * 52 - 26;
      labelStaggerY = crossLaneCount % 2 === 0 ? -20 : 20;
    }

    let sourceHandle: StagePortId;
    let targetHandle: StagePortId;
    if (isBackward) {
      const isSpecialLostOrAny = Boolean(
        fromNode?.isTerminalLost ||
        fromNode?.allowInboundFromAny ||
        (fromNode?.y ?? 0) > 200 ||
        wildcardTransitions.some((w) => w.toStageKey === fromNode?.stageKey),
      );
      if (isSpecialLostOrAny) {
        sourceHandle = tr.sourcePort ?? "bottom-3";
        targetHandle = tr.targetPort ?? "bottom-2";
      } else {
        backwardCount++;
        const useTop = backwardCount % 2 === 1;
        sourceHandle = tr.sourcePort ?? (useTop ? "top-2" : "bottom-3");
        targetHandle = tr.targetPort ?? (useTop ? "top-1" : "bottom-1");
      }
    } else if (isWildcard) {
      sourceHandle = tr.sourcePort ?? "bottom-3";
      targetHandle = tr.targetPort ?? "top-1";
    } else if (!tr.sourcePort && !tr.targetPort && fromNode && toNode && Math.abs(fromNode.x - toNode.x) > 40) {
      sourceHandle = fromNode.x < toNode.x ? "right-2" : "left-2";
      targetHandle = fromNode.x < toNode.x ? "left-2" : "right-2";
    } else {
      sourceHandle = tr.sourcePort ?? defaultSrcPort;
      targetHandle = tr.targetPort ?? defaultDstPort;
    }

    const key = `${resolvedSource}->${tr.toStageKey}`;
    const parallelIndex = pairIndices.get(key) ?? 0;
    pairIndices.set(key, parallelIndex + 1);
    const parallelCount = pairCounts.get(key) ?? 1;
    const isSelected = selectedTransitionId === tr.id;
    const edgeColor = isSelected ? "var(--nx-accent)" : isWildcard ? "var(--nx-ink-3)" : "var(--nx-line-hi)";

    resultEdges.push({
      id: tr.id,
      source: resolvedSource,
      target: tr.toStageKey,
      sourceHandle,
      targetHandle,
      type: "transitionEdge",
      selected: isSelected,
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: edgeColor },
      data: {
        transition: tr, isAr, isSelected, showLabels: showTransitionLabels, isGlobalWildcard: isWildcard,
        parallelIndex, parallelCount, offset: edgeOffset, labelStaggerX, labelStaggerY, stageBoxes,
        onSelectTransition: (id: string) => { onSelectTransition(id); onSelectStage(null); },
      },
    });

    if (showGlobalWires && isWildcard) {
      stages.filter((s) => s.stageKey !== tr.toStageKey).forEach((srcStage, fIdx) => {
        resultEdges.push({
          id: `${tr.id}__fanout__${srcStage.stageKey}`,
          source: srcStage.stageKey,
          target: tr.toStageKey,
          sourceHandle: (fIdx % 2 === 0 ? "bottom-3" : "top-3") as StagePortId,
          targetHandle: (fIdx % 2 === 0 ? "bottom-1" : "top-1") as StagePortId,
          type: "transitionEdge",
          selected: isSelected,
          markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "var(--nx-ink-3)" },
          data: {
            transition: { ...tr, fromStageKey: srcStage.stageKey },
            isAr, isSelected, showLabels: false, isGlobalWildcard: true, stageBoxes,
            onSelectTransition: (id: string) => { onSelectTransition(id); onSelectStage(null); },
          },
        });
      });
    }
  });

  return resultEdges;
}
