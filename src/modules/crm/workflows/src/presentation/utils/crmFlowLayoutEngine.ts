"use client";

import dagre from "@dagrejs/dagre";
import ELK from "elkjs/lib/elk.bundled.js";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "../components/studio/CrmWorkflowCanvas2D";

/** Fixed pixel width of workflow stage cards on the 2D studio canvas. */
export const STAGE_NODE_WIDTH = 248;
/** Fixed pixel height of workflow stage cards on the 2D studio canvas. */
export const STAGE_NODE_HEIGHT = 140;

/** Supported automatic graph layout engines for CRM workflow diagrams. */
export type LayoutAlgorithm = "elk" | "dagre_lr" | "dagre_tb";

const elk = new ELK();

/** Checks if a stage is terminal (Closed Won, Closed Lost, Converted, Disqualified). */
function isTerminalStage(stage: CrmWorkflowStageNode): boolean {
  return Boolean(
    stage.category === "done" ||
      stage.category === "lost" ||
      stage.isTerminalWon ||
      stage.isTerminalLost,
  );
}

/** Checks if a transition represents a backward rollback or terminal reopen. */
function isReopenOrBackward(
  tr: CrmWorkflowTransition,
  stageMap: Map<string, CrmWorkflowStageNode>,
): boolean {
  if (tr.direction === "backward") return true;
  const fromStage = stageMap.get(tr.fromStageKey);
  const toStage = stageMap.get(tr.toStageKey);
  if (!fromStage || !toStage) return false;
  if (isTerminalStage(fromStage) && !isTerminalStage(toStage)) return true;
  return fromStage.order > toStage.order;
}

/** Post-processes positions so terminal Won and Lost stages are aligned on the right in LR mode. */
function postProcessTerminalAlignment(
  positionMap: Map<string, { x: number; y: number }>,
  stages: CrmWorkflowStageNode[],
  isAr: boolean,
  isVertical = false,
) {
  if (isVertical || stages.length === 0) return;

  const doneStage = stages.find((s) => s.category === "done" || s.isTerminalWon);
  const lostStages = stages.filter((s) => s.category === "lost" || s.isTerminalLost);

  if (lostStages.length === 0) return;

  let maxX = 0;
  let minX = Infinity;
  for (const st of stages) {
    if (!lostStages.includes(st)) {
      const pos = positionMap.get(st.stageKey);
      if (pos) {
        maxX = Math.max(maxX, pos.x);
        minX = Math.min(minX, pos.x);
      }
    }
  }

  const donePos = doneStage ? positionMap.get(doneStage.stageKey) : null;
  const terminalX = isAr ? (donePos ? donePos.x : minX) : (donePos ? donePos.x : maxX);

  lostStages.forEach((lostSt, idx) => {
    const baseLostY = donePos
      ? donePos.y + (idx + 1) * (STAGE_NODE_HEIGHT + 160)
      : 410 + idx * (STAGE_NODE_HEIGHT + 160);

    positionMap.set(lostSt.stageKey, {
      x: terminalX,
      y: baseLostY,
    });
  });
}

