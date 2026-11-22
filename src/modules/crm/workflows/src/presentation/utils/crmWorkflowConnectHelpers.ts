"use client";

import type { Connection, FinalConnectionState } from "@xyflow/react";
import type { CrmWorkflowStageNode } from "../components/studio/CrmWorkflowCanvas2D";
import {
  chooseBestTargetPort,
  normalizePortId,
  resolveDropTargetAtPointer,
  type StagePortId,
} from "./crmWorkflowEdgeRouting";

/** Drag-start node and handle metadata tracked while drawing a new transition edge. */
export interface ConnectOrigin {
  nodeId: string;
  handleId?: StagePortId;
}

/** Directed stage-to-stage connection payload resolved from a canvas drag interaction. */
export interface DirectedConnectionResult {
  fromStageKey: string;
  toStageKey: string;
  sourcePort?: StagePortId;
  targetPort?: StagePortId;
}

/** Normalizes React Flow canvas node IDs into domain stage keys or wildcard `*`. */
export function normalizeConnectNodeId(nodeId?: string | null): string | null {
  if (!nodeId || nodeId === "__start__") return null;
  return nodeId === "__global_all__" ? "*" : nodeId;
}

/**
 * Resolves a React Flow Connection using the drag-start origin as the authoritative source
 * so source/target direction can never be reversed.
 */
export function resolveDirectedConnection(
  params: Connection,
  origin: ConnectOrigin | null,
): DirectedConnectionResult | null {
  const paramSource = normalizeConnectNodeId(params.source);
  const paramTarget = normalizeConnectNodeId(params.target);
  if (!paramSource || !paramTarget || paramSource === paramTarget) return null;

  if (origin) {
    if (paramTarget === origin.nodeId && paramSource !== origin.nodeId) {
      return {
        fromStageKey: origin.nodeId,
        toStageKey: paramSource,
        sourcePort: origin.handleId ?? normalizePortId(params.targetHandle),
        targetPort: normalizePortId(params.sourceHandle),
      };
    }
    return {
      fromStageKey: origin.nodeId,
      toStageKey: paramTarget,
      sourcePort: origin.handleId ?? normalizePortId(params.sourceHandle),
      targetPort: normalizePortId(params.targetHandle),
    };
  }

  return {
    fromStageKey: paramSource,
    toStageKey: paramTarget,
    sourcePort: normalizePortId(params.sourceHandle),
    targetPort: normalizePortId(params.targetHandle),
  };
}

/** Extracts clientX/clientY coordinates from MouseEvent or TouchEvent. */
export function extractPointerClientCoords(event: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
  if ("changedTouches" in event && event.changedTouches.length > 0) {
    return {
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
    };
  }
  const mouseEvt = event as MouseEvent;
  return {
    clientX: mouseEvt.clientX ?? 0,
    clientY: mouseEvt.clientY ?? 0,
  };
}

/**
 * Resolves a completed wire drop over a target stage card body or port during React Flow onConnectEnd
 * with the drag origin strictly preserved as source.
 */
export function resolveConnectEndTarget(
  event: MouseEvent | TouchEvent,
  connectionState: FinalConnectionState | undefined,
  origin: ConnectOrigin | null,
  stages: CrmWorkflowStageNode[],
  screenToFlowPosition: (point: { x: number; y: number }) => { x: number; y: number },
): DirectedConnectionResult | null {
  const fallbackNodeId = normalizeConnectNodeId(connectionState?.fromNode?.id);
  const effectiveOrigin: ConnectOrigin | null =
    origin ??
    (fallbackNodeId
      ? { nodeId: fallbackNodeId, handleId: normalizePortId(connectionState?.fromHandle?.id) }
      : null);
  if (!effectiveOrigin) return null;

  const { clientX, clientY } = extractPointerClientCoords(event);
  const flowPt = screenToFlowPosition({ x: clientX, y: clientY });
  const hit = resolveDropTargetAtPointer(
    clientX,
    clientY,
    flowPt,
    stages,
    effectiveOrigin.nodeId,
    event.target,
  );
  if (!hit.targetStageKey || hit.targetStageKey === "__start__" || hit.targetStageKey === effectiveOrigin.nodeId) {
    return null;
  }

  const fromNode = stages.find((s) => s.stageKey === effectiveOrigin.nodeId);
  const toNode = stages.find((s) => s.stageKey === hit.targetStageKey);
  const targetPort: StagePortId | undefined =
    hit.targetPortId ??
    (fromNode && toNode ? chooseBestTargetPort(fromNode, toNode, null, effectiveOrigin.handleId) : undefined);

  return {
    fromStageKey: effectiveOrigin.nodeId,
    toStageKey: hit.targetStageKey,
    sourcePort: effectiveOrigin.handleId,
    targetPort,
  };
}
