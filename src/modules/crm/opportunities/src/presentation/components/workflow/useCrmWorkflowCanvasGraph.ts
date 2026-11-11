"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MarkerType,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Node,
  type OnConnect,
  type OnReconnect,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import type { TransitionFlowEdge } from "./CrmTransitionFlowEdge";
import type { StagePortId } from "./CrmWorkflowCanvasSubViews";
import { calculateWorkflowAutoLayout, type LayoutAlgorithm } from "./crmFlowLayoutEngine";

export interface UseCrmWorkflowCanvasGraphParams {
  stages: CrmWorkflowStageNode[]; transitions: CrmWorkflowTransition[];
  selectedStageKey: string | null; selectedTransitionId: string | null;
  isAr: boolean; crmCustomFields?: CrmCustomFieldDefinition[];
  onSelectStage: (stageKey: string | null) => void;
  onSelectTransition: (transitionId: string | null) => void;
  onNodeMove: (stageKey: string, x: number, y: number) => void;
  onAutoLayout?: (algorithm?: LayoutAlgorithm) => void;
  onApplyLayoutPositions?: (positions: Map<string, { x: number; y: number }>) => void;
  onTransitionChange?: (updated: CrmWorkflowTransition) => void;
  onOpenAddTransition: (fromStageKey?: string, toStageKey?: string, sourcePort?: StagePortId, targetPort?: StagePortId) => void;
}

