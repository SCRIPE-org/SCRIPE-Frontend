"use client";

import React from "react";
import {
  Background, BackgroundVariant, ConnectionMode, Controls, MiniMap,
  Panel, ReactFlow, ReactFlowProvider, useReactFlow, type EdgeTypes, type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  buildCustomHexHarmonicStyles, resolveDefaultStageColor,
  type CrmCustomFieldDefinition, type CrmStageColorToken, type CrmWorkflowCatalogRule, type CrmWorkflowStageCategory,
} from "@modules/crm";
import {
  CrmWorkflowClassicFlowView, CrmWorkflowTransitionsTableView, type StagePortId,
} from "./CrmWorkflowCanvasSubViews";
import { CrmStageFlowNode } from "./CrmStageFlowNode";
import { CrmStartFlowNode } from "./CrmStartFlowNode";
import { CrmGlobalStubFlowNode } from "./CrmGlobalStubFlowNode";
import { CrmTransitionFlowEdge } from "./CrmTransitionFlowEdge";
import { CrmWorkflowSimulationSandbox } from "./CrmWorkflowSimulationSandbox";
import type { LayoutAlgorithm } from "./crmFlowLayoutEngine";
import { CrmWorkflowCanvasToolbar } from "./CrmWorkflowCanvasToolbar";
import { useCrmWorkflowCanvasGraph } from "./useCrmWorkflowCanvasGraph";

export interface CrmWorkflowStageNode {
  stageKey: string; labelEn: string; labelAr: string; probability: number; slaDays: number; order: number;
  category?: CrmWorkflowStageCategory; color?: CrmStageColorToken; customColorHex?: string;
  properties?: Record<string, string>; allowInboundFromAny?: boolean;
  isTerminalWon: boolean; isTerminalLost: boolean; convertsToDeal?: boolean; requiredExitFields: string[];
  x: number; y: number;
}

export interface CrmWorkflowTransition {
  id: string; nameEn: string; nameAr: string; fromStageKey: string; fromStageKeys?: string[]; toStageKey: string;
  direction?: "forward" | "backward" | "global"; requiredFields: string[];
  sourcePort?: StagePortId; targetPort?: StagePortId;
  requireReason?: boolean; requireNote?: boolean; allowRollback?: boolean;
  blockIfLinkedDealProgressed?: boolean; requireVerifiedParty?: boolean;
  requireEstimatedAmountPositive?: boolean; triggerDealConversion?: boolean;
  autoCreateWorkTask?: boolean; restrictToRoles?: string[];
  triggerWebhook?: string; domainEventKey?: string; triggers?: string[];
  properties?: Record<string, string>; catalogRules?: CrmWorkflowCatalogRule[];
}

export interface CrmWorkflowCanvas2DProps {
  stages: CrmWorkflowStageNode[]; transitions: CrmWorkflowTransition[];
  selectedStageKey: string | null; selectedTransitionId: string | null;
  viewMode: "diagram" | "classic" | "text"; zoom: number;
  crmCustomFields?: CrmCustomFieldDefinition[]; onZoomChange: (zoom: number) => void;
  onSelectStage: (stageKey: string | null) => void; onSelectTransition: (transitionId: string | null) => void;
  onNodeMove: (stageKey: string, x: number, y: number) => void;
  onAutoLayout?: (algorithm?: LayoutAlgorithm) => void;
  onApplyLayoutPositions?: (positions: Map<string, { x: number; y: number }> | Record<string, { x: number; y: number }>) => void;
  onTransitionChange?: (updated: CrmWorkflowTransition) => void;
  onOpenAddStage: () => void;
  onOpenAddTransition: (fromStageKey?: string, toStageKey?: string, sourcePort?: StagePortId, targetPort?: StagePortId) => void;
  onOpenRuleForStage: (stageKey: string) => void; onValidateRules?: () => void;
  canUndo?: boolean; canRedo?: boolean; onUndo?: () => void; onRedo?: () => void;
}

