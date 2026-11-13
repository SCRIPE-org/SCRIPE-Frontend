"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Node,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type OnReconnect,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import type { TransitionFlowEdge } from "./CrmTransitionFlowEdge";
import { chooseBestTargetPort, normalizePortId, type StagePortId } from "./crmWorkflowEdgeRouting";
import { calculateWorkflowAutoLayout, type LayoutAlgorithm } from "./crmFlowLayoutEngine";
import {
  normalizeConnectNodeId,
  resolveConnectEndTarget,
  resolveDirectedConnection,
  type ConnectOrigin,
} from "./crmWorkflowConnectHelpers";
import { buildWorkflowCanvasEdges } from "./crmWorkflowEdgeBuilder";

export interface UseCrmWorkflowCanvasGraphParams {
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
  selectedStageKey: string | null;
  selectedTransitionId: string | null;
  isAr: boolean;
  crmCustomFields?: CrmCustomFieldDefinition[];
  onSelectStage: (stageKey: string | null) => void;
  onSelectTransition: (transitionId: string | null) => void;
  onNodeMove: (stageKey: string, x: number, y: number) => void;
  onAutoLayout?: (algorithm?: LayoutAlgorithm) => void;
  onApplyLayoutPositions?: (positions: Map<string, { x: number; y: number }>) => void;
  onTransitionChange?: (updated: CrmWorkflowTransition) => void;
  onOpenAddTransition: (
    fromStageKey?: string,
    toStageKey?: string,
    sourcePort?: StagePortId,
    targetPort?: StagePortId,
  ) => void;
}