/** ReactFlow state management and layout hook for 2D Workflow Canvas (<280 lines). */
export function useCrmWorkflowCanvasGraph(params: UseCrmWorkflowCanvasGraphParams) {
  const {
    stages, transitions, selectedStageKey, selectedTransitionId, isAr, crmCustomFields = [],
    onSelectStage, onSelectTransition, onNodeMove, onAutoLayout, onApplyLayoutPositions,
    onTransitionChange, onOpenAddTransition,
  } = params;

  const { fitView } = useReactFlow();
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const [showTransitionLabels, setShowTransitionLabels] = useState(true);
  const [showGlobalWires, setShowGlobalWires] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [simModeOpen, setSimModeOpen] = useState(false);
  const [wireDraftSource, setWireDraftSource] = useState<{ fromStageKey: string; fromPortId?: StagePortId } | null>(null);

  const wildcardTransitions = useMemo(
    () => transitions.filter((tr) => tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")),
    [transitions],
  );
  const directTransitions = useMemo(
    () => transitions.filter((tr) => tr.fromStageKey !== "*" && !tr.fromStageKeys?.includes("*")),
    [transitions],
  );
  const firstStage = useMemo(() => [...stages].sort((a, b) => a.order - b.order)[0], [stages]);

  const initialNodes: Node[] = useMemo(() => {
    const stageNodes: Node[] = stages.map((st) => ({
      id: st.stageKey, type: "stageNode", position: { x: st.x, y: st.y },
      data: {
        stage: st, isSelected: selectedStageKey === st.stageKey, selectedTransitionId, isAr, crmCustomFields,
        globalIncoming: wildcardTransitions.filter((w) => w.toStageKey === st.stageKey),
        onSelectStage: (key: string) => { onSelectStage(key); onSelectTransition(null); },
        onSelectGlobalTransition: (id: string) => { onSelectTransition(id); onSelectStage(null); },
        onStartWireDraft: (fromStageKey: string, fromPortId: StagePortId) => setWireDraftSource({ fromStageKey, fromPortId }),
        onFinishWireDraft: (targetStageKey: string, targetPortId?: StagePortId) => {
          if (wireDraftSource && wireDraftSource.fromStageKey !== targetStageKey) {
            onOpenAddTransition(wireDraftSource.fromStageKey, targetStageKey, wireDraftSource.fromPortId, targetPortId);
          }
          setWireDraftSource(null);
        },
      },
    }));

    if (firstStage) {
      stageNodes.unshift({
        id: "__start__", type: "startNode",
        position: { x: isAr ? firstStage.x + 300 : firstStage.x - 156, y: firstStage.y + 46 },
        data: { isAr }, selectable: false, draggable: false,
      });
    }

    if (showGlobalWires && wildcardTransitions.length > 0 && firstStage) {
      stageNodes.unshift({
        id: "__global_all__", type: "globalAllNode",
        position: { x: firstStage.x, y: firstStage.y - 96 },
        data: {
          isAr,
          onSelectGlobalTransition: () => {
            const firstW = wildcardTransitions[0];
            if (firstW) { onSelectTransition(firstW.id); onSelectStage(null); }
          },
        },
        selectable: true, draggable: true,
      });
    }

    return stageNodes;
  }, [stages, selectedStageKey, selectedTransitionId, isAr, crmCustomFields, wildcardTransitions, onSelectStage, onSelectTransition, wireDraftSource, onOpenAddTransition, firstStage, showGlobalWires]);

  const initialEdges: TransitionFlowEdge[] = useMemo(() => {
    const resultEdges: TransitionFlowEdge[] = [];
    const stageBoxes = stages.map((s) => {
      const hasGlobalSatellite = s.allowInboundFromAny || wildcardTransitions.some((w) => w.toStageKey === s.stageKey);
      return { x: s.x, y: hasGlobalSatellite ? s.y - 40 : s.y, w: 248, h: hasGlobalSatellite ? 180 : 140 };
    });
    const stageMap = new Map(stages.map((s) => [s.stageKey, s]));

    if (firstStage) {
      let sourceHandle: StagePortId = "right-2";
      let targetHandle: StagePortId = "left-2";
      if (isAr) {
        sourceHandle = "left-2";
        targetHandle = "right-2";
      }
      resultEdges.push({
        id: "edge-start-to-first", source: "__start__", target: firstStage.stageKey,
        sourceHandle, targetHandle,
        type: "smoothstep", animated: true, selectable: false,
        style: { stroke: "#10b981", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "#10b981" },
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
    activeTransitions.forEach((tr) => {
      const isWildcard = tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*");
      const resolvedSource = isWildcard ? (showGlobalWires ? "__global_all__" : firstStage?.stageKey ?? stages[0]?.stageKey ?? "") : tr.fromStageKey;
      const fromNode = stageMap.get(resolvedSource);
      const toNode = stageMap.get(tr.toStageKey);
      const fromOrd = fromNode?.order ?? 0;
      const toOrd = toNode?.order ?? 0;
      const isBackward = !isWildcard && (tr.direction === "backward" || (fromOrd > 0 && toOrd > 0 && toOrd < fromOrd));

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
      } else {
        let defSrc: StagePortId = "right-2";
        let defDst: StagePortId = "left-2";
        if (isAr) {
          defSrc = "left-2";
          defDst = "right-2";
        }
        sourceHandle = tr.sourcePort ?? defSrc;
        targetHandle = tr.targetPort ?? defDst;
      }

      const key = `${resolvedSource}->${tr.toStageKey}`;
      const parallelIndex = pairIndices.get(key) ?? 0;
      pairIndices.set(key, parallelIndex + 1);
      const parallelCount = pairCounts.get(key) ?? 1;
      const isSelected = selectedTransitionId === tr.id;
      const edgeColor = isSelected ? "var(--nx-accent, #c6ff00)" : isWildcard ? "var(--nx-ink-3, #71717a)" : "var(--nx-line-hi, #71717a)";

      resultEdges.push({
        id: tr.id, source: resolvedSource, target: tr.toStageKey,
        sourceHandle, targetHandle,
        type: "transitionEdge", selected: isSelected,
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: edgeColor },
        data: {
          transition: tr, isAr, isSelected, showLabels: showTransitionLabels, isGlobalWildcard: isWildcard,
          parallelIndex, parallelCount, stageBoxes,
          onSelectTransition: (id: string) => { onSelectTransition(id); onSelectStage(null); },
        },
      });

      if (showGlobalWires && isWildcard) {
        stages.filter((s) => s.stageKey !== tr.toStageKey).forEach((srcStage, fIdx) => {
          resultEdges.push({
            id: `${tr.id}__fanout__${srcStage.stageKey}`,
            source: srcStage.stageKey, target: tr.toStageKey,
            sourceHandle: (fIdx % 2 === 0 ? "bottom-3" : "top-3") as StagePortId,
            targetHandle: (fIdx % 2 === 0 ? "bottom-1" : "top-1") as StagePortId,
            type: "transitionEdge", selected: isSelected,
            markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "var(--nx-ink-3, #71717a)" },
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
  }, [transitions, directTransitions, showGlobalWires, firstStage, stages, selectedTransitionId, isAr, showTransitionLabels, onSelectTransition, onSelectStage]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => { setNodes(initialNodes); }, [initialNodes, setNodes]);
  useEffect(() => { setEdges(initialEdges); }, [initialEdges, setEdges]);

  const onNodeDragStop = useCallback((_: MouseEvent | TouchEvent, node: Node) => {
    if (node.id === "__start__" || node.id === "__global_all__") return;
    onNodeMove(node.id, Math.round(node.position.x), Math.round(node.position.y));
  }, [onNodeMove]);

  const onConnect: OnConnect = useCallback((params: Connection) => {
    if (params.source && params.target && params.source !== params.target) {
      onOpenAddTransition(params.source, params.target, (params.sourceHandle as StagePortId) ?? undefined, (params.targetHandle as StagePortId) ?? undefined);
    }
  }, [onOpenAddTransition]);

  const onReconnect: OnReconnect = useCallback((oldEdge, newConnection) => {
    const existing = transitions.find((t) => t.id === oldEdge.id);
    if (existing && newConnection.source && newConnection.target) {
      const fromOrd = stages.find((s) => s.stageKey === newConnection.source)?.order ?? 0;
      const toOrd = stages.find((s) => s.stageKey === newConnection.target)?.order ?? 0;
      const dir = newConnection.source === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward";
      const updated: CrmWorkflowTransition = {
        ...existing,
        fromStageKey: newConnection.source, fromStageKeys: [newConnection.source], toStageKey: newConnection.target,
        direction: dir, sourcePort: (newConnection.sourceHandle as StagePortId) ?? undefined, targetPort: (newConnection.targetHandle as StagePortId) ?? undefined,
      };
      onTransitionChange?.(updated);
    }
  }, [transitions, stages, onTransitionChange]);

  const handleExecuteAutoLayout = useCallback(async (algo: LayoutAlgorithm = "elk") => {
    onAutoLayout?.(algo);
    const positionMap = await calculateWorkflowAutoLayout(stages, transitions, algo, { isAr });
    if (onApplyLayoutPositions) {
      onApplyLayoutPositions(positionMap);
    } else {
      positionMap.forEach((pos, key) => onNodeMove(key, pos.x, pos.y));
    }
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
    onNodeDragStop, onConnect, onReconnect, showTransitionLabels, setShowTransitionLabels,
    showGlobalWires, setShowGlobalWires, showMiniMap, setShowMiniMap,
    isExportingPng, simModeOpen, setSimModeOpen, handleExecuteAutoLayout, handleExportPng,
  };
}
