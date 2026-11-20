"use client";

import React from "react";
import {
  CheckCircle2, Columns3, Download, Eye, EyeOff, GitFork, LayoutGrid,
  Map as MapIcon, Play, Plus, Redo2, RotateCcw, Rows3, ShieldCheck,
  Undo2, Zap, ZoomIn, ZoomOut,
} from "lucide-react";
import { Button } from "@core/ui/button";
import type { LayoutAlgorithm } from "../../utils/crmFlowLayoutEngine";

/** Props for `CrmWorkflowCanvasToolbar`. */
export interface CrmWorkflowCanvasToolbarProps {
  t: (k: string) => string;
  isAr: boolean;
  selectedStageKey: string | null;
  firstStageKey?: string;
  onOpenAddStage: () => void;
  onOpenAddTransition: () => void;
  onOpenRuleForStage: (stageKey: string) => void;
  onExecuteAutoLayout: (algo: LayoutAlgorithm) => void;
  showGlobalWires: boolean;
  onToggleGlobalWires: () => void;
  showTransitionLabels: boolean;
  onToggleTransitionLabels: () => void;
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
  onExportPng: () => void;
  isExportingPng: boolean;
  simModeOpen: boolean;
  onToggleSimMode: () => void;
  onValidateRules?: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

/** Top Action Toolbar for 2D Workflow Studio Canvas (<195 lines, single-row h-12). */
export function CrmWorkflowCanvasToolbar({
  t, isAr, selectedStageKey, firstStageKey, onOpenAddStage, onOpenAddTransition,
  onOpenRuleForStage, onExecuteAutoLayout, showGlobalWires, onToggleGlobalWires,
  showTransitionLabels, onToggleTransitionLabels, showMiniMap, onToggleMiniMap,
  onExportPng, isExportingPng, simModeOpen, onToggleSimMode, onValidateRules,
  zoom, onZoomIn, onZoomOut, onResetZoom, canUndo, canRedo, onUndo, onRedo,
}: CrmWorkflowCanvasToolbarProps) {
  return (
    <div
      data-testid="crm-workflow-canvas-toolbar"
      className="h-12 flex items-center justify-between px-2 border-b border-nx-line bg-nx-surface z-20 overflow-x-auto no-scrollbar gap-1 select-none shrink-0"
    >
      <div className="flex items-center gap-1 shrink-0">
        {/* Creation Tools */}
        <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10.5px]" onClick={onOpenAddStage} data-testid="crm-toolbar-add-status" title={t("crmWorkflows.pipelinesPage.addStatusBtn")}>
          <Plus className="w-3 h-3 me-0.5 text-success shrink-0" />
          <span>{t("crmWorkflows.pipelinesPage.addStatusBtn").replace(/^\+\s*/, "")}</span>
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10.5px]" onClick={onOpenAddTransition} data-testid="crm-toolbar-add-transition" title={t("crmWorkflows.pipelinesPage.addTransitionBtn")}>
          <Zap className="w-3 h-3 me-0.5 text-nx-warning-strong shrink-0" />
          <span>{t("crmWorkflows.pipelinesPage.addTransitionBtn").replace(/^\+\s*/, "")}</span>
        </Button>
        <Button
          size="sm" variant="outline" className="h-7 px-1.5 text-[10.5px]" data-testid="crm-toolbar-add-rule"
          title={t("crmWorkflows.pipelinesPage.addRuleBtn")}
          onClick={() => { const target = selectedStageKey ?? firstStageKey; if (target) onOpenRuleForStage(target); }}
        >
          <ShieldCheck className="w-3 h-3 me-0.5 text-info shrink-0" />
          <span>{t("crmWorkflows.pipelinesPage.addRuleBtn").replace(/^\+\s*/, "")}</span>
        </Button>

        <div className="h-5 w-px bg-nx-line shrink-0 mx-0" />

