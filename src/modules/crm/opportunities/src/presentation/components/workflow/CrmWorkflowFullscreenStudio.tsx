"use client";

import React from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, CheckCircle2, GitBranch, Layers, RotateCcw, Save, Table2, Workflow, X } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmCustomFieldDefinition, CrmWorkflowDefinition, CrmWorkflowEntityType } from "@modules/crm";
import type { StudioViewMode } from "../../viewmodels/usePipelineStudioViewModel";
import { CrmWorkflowCanvas2D, CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { CrmWorkflowInspectorPanel } from "./CrmWorkflowInspectorPanel";

export interface CrmWorkflowFullscreenStudioProps {
  t: (k: string) => string; isAr: boolean;
  workflows: CrmWorkflowDefinition[]; selectedWorkflow: CrmWorkflowDefinition | undefined; selectedWorkflowId: string;
  activeEntity: CrmWorkflowEntityType; viewMode: StudioViewMode; setViewMode: (mode: StudioViewMode) => void;
  zoom: number; setZoom: (zoom: number) => void; activeStages: CrmWorkflowStageNode[]; transitions: CrmWorkflowTransition[];
  selectedStage: CrmWorkflowStageNode | null; selectedTransition: CrmWorkflowTransition | null;
  selectedStageKey: string | null; selectedTransitionId: string | null;
  setSelectedStageKey: (key: string | null) => void; setSelectedTransitionId: (id: string | null) => void;
  hasChanges: boolean; validationBanner: string | null; setValidationBanner: (msg: string | null) => void;
  crmCustomFields: CrmCustomFieldDefinition[]; openRuleCatalogSignal?: number;
  onSelectWorkflow: (workflowId: string) => void; onSwitchEntity: (entity: CrmWorkflowEntityType) => void;
  onBackToList: () => void; onResetDraft: () => void; onSave: () => void; onValidateRules: () => void;
  onOpenAddStage: () => void; onOpenAddTransition: (fromStageKey?: string, toStageKey?: string) => void;
  onOpenRuleForStage: (stageKey: string) => void; onNodeMove: (stageKey: string, x: number, y: number) => void;
  onStageChange: (updated: CrmWorkflowStageNode) => void; onMoveOrder: (stageKey: string, direction: "up" | "down") => void;
  onRemoveStage: (stageKey: string) => void; onReplaceStage?: (stageKeyToRemove: string, replacementStageKey: string) => void;
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void; onCreateTransition: (fromStageKey: string) => void;
  onAddCrmCustomField: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => void;
}

/** Standalone Full-Viewport 2D Workflow Studio rendered via React Portal above app chrome. */
export function CrmWorkflowFullscreenStudio(props: CrmWorkflowFullscreenStudioProps) {
  const {
    t, isAr, workflows, selectedWorkflow, selectedWorkflowId, activeEntity, viewMode, setViewMode,
    zoom, setZoom, activeStages, transitions, selectedStage, selectedTransition, selectedStageKey,
    selectedTransitionId, setSelectedStageKey, setSelectedTransitionId, hasChanges, validationBanner,
    setValidationBanner, crmCustomFields, openRuleCatalogSignal, onSelectWorkflow, onSwitchEntity, onBackToList, onResetDraft,
    onSave, onValidateRules, onOpenAddStage, onOpenAddTransition, onOpenRuleForStage, onNodeMove,
    onStageChange, onMoveOrder, onRemoveStage, onReplaceStage, onTransitionChange, onDeleteTransition, onCreateTransition,
    onAddCrmCustomField,
  } = props;

  const studioElement = (
    <div
      className="fixed inset-0 z-[900] bg-nx-ground flex flex-col w-screen h-screen overflow-hidden"
      data-testid="crm-workflow-fullscreen-studio"
    >
      <header className="h-14 px-3 border-b border-nx-line bg-nx-surface flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button size="sm" variant="outline" onClick={onBackToList} data-testid="studio-back-to-list-btn" className="h-8 px-2.5 text-xs shrink-0">
            <ArrowLeft className="w-3.5 h-3.5 me-1.5" />
            {t("crmOpportunities.pipelinesPage.backToWorkflowsListBtn")}
          </Button>

          <div className="inline-flex items-center rounded-md border border-nx-line bg-nx-raised p-0.5 gap-0.5 shrink-0">
            <Button
              size="sm" variant="ghost" onClick={() => onSwitchEntity("deal")} data-testid="workflow-switch-deals"
              className={`h-7 px-2 text-xs ${activeEntity === "deal" ? "bg-nx-surface text-nx-ink border border-nx-line-hi font-semibold" : "text-nx-ink-2"}`}
            >
              {t("crmOpportunities.pipelinesPage.dealsPipelineSwitch")}
            </Button>
            <Button
              size="sm" variant="ghost" onClick={() => onSwitchEntity("lead")} data-testid="workflow-switch-leads"
              className={`h-7 px-2 text-xs ${activeEntity === "lead" ? "bg-nx-surface text-nx-ink border border-nx-line-hi font-semibold" : "text-nx-ink-2"}`}
            >
              {t("crmOpportunities.pipelinesPage.leadsPipelineSwitch")}
            </Button>
          </div>

          <Select value={selectedWorkflowId} onValueChange={onSelectWorkflow}>
            <SelectTrigger className="h-8 w-44 2xl:w-56 text-xs bg-nx-raised border-nx-line" data-testid="studio-workflow-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workflows.map((wf) => (
                <SelectItem key={wf.id} value={wf.id} className="text-xs">{isAr ? wf.nameAr : wf.nameEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedWorkflow?.isActive && (
            <Badge variant="success" className="text-[10px] hidden 2xl:inline-flex shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 me-1" />
              {t("crmOpportunities.pipelinesPage.activeInKanbanBadge")}
            </Badge>
          )}
        </div>

        <div className="inline-flex items-center rounded-md border border-nx-line bg-nx-raised p-0.5 gap-0.5 shrink-0">
          {([
            { id: "diagram", icon: Workflow, labelKey: "crmOpportunities.pipelinesPage.viewModeDiagram" },
            { id: "classic", icon: Layers, labelKey: "crmOpportunities.pipelinesPage.viewModeClassic" },
            { id: "text", icon: Table2, labelKey: "crmOpportunities.pipelinesPage.viewModeText" },
          ] as const).map((m) => {
            const Icon = m.icon;
            const isActive = viewMode === m.id;
            return (
              <Button
                key={m.id} size="sm" variant="ghost" onClick={() => setViewMode(m.id)} data-testid={`workflow-mode-${m.id}`}
                className={`h-7 px-2 text-xs ${isActive ? "bg-nx-surface text-nx-ink border border-nx-line-hi font-semibold" : "text-nx-ink-2"}`}
              >
                <Icon className="w-3.5 h-3.5 me-1.5" />
                {t(m.labelKey)}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { onResetDraft(); onBackToList(); }} data-testid="studio-discard-close-btn">
            <RotateCcw className="w-3.5 h-3.5 me-1.5" />
            {t("crmOpportunities.pipelinesPage.discardCloseBtn")}
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={onSave} disabled={!hasChanges} data-testid="save-pipeline-config-btn">
            <Save className="w-3.5 h-3.5 me-1.5" />
            {t("crmOpportunities.pipelinesPage.updateWorkflowBtn")}
          </Button>
        </div>
      </header>

      {validationBanner && (
        <div className="px-4 py-2 bg-nx-raised border-b border-nx-line flex items-center justify-between text-xs text-nx-ink">
          <span className="inline-flex items-center gap-2 font-medium">
            <GitBranch className="w-3.5 h-3.5 text-success" />
            {validationBanner}
          </span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setValidationBanner(null)}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <CrmWorkflowCanvas2D
          stages={activeStages} transitions={transitions} selectedStageKey={selectedStageKey}
          selectedTransitionId={selectedTransitionId} viewMode={viewMode} zoom={zoom}
          crmCustomFields={crmCustomFields} onZoomChange={setZoom} onSelectStage={setSelectedStageKey}
          onSelectTransition={setSelectedTransitionId} onNodeMove={onNodeMove} onOpenAddStage={onOpenAddStage}
          onOpenAddTransition={onOpenAddTransition} onOpenRuleForStage={onOpenRuleForStage} onValidateRules={onValidateRules}
        />
        <CrmWorkflowInspectorPanel
          activeEntity={activeEntity} stages={activeStages} transitions={transitions}
          selectedStage={selectedStage} selectedTransition={selectedTransition} crmCustomFields={crmCustomFields}
          openRuleCatalogSignal={openRuleCatalogSignal}
          onStageChange={onStageChange} onMoveOrder={onMoveOrder} onRemoveStage={onRemoveStage} onReplaceStage={onReplaceStage}
          onTransitionChange={onTransitionChange} onDeleteTransition={onDeleteTransition}
          onSelectTransition={setSelectedTransitionId} onCreateTransition={(from) => onOpenAddTransition(from)}
          onAddCrmCustomField={onAddCrmCustomField}
        />
      </div>
    </div>
  );

  return typeof document !== "undefined" && document.body ? createPortal(studioElement, document.body) : studioElement;
}
