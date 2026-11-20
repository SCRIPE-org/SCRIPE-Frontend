"use client";

import React from "react";
import {
  Background, BackgroundVariant, ConnectionMode, Controls, MiniMap,
  Panel, ReactFlow, ReactFlowProvider, useReactFlow, type EdgeTypes, type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useI18n } from "@core/providers/i18n-provider";
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
import type { LayoutAlgorithm } from "../../utils/crmFlowLayoutEngine";
import { CrmWorkflowCanvasToolbar } from "./CrmWorkflowCanvasToolbar";
import { useCrmWorkflowCanvasGraph } from "../../viewmodels/useCrmWorkflowCanvasGraph";

/** Visual stage node model rendered and positioned inside the 2D Workflow Studio canvas. */
export interface CrmWorkflowStageNode {
  stageKey: string; labelEn: string; labelAr: string; probability: number; slaDays: number; order: number;
  category?: CrmWorkflowStageCategory; color?: CrmStageColorToken; customColorHex?: string;
  properties?: Record<string, string>; allowInboundFromAny?: boolean;
  isTerminalWon: boolean; isTerminalLost: boolean; convertsToDeal?: boolean; requiredExitFields: string[];
  x: number; y: number;
}

/** Visual transition edge model connecting workflow stages with rules, ports, and triggers. */
export interface CrmWorkflowTransition {
  id: string; nameEn: string; nameAr: string; fromStageKey: string; fromStageKeys?: string[]; toStageKey: string;
  direction?: "forward" | "backward" | "global"; requiredFields: string[];
  sourcePort?: StagePortId; targetPort?: StagePortId;
  requireReason?: boolean; requireNote?: boolean; promptFields?: string[]; allowRollback?: boolean;
  blockIfLinkedDealProgressed?: boolean; requireVerifiedParty?: boolean;
  requireEstimatedAmountPositive?: boolean; triggerDealConversion?: boolean;
  autoCreateWorkTask?: boolean; restrictToRoles?: string[];
  triggerWebhook?: string; domainEventKey?: string; triggers?: string[];
  properties?: Record<string, string>; catalogRules?: CrmWorkflowCatalogRule[];
}

/** Props for `CrmWorkflowCanvas2D`. */
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

const TOKEN_COLOR_CSS_MAP: Record<CrmStageColorToken, string> = {
  slate: "var(--nx-ink-3)",
  zinc: "color-mix(in srgb, var(--nx-ink-3) 80%, var(--nx-line-hi))",
  blue: "hsl(var(--chart-1))",
  sky: "var(--nx-info)",
  cyan: "color-mix(in srgb, var(--nx-info) 65%, hsl(var(--chart-2)))",
  teal: "hsl(var(--chart-2))",
  emerald: "var(--nx-success)",
  green: "hsl(var(--chart-6))",
  lime: "var(--nx-accent)",
  amber: "var(--nx-warning)",
  orange: "hsl(var(--chart-3))",
  coral: "color-mix(in srgb, hsl(var(--chart-3)) 55%, var(--nx-danger))",
  rose: "var(--nx-danger)",
  crimson: "color-mix(in srgb, var(--nx-danger) 75%, var(--nx-ink))",
  pink: "hsl(var(--chart-7))",
  fuchsia: "color-mix(in srgb, hsl(var(--chart-7)) 65%, hsl(var(--chart-4)))",
  purple: "hsl(var(--chart-4))",
  violet: "color-mix(in srgb, hsl(var(--chart-4)) 70%, hsl(var(--chart-1)))",
  indigo: "color-mix(in srgb, hsl(var(--chart-1)) 55%, hsl(var(--chart-4)))",
};

function ManagedReactFlowCanvas(props: CrmWorkflowCanvas2DProps) {
  const {
    stages, transitions, selectedStageKey, zoom, onZoomChange, onSelectTransition, onSelectStage,
    onValidateRules, canUndo, canRedo, onUndo, onRedo,
  } = props;
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const { zoomIn, zoomOut, fitView } = useReactFlow();
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
        onResetZoom={() => { fitView({ padding: 0.16, duration: 200 }); onZoomChange(80); }}
        canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo}
      />
      <div className="flex-1 w-full h-full relative" data-testid="crm-2d-graph-surface" onPointerUp={graph.clearIdleWireDraft}>
        <ReactFlow
          nodes={graph.nodes} edges={graph.edges} onNodesChange={graph.onNodesChange} onEdgesChange={graph.onEdgesChange}
          onNodeDragStop={graph.onNodeDragStop} onConnectStart={graph.onConnectStart} onConnect={graph.onConnect} onConnectEnd={graph.onConnectEnd} onReconnect={graph.onReconnect}
          nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView minZoom={0.2} maxZoom={2.5}
          fitViewOptions={{ padding: 0.16, maxZoom: 0.95 }} connectionMode={ConnectionMode.Loose}
          proOptions={{ hideAttribution: true }} className="bg-nx-ground"
        >
          <Controls showInteractive={false} className="!bg-nx-surface !border !border-nx-line !shadow-none !rounded-md overflow-hidden" />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="var(--nx-line)" className="opacity-70" />
          {graph.showMiniMap && (
            <Panel position="bottom-right" className="m-3">
              <div data-testid="workflow-minimap" className="relative">
                <MiniMap
                  style={{ width: 148, height: 92 }} nodeStrokeColor="var(--nx-line-hi)"
                  nodeColor={(n) => {
                    const st = stages.find((s) => s.stageKey === n.id);
                    if (!st) return "color-mix(in srgb, var(--nx-ink-3) 50%, transparent)";
                    if (st.customColorHex) {
                      const custom = buildCustomHexHarmonicStyles(st.customColorHex);
                      if (custom.isValidHex && custom.minimapStroke) return custom.minimapStroke;
                    }
                    const token = resolveDefaultStageColor(st.stageKey, st.category, st.order, st.color || st.properties?.color);
                    if (token && TOKEN_COLOR_CSS_MAP[token]) return TOKEN_COLOR_CSS_MAP[token];
                    if (st.category === "done" || st.isTerminalWon) return "var(--nx-success)";
                    if (st.category === "lost" || st.isTerminalLost) return "var(--nx-danger)";
                    if (st.category === "in_progress") return "var(--nx-info)";
                    return "color-mix(in srgb, var(--nx-ink-3) 50%, transparent)";
                  }}
                  nodeBorderRadius={3} maskColor="color-mix(in srgb, var(--nx-ink-3) 18%, transparent)"
                  className="!bg-nx-surface !border !border-nx-line !rounded-md overflow-hidden"
                />
              </div>
            </Panel>
          )}
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