/** ReactFlow state management and layout hook for 2D Workflow Canvas (<220 lines). */
export function useCrmWorkflowCanvasGraph(params: UseCrmWorkflowCanvasGraphParams) {
  const {
    stages, transitions, selectedStageKey, selectedTransitionId, isAr, crmCustomFields = [],
    onSelectStage, onSelectTransition, onNodeMove, onAutoLayout, onApplyLayoutPositions,
    onTransitionChange, onOpenAddTransition,
  } = params;

  const { fitView, screenToFlowPosition } = useReactFlow();
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const [showTransitionLabels, setShowTransitionLabels] = useState(true);
  const [showGlobalWires, setShowGlobalWires] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [simModeOpen, setSimModeOpen] = useState(false);

  const connectOriginRef = useRef<ConnectOrigin | null>(null);
  const didConnectInGestureRef = useRef(false);
  const reactFlowConnectingRef = useRef(false);

  const wildcardTransitions = useMemo(
    () => transitions.filter((tr) => tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")),
    [transitions],
  );
  const directTransitions = useMemo(
    () => transitions.filter((tr) => tr.fromStageKey !== "*" && !tr.fromStageKeys?.includes("*")),
    [transitions],
  );
  const firstStage = useMemo(() => [...stages].sort((a, b) => a.order - b.order)[0], [stages]);

  const onStartWireDraft = useCallback((fromStageKey: string, fromPortId: StagePortId) => {
    connectOriginRef.current = { nodeId: fromStageKey, handleId: fromPortId };
    didConnectInGestureRef.current = false;
    reactFlowConnectingRef.current = false;
  }, []);

  const onFinishWireDraft = useCallback((targetStageKey: string, targetPortId?: StagePortId) => {
    // Active React Flow drags resolve via onConnect / onConnectEnd right after pointerup
    if (reactFlowConnectingRef.current) return;
    const origin = connectOriginRef.current;
    connectOriginRef.current = null;
    didConnectInGestureRef.current = false;
    if (!origin || targetStageKey === "__start__" || origin.nodeId === targetStageKey) return;

    const fromNode = stages.find((s) => s.stageKey === origin.nodeId);
    const toNode = stages.find((s) => s.stageKey === targetStageKey);
    const resolvedTargetPort: StagePortId | undefined =
      targetPortId ??
      (fromNode && toNode ? chooseBestTargetPort(fromNode, toNode, null, origin.handleId) : undefined);
    onOpenAddTransition(origin.nodeId, targetStageKey, origin.handleId, resolvedTargetPort);
  }, [stages, onOpenAddTransition]);

  const clearIdleWireDraft = useCallback(() => {
    if (!reactFlowConnectingRef.current) {
      connectOriginRef.current = null;
      didConnectInGestureRef.current = false;
    }
  }, []);

  const initialNodes: Node[] = useMemo(() => {
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
        onSelectStage: (key: string) => { onSelectStage(key); onSelectTransition(null); },
        onSelectGlobalTransition: (id: string) => { onSelectTransition(id); onSelectStage(null); },
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
            if (firstW) { onSelectTransition(firstW.id); onSelectStage(null); }
          },
        },
        selectable: true,
        draggable: true,
      });
    }

    return stageNodes;
  }, [
    stages, selectedStageKey, selectedTransitionId, isAr, crmCustomFields, wildcardTransitions,
    onSelectStage, onSelectTransition, onStartWireDraft, onFinishWireDraft, firstStage, showGlobalWires,
  ]);

  const initialEdges: TransitionFlowEdge[] = useMemo(() => buildWorkflowCanvasEdges({
    stages, transitions, directTransitions, wildcardTransitions, firstStage,
    selectedTransitionId, isAr, showGlobalWires, showTransitionLabels, onSelectTransition, onSelectStage,
  }), [
    stages, transitions, directTransitions, wildcardTransitions, firstStage,
    selectedTransitionId, isAr, showGlobalWires, showTransitionLabels, onSelectTransition, onSelectStage,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => { setNodes(initialNodes); }, [initialNodes, setNodes]);
  useEffect(() => { setEdges(initialEdges); }, [initialEdges, setEdges]);

  const onNodeDragStop = useCallback((_: MouseEvent | TouchEvent, node: Node) => {
    if (node.id === "__start__" || node.id === "__global_all__") return;
    onNodeMove(node.id, Math.round(node.position.x), Math.round(node.position.y));
  }, [onNodeMove]);

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId }) => {
    reactFlowConnectingRef.current = true;
    didConnectInGestureRef.current = false;
    const normalized = normalizeConnectNodeId(nodeId);
    if (!normalized) return;
    connectOriginRef.current = { nodeId: normalized, handleId: normalizePortId(handleId) ?? undefined };
  }, []);

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    didConnectInGestureRef.current = true;
    const resolved = resolveDirectedConnection(connection, connectOriginRef.current);
    connectOriginRef.current = null;
    reactFlowConnectingRef.current = false;
    if (resolved) {
      onOpenAddTransition(resolved.fromStageKey, resolved.toStageKey, resolved.sourcePort, resolved.targetPort);
    }
  }, [onOpenAddTransition]);

  const onConnectEnd: OnConnectEnd = useCallback((event, connectionState) => {
    const origin = connectOriginRef.current;
    const alreadyConnected = didConnectInGestureRef.current;
    connectOriginRef.current = null;
    didConnectInGestureRef.current = false;
    reactFlowConnectingRef.current = false;
    if (alreadyConnected || !origin) return;

    const resolved = resolveConnectEndTarget(
      event,
      connectionState,
      origin,
      stages,
      screenToFlowPosition ?? ((pt) => pt),
    );
    if (resolved) {
      onOpenAddTransition(resolved.fromStageKey, resolved.toStageKey, resolved.sourcePort, resolved.targetPort);
    }
  }, [stages, screenToFlowPosition, onOpenAddTransition]);

  const onReconnect: OnReconnect = useCallback((oldEdge, newConnection) => {
    const existing = transitions.find((t) => t.id === oldEdge.id);
    if (existing && newConnection.source && newConnection.target) {
      const fromOrd = stages.find((s) => s.stageKey === newConnection.source)?.order ?? 0;
      const toOrd = stages.find((s) => s.stageKey === newConnection.target)?.order ?? 0;
      const dir = newConnection.source === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward";
      const updated: CrmWorkflowTransition = {
        ...existing,
        fromStageKey: newConnection.source, fromStageKeys: [newConnection.source], toStageKey: newConnection.target,
        direction: dir,
        sourcePort: (newConnection.sourceHandle as StagePortId) ?? undefined,
        targetPort: (newConnection.targetHandle as StagePortId) ?? undefined,
      };
      onTransitionChange?.(updated);
    }
  }, [transitions, stages, onTransitionChange]);

  const handleExecuteAutoLayout = useCallback(async (algo: LayoutAlgorithm = "elk") => {
    onAutoLayout?.(algo);
    const positionMap = await calculateWorkflowAutoLayout(stages, transitions, algo, { isAr });
    if (onApplyLayoutPositions) onApplyLayoutPositions(positionMap);
    else positionMap.forEach((pos, key) => onNodeMove(key, pos.x, pos.y));
    setTimeout(() => void fitView({ padding: 0.16, duration: 300 }), 50);
  }, [onAutoLayout, stages, transitions, isAr, onApplyLayoutPositions, onNodeMove, fitView]);

  const handleExportPng = useCallback(async () => {
    const viewportEl = flowContainerRef.current?.querySelector(".react-flow__viewport") as HTMLElement | null;
    if (!viewportEl) return;
    try {
      setIsExportingPng(true);
      const dataUrl = await toPng(viewportEl, {
        backgroundColor: (typeof document !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--nx-ground").trim() : "") || "#090d16",
        filter: (node) => !(node as HTMLElement).classList?.contains("react-flow__panel"),
      });
      const link = document.createElement("a");
      link.download = `crm-workflow-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExportingPng(false);
    }
  }, []);

  return {
    flowContainerRef, firstStage, nodes, edges, onNodesChange, onEdgesChange,
    onNodeDragStop, onConnectStart, onConnect, onConnectEnd, onReconnect, clearIdleWireDraft,
    showTransitionLabels, setShowTransitionLabels, showGlobalWires, setShowGlobalWires,
    showMiniMap, setShowMiniMap, isExportingPng, simModeOpen, setSimModeOpen,
    handleExecuteAutoLayout, handleExportPng,
  };
}