/** Computes layered layout using ELK (Orthogonal left-to-right or right-to-left for Arabic). */
export async function applyElkLayout(
  stages: CrmWorkflowStageNode[],
  transitions: CrmWorkflowTransition[],
  options: { isAr?: boolean } = {},
): Promise<Map<string, { x: number; y: number }>> {
  const isAr = Boolean(options.isAr);
  const positionMap = new Map<string, { x: number; y: number }>();
  if (stages.length === 0) return positionMap;

  const validStageKeys = new Set(stages.map((s) => s.stageKey));
  const stageMap = new Map(stages.map((s) => [s.stageKey, s]));

  // Only consider forward, non-wildcard transitions for structural ranking
  const structuralEdges = transitions.filter(
    (tr) =>
      tr.fromStageKey !== "*" &&
      !tr.fromStageKeys?.includes("*") &&
      validStageKeys.has(tr.fromStageKey) &&
      validStageKeys.has(tr.toStageKey) &&
      tr.fromStageKey !== tr.toStageKey &&
      !isReopenOrBackward(tr, stageMap),
  );

  let elkDirection = "RIGHT";
  if (isAr) {
    elkDirection = "LEFT";
  }

  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": elkDirection,
      "elk.spacing.nodeNode": "130",
      "elk.layered.spacing.nodeNodeBetweenLayers": "220",
      "elk.layered.spacing.edgeNodeBetweenLayers": "70",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.padding": "[top=130,left=220,bottom=80,right=100]",
    },
    children: stages.map((st) => ({
      id: st.stageKey,
      width: STAGE_NODE_WIDTH,
      height: STAGE_NODE_HEIGHT,
    })),
    edges: structuralEdges.map((tr) => ({
      id: tr.id,
      sources: [tr.fromStageKey],
      targets: [tr.toStageKey],
    })),
  };

  try {
    const layouted = await elk.layout(elkGraph);
    if (layouted.children) {
      for (const node of layouted.children) {
        if (typeof node.x === "number" && typeof node.y === "number") {
          positionMap.set(node.id, {
            x: Math.max(24, Math.round(node.x)),
            y: Math.max(24, Math.round(node.y)),
          });
        }
      }
    }
    postProcessTerminalAlignment(positionMap, stages, isAr, false);
  } catch {
    return applyDagreLayout(stages, transitions, { direction: "LR", isAr });
  }

  return positionMap;
}

/** Computes hierarchical layout using @dagrejs/dagre (fast synchronous LR or TB). */
export function applyDagreLayout(
  stages: CrmWorkflowStageNode[],
  transitions: CrmWorkflowTransition[],
  options: { direction?: "LR" | "TB"; isAr?: boolean } = {},
): Map<string, { x: number; y: number }> {
  const { direction = "LR", isAr = false } = options;
  const positionMap = new Map<string, { x: number; y: number }>();
  if (stages.length === 0) return positionMap;

  const validStageKeys = new Set(stages.map((s) => s.stageKey));
  const stageMap = new Map(stages.map((s) => [s.stageKey, s]));

  const g = new dagre.graphlib.Graph();
  let rankdir: "TB" | "BT" | "LR" | "RL" = direction;
  if (direction === "LR" && isAr) {
    rankdir = "RL";
  }
  g.setGraph({
    rankdir,
    nodesep: 130,
    ranksep: 220,
    marginx: 220,
    marginy: 130,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const st of stages) {
    g.setNode(st.stageKey, {
      width: STAGE_NODE_WIDTH,
      height: STAGE_NODE_HEIGHT,
    });
  }

  // Add only forward structural edges to prevent cycle and reopen inverted ranking
  for (const tr of transitions) {
    if (
      tr.fromStageKey !== "*" &&
      !tr.fromStageKeys?.includes("*") &&
      validStageKeys.has(tr.fromStageKey) &&
      validStageKeys.has(tr.toStageKey) &&
      tr.fromStageKey !== tr.toStageKey &&
      !isReopenOrBackward(tr, stageMap)
    ) {
      g.setEdge(tr.fromStageKey, tr.toStageKey);
    }
  }

  dagre.layout(g);

  for (const st of stages) {
    const node = g.node(st.stageKey);
    if (node) {
      positionMap.set(st.stageKey, {
        x: Math.max(24, Math.round(node.x - STAGE_NODE_WIDTH / 2)),
        y: Math.max(24, Math.round(node.y - STAGE_NODE_HEIGHT / 2)),
      });
    }
  }

  if (direction === "LR") {
    postProcessTerminalAlignment(positionMap, stages, isAr, false);
  }

  return positionMap;
}

/** Unified entry point for auto-layout with ELK or Dagre. */
export async function calculateWorkflowAutoLayout(
  stages: CrmWorkflowStageNode[],
  transitions: CrmWorkflowTransition[],
  algorithm: LayoutAlgorithm = "elk",
  options: { isAr?: boolean } = {},
): Promise<Map<string, { x: number; y: number }>> {
  if (algorithm === "elk") {
    return applyElkLayout(stages, transitions, options);
  }
  if (algorithm === "dagre_tb") {
    return applyDagreLayout(stages, transitions, { direction: "TB", isAr: options.isAr });
  }
  return applyDagreLayout(stages, transitions, { direction: "LR", isAr: options.isAr });
}