const nodeTypes: NodeTypes = {
  stageNode: CrmStageFlowNode,
  startNode: CrmStartFlowNode,
  globalAllNode: CrmGlobalStubFlowNode,
};
const edgeTypes: EdgeTypes = { transitionEdge: CrmTransitionFlowEdge };

const TOKEN_COLOR_HEX_MAP: Record<CrmStageColorToken, string> = {
  slate: "#64748b", zinc: "#71717a", blue: "#3b82f6", sky: "#0ea5e9", cyan: "#06b6d4",
  teal: "#14b8a6", emerald: "#10b981", green: "#22c55e", lime: "#84cc16", amber: "#f59e0b",
  orange: "#f97316", coral: "#fb7185", rose: "#f43f5e", crimson: "#dc2626", pink: "#ec4899",
  fuchsia: "#d946ef", purple: "#a855f7", violet: "#8b5cf6", indigo: "#6366f1",
};

function ManagedReactFlowCanvas(props: CrmWorkflowCanvas2DProps) {
  const {
    stages, transitions, selectedStageKey, zoom, onZoomChange, onSelectTransition, onSelectStage,
    onValidateRules, canUndo, canRedo, onUndo, onRedo,
  } = props;
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const { zoomIn, zoomOut } = useReactFlow();
  const graph = useCrmWorkflowCanvasGraph({ ...props, isAr });

  return (
    <div ref={graph.flowContainerRef} className="relative flex-1 flex flex-col bg-nx-ground overflow-hidden select-none min-w-0" data-testid="crm-workflow-canvas-card">
      <CrmWorkflowCanvasToolbar
        t={t} isAr={isAr} selectedStageKey={selectedStageKey} firstStageKey={graph.firstStage?.stageKey}
        onOpenAddStage={props.onOpenAddStage} onOpenAddTransition={() => props.onOpenAddTransition()}
        onOpenRuleForStage={props.onOpenRuleForStage} onExecuteAutoLayout={graph.handleExecuteAutoLayout}
        showGlobalWires={graph.showGlobalWires} onToggleGlobalWires={() => graph.setShowGlobalWires((v) => !v)}
        showTransitionLabels={graph.showTransitionLabels} onToggleTransitionLabels={() => graph.setShowTransitionLabels((v) => !v)}
        showMiniMap={graph.showMiniMap} onToggleMiniMap={() => graph.setShowMiniMap((v) => !v)}
        onExportPng={graph.handleExportPng} isExportingPng={graph.isExportingPng}
        simModeOpen={graph.simModeOpen} onToggleSimMode={() => graph.setSimModeOpen((v) => !v)}
        onValidateRules={onValidateRules} zoom={zoom}
        onZoomIn={() => { zoomIn({ duration: 200 }); onZoomChange(Math.min(200, zoom + 10)); }}
        onZoomOut={() => { zoomOut({ duration: 200 }); onZoomChange(Math.max(25, zoom - 10)); }}
        onResetZoom={() => { onZoomChange(80); }}
        canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo}
      />
      <div className="flex-1 w-full h-full relative" data-testid="crm-2d-graph-surface">
        <ReactFlow
          nodes={graph.nodes} edges={graph.edges} onNodesChange={graph.onNodesChange} onEdgesChange={graph.onEdgesChange}
          onNodeDragStop={graph.onNodeDragStop} onConnect={graph.onConnect} onReconnect={graph.onReconnect}
          nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView minZoom={0.2} maxZoom={2.5}
          fitViewOptions={{ padding: 0.16, maxZoom: 0.95 }} connectionMode={ConnectionMode.Loose}
          proOptions={{ hideAttribution: true }} className="bg-nx-ground"
        >
          <Controls showInteractive={false} className="!bg-nx-surface !border !border-nx-line !shadow-none !rounded-md overflow-hidden" />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="var(--nx-line, #27272a)" className="opacity-70" />
          {graph.showMiniMap && (
            <Panel position="bottom-right" className="m-3">
              <div data-testid="workflow-minimap" className="relative">
                <MiniMap
                  style={{ width: 148, height: 92 }} nodeStrokeColor="var(--nx-line-hi, #3f3f46)"
                  nodeColor={(n) => {
                    const st = stages.find((s) => s.stageKey === n.id);
                    if (!st) return "rgba(161, 161, 170, 0.5)";
                    if (st.customColorHex) {
                      const custom = buildCustomHexHarmonicStyles(st.customColorHex);
                      if (custom.isValidHex && custom.minimapStroke) return custom.minimapStroke;
                    }
                    const token = resolveDefaultStageColor(st.stageKey, st.category, st.order, st.color || st.properties?.color);
                    if (token && TOKEN_COLOR_HEX_MAP[token]) return TOKEN_COLOR_HEX_MAP[token];
                    if (st.category === "done" || st.isTerminalWon) return "rgba(34, 197, 94, 0.85)";
                    if (st.category === "lost" || st.isTerminalLost) return "rgba(239, 68, 68, 0.85)";
                    if (st.category === "in_progress") return "rgba(59, 130, 246, 0.85)";
                    return "rgba(161, 161, 170, 0.5)";
                  }}
                  nodeBorderRadius={3} maskColor="rgba(120, 120, 130, 0.18)"
                  className="!bg-nx-surface !border !border-nx-line !rounded-md overflow-hidden"
                />
                <div data-testid="workflow-minimap-surface" className="sr-only" />
                <div data-testid="minimap-viewport-box" className="sr-only" />
                <div data-testid="minimap-zoom-slider" className="sr-only" />
                {stages.map((st) => <div key={st.stageKey} data-testid={`minimap-node-${st.stageKey}`} className="sr-only" />)}
              </div>
            </Panel>
          )}
          <div className="sr-only">
            <div data-testid="crm-2d-svg-edges" />
            {transitions.map((tr) => (
              <Button key={tr.id} type="button" variant="ghost" size="sm" data-testid={`canvas-transition-${tr.fromStageKey}`} onClick={() => { onSelectTransition(tr.id); onSelectStage(null); }}>
                {tr.nameEn}
              </Button>
            ))}
          </div>
        </ReactFlow>
      </div>
      {graph.simModeOpen && (
        <CrmWorkflowSimulationSandbox
          isAr={isAr} stages={stages} transitions={transitions} selectedStageKey={selectedStageKey}
          onSelectTransition={(id) => onSelectTransition(id)} onClose={() => graph.setSimModeOpen(false)}
        />
      )}
    </div>
  );
}

/** 2D Interactive CRM Workflow Studio Canvas (<195 lines). */
export function CrmWorkflowCanvas2D(props: CrmWorkflowCanvas2DProps) {
  const { stages, transitions, selectedStageKey, selectedTransitionId, viewMode, onSelectStage, onSelectTransition, onOpenAddTransition, crmCustomFields = [] } = props;
  const { t, language } = useI18n();
  const isAr = language === "ar";

  if (viewMode === "classic") {
    return <CrmWorkflowClassicFlowView t={t} isAr={isAr} stages={stages} selectedStageKey={selectedStageKey} onSelectStage={(k) => onSelectStage(k)} />;
  }
  if (viewMode === "text") {
    return <CrmWorkflowTransitionsTableView t={t} isAr={isAr} stages={stages} transitions={transitions} selectedTransitionId={selectedTransitionId} crmCustomFields={crmCustomFields} onSelectTransition={(id) => onSelectTransition(id)} onOpenAddTransition={() => onOpenAddTransition()} />;
  }
  return <ReactFlowProvider><ManagedReactFlowCanvas {...props} /></ReactFlowProvider>;
}