        {/* Auto-Layout Engines */}
        <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10.5px]" onClick={() => onExecuteAutoLayout("elk")} data-testid="canvas-tidy-auto-layout-btn" title={t("crmWorkflows.workflowStudio.elkLayeredLayout")}>
          <LayoutGrid className="w-3 h-3 text-primary shrink-0" />
          <span className="hidden 2xl:inline ms-1">{t("crmWorkflows.workflowStudio.compactTidy")}</span>
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10.5px]" onClick={() => onExecuteAutoLayout("dagre_lr")} data-testid="canvas-dagre-lr-layout-btn" title={t("crmWorkflows.workflowStudio.dagreHorizontalLayout")}>
          <Columns3 className="w-3 h-3 text-info shrink-0" />
          <span className="hidden 2xl:inline ms-1">{t("crmWorkflows.workflowStudio.compactDagreLr")}</span>
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10.5px]" onClick={() => onExecuteAutoLayout("dagre_tb")} data-testid="canvas-dagre-tb-layout-btn" title={t("crmWorkflows.workflowStudio.dagreVerticalLayout")}>
          <Rows3 className="w-3 h-3 text-info shrink-0" />
          <span className="hidden 2xl:inline ms-1">{t("crmWorkflows.workflowStudio.compactDagreTb")}</span>
        </Button>

        <div className="h-5 w-px bg-nx-line shrink-0 mx-0" />

        {/* View Toggles */}
        <Button
          size="sm" variant={showGlobalWires ? "secondary" : "outline"} className="h-7 px-1.5 text-[10.5px]"
          onClick={onToggleGlobalWires} data-testid="canvas-toggle-global-wires-btn"
          title={showGlobalWires ? t("crmWorkflows.workflowStudio.hideGlobalWires") : t("crmWorkflows.workflowStudio.showGlobalWires")}
        >
          <GitFork className="w-3 h-3 me-0.5 text-nx-accent shrink-0" />
          <span>{t("crmWorkflows.workflowStudio.compactGlobalWires")}</span>
        </Button>

        <Button size="sm" variant={showTransitionLabels ? "secondary" : "outline"} className="h-7 px-1.5 text-[10.5px]" onClick={onToggleTransitionLabels} data-testid="canvas-toggle-transition-labels" title={t("crmWorkflows.pipelinesPage.showTransitionLabelsCheck")}>
          {showTransitionLabels ? <Eye className="w-3 h-3 me-0.5 text-primary shrink-0" /> : <EyeOff className="w-3 h-3 me-0.5 text-nx-ink-3 shrink-0" />}
          <span>{t("crmWorkflows.workflowStudio.compactLabels")}</span>
        </Button>

        <Button size="sm" variant={showMiniMap ? "secondary" : "outline"} className="h-7 px-1.5 text-[10.5px]" onClick={onToggleMiniMap} data-testid="canvas-toggle-minimap-btn" title={t("crmWorkflows.workflowStudio.toggleMiniMap")}>
          <MapIcon className="w-3 h-3 text-info shrink-0" />
          <span className="hidden 2xl:inline ms-1">{t("crmWorkflows.workflowStudio.compactMiniMap")}</span>
        </Button>

        <Button size="sm" variant={simModeOpen ? "secondary" : "outline"} className="h-7 px-1.5 text-[10.5px]" onClick={onToggleSimMode} data-testid="canvas-simulate-workflow-btn" title={t("crmWorkflows.workflowSandbox.simulateBtn")}>
          <Play className="w-3 h-3 me-0.5 text-success shrink-0" />
          <span>{t("crmWorkflows.workflowStudio.compactSimulate")}</span>
        </Button>

        <div className="h-5 w-px bg-nx-line shrink-0 mx-0" />

        {/* Export & Validation */}
        <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10.5px]" onClick={onExportPng} disabled={isExportingPng} data-testid="canvas-export-png-btn" title={t("crmWorkflows.workflowStudio.exportPng")}>
          <Download className="w-3 h-3 text-info shrink-0" />
          <span className="hidden 2xl:inline ms-1">{isExportingPng ? t("crmWorkflows.workflowStudio.exportingPng") : t("crmWorkflows.workflowStudio.compactExportPng")}</span>
        </Button>

        {onValidateRules && (
          <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10.5px]" onClick={onValidateRules} data-testid="canvas-validate-rules" title={t("crmWorkflows.pipelinesPage.validateWorkflowRulesBtn")}>
            <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
            <span className="hidden 2xl:inline ms-1">{t("crmWorkflows.workflowStudio.compactValidate")}</span>
          </Button>
        )}
      </div>

      {/* Undo/Redo & Zoom Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon" variant="outline" className="h-7 w-7 p-0 shrink-0" onClick={onUndo}
          disabled={!canUndo} data-testid="canvas-undo-btn" title={t("crmWorkflows.workflowStudio.undo")}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon" variant="outline" className="h-7 w-7 p-0 shrink-0" onClick={onRedo}
          disabled={!canRedo} data-testid="canvas-redo-btn" title={t("crmWorkflows.workflowStudio.redo")}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </Button>
        <div className="h-5 w-px bg-nx-line shrink-0 mx-0" />
        <Button size="icon" variant="outline" className="h-7 w-7 p-0 shrink-0" onClick={onZoomOut} data-testid="canvas-zoom-out-btn" title={t("crmWorkflows.workflowStudio.zoomOut")}>
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <span className="text-[10.5px] font-mono px-0.5 min-w-[28px] text-center text-nx-ink-2" data-testid="canvas-zoom-indicator">
          {zoom}%
        </span>
        <Button size="icon" variant="outline" className="h-7 w-7 p-0 shrink-0" onClick={onZoomIn} data-testid="canvas-zoom-in-btn" title={t("crmWorkflows.workflowStudio.zoomIn")}>
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={onResetZoom} data-testid="canvas-reset-zoom-btn" title={t("crmWorkflows.workflowStudio.resetZoom")}>
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
