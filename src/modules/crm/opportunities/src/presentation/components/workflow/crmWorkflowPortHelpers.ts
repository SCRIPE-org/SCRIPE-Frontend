import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";

export const NODE_WIDTH = 248;
export const NODE_HEIGHT = 140;

export type StagePortSide = "top" | "right" | "bottom" | "left";
export type StagePortId =
  | "top-1" | "top-2" | "top-3"
  | "right-1" | "right-2" | "right-3"
  | "bottom-1" | "bottom-2" | "bottom-3"
  | "left-1" | "left-2" | "left-3";

export interface StagePortSpec { id: StagePortId; side: StagePortSide; rx: number; ry: number; }

/** Jira-exact 12 perimeter connection ports: 3 top, 3 right, 3 bottom, 3 left. */
export const STAGE_PORTS: StagePortSpec[] = [
  { id: "top-1", side: "top", rx: 0.25, ry: 0 }, { id: "top-2", side: "top", rx: 0.5, ry: 0 }, { id: "top-3", side: "top", rx: 0.75, ry: 0 },
  { id: "right-1", side: "right", rx: 1, ry: 0.25 }, { id: "right-2", side: "right", rx: 1, ry: 0.5 }, { id: "right-3", side: "right", rx: 1, ry: 0.75 },
  { id: "bottom-1", side: "bottom", rx: 0.25, ry: 1 }, { id: "bottom-2", side: "bottom", rx: 0.5, ry: 1 }, { id: "bottom-3", side: "bottom", rx: 0.75, ry: 1 },
  { id: "left-1", side: "left", rx: 0, ry: 0.25 }, { id: "left-2", side: "left", rx: 0, ry: 0.5 }, { id: "left-3", side: "left", rx: 0, ry: 0.75 },
];

export function normalizePortId(portId?: string | null): StagePortId | undefined {
  if (!portId) return undefined;
  return STAGE_PORTS.find((p) => p.id === portId)?.id;
}

export function getPortSpec(portId: StagePortId | string): StagePortSpec {
  const norm = normalizePortId(portId) ?? "right-2";
  return STAGE_PORTS.find((p) => p.id === norm) ?? STAGE_PORTS[4];
}

export function getPortCoords(node: CrmWorkflowStageNode, portId: StagePortId | string, fanOffset = 0): { x: number; y: number; side: StagePortSide } {
  const spec = getPortSpec(portId);
  const baseX = node.x + NODE_WIDTH * spec.rx, baseY = node.y + NODE_HEIGHT * spec.ry;
  if (spec.side === "top" || spec.side === "bottom") return { x: Math.round(baseX + fanOffset), y: Math.round(baseY), side: spec.side };
  return { x: Math.round(baseX), y: Math.round(baseY + fanOffset), side: spec.side };
}

/** Exact hit-testing for drag-and-drop connection wires using DOM elementsFromPoint + canvas bounding boxes. */
export function resolveDropTargetAtPointer(
  clientX: number, clientY: number, canvasPt: { x: number; y: number },
  stages: CrmWorkflowStageNode[], fromStageKey: string, eventTarget?: EventTarget | null,
): { targetStageKey: string | null; targetPortId: StagePortId | null } {
  const inspectElements: Element[] = [];
  if (eventTarget && eventTarget instanceof Element) inspectElements.push(eventTarget);
  if (typeof document !== "undefined" && typeof document.elementsFromPoint === "function" && (clientX !== 0 || clientY !== 0)) {
    for (const el of document.elementsFromPoint(clientX, clientY)) if (!inspectElements.includes(el)) inspectElements.push(el);
  }
  for (const el of inspectElements) {
    const portEl = el.closest?.("[data-port-id]");
    if (portEl) {
      const pStage = portEl.getAttribute("data-port-stage-key"), pId = normalizePortId(portEl.getAttribute("data-port-id"));
      if (pStage && pStage !== fromStageKey && pId) return { targetStageKey: pStage, targetPortId: pId };
    }
    const nodeEl = el.closest?.("[data-stage-node-key]");
    if (nodeEl) {
      const nStage = nodeEl.getAttribute("data-stage-node-key");
      if (nStage && nStage !== fromStageKey) return { targetStageKey: nStage, targetPortId: null };
    }
  }
  for (const stage of stages) {
    if (stage.stageKey === fromStageKey) continue;
    for (const port of STAGE_PORTS) {
      const pc = getPortCoords(stage, port.id);
      if (Math.hypot(canvasPt.x - pc.x, canvasPt.y - pc.y) <= 16) return { targetStageKey: stage.stageKey, targetPortId: port.id };
    }
    if (canvasPt.x >= stage.x - 14 && canvasPt.x <= stage.x + NODE_WIDTH + 14 && canvasPt.y >= stage.y - 14 && canvasPt.y <= stage.y + NODE_HEIGHT + 14) {
      return { targetStageKey: stage.stageKey, targetPortId: null };
    }
  }
  return { targetStageKey: null, targetPortId: null };
}

export const findDropTargetStage = resolveDropTargetAtPointer;

/** Selects the cleanest entry port on the target node when dropped onto the node body. */
export function chooseBestTargetPort(
  fromNode: CrmWorkflowStageNode, toNode: CrmWorkflowStageNode,
  explicitPort?: StagePortId | null, fromPortId?: StagePortId | null,
): StagePortId {
  if (explicitPort) return explicitPort;
  const dy = toNode.y - fromNode.y, dx = toNode.x - fromNode.x;
  if (Math.abs(dy) >= 80) return dy > 0 ? (dx < -25 ? "top-3" : dx > 25 ? "top-1" : "top-2") : (dx < -25 ? "bottom-3" : dx > 25 ? "bottom-1" : "bottom-2");
  if (fromPortId?.startsWith("top")) return dx >= 0 ? "top-1" : "top-3";
  if (fromPortId?.startsWith("bottom")) return dx >= 0 ? "bottom-1" : "bottom-3";
  return dx >= 0 ? "left-2" : "right-2";
}
