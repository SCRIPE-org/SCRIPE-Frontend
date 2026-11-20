"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Download, GitBranch, HelpCircle, History, Layers, RotateCcw, Save, Table2, Upload, Workflow, X } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { CrmSmartGuideModal, type CrmCustomFieldDefinition, type CrmWorkflowDefinition, type CrmWorkflowEntityType } from "@modules/crm";
import type { StudioViewMode } from "../../viewmodels/usePipelineStudioViewModel";
import { CrmWorkflowCanvas2D, CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import type { StagePortId } from "./CrmWorkflowCanvasSubViews";
import { CrmWorkflowInspectorPanel } from "./CrmWorkflowInspectorPanel";

const importedWorkflowSchema = z.object({
  stages: z.array(z.object({ stageKey: z.string().min(1), labelEn: z.string().min(1) }).passthrough()).min(2),
  transitions: z.array(z.object({ id: z.string().min(1), fromStageKey: z.string().min(1), toStageKey: z.string().min(1) }).passthrough()).default([]),
});

/** Props for `CrmWorkflowFullscreenStudio`. */
export interface CrmWorkflowFullscreenStudioProps {
  t: (k: string) => string; isAr: boolean; canManagePipelines?: boolean;
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
  onImportWorkflowJson?: (stages: CrmWorkflowStageNode[], transitions: CrmWorkflowTransition[]) => void;
  onOpenAddStage: () => void;
  onOpenAddTransition: (fromStageKey?: string, toStageKey?: string, sourcePort?: StagePortId, targetPort?: StagePortId) => void;
  onOpenRuleForStage: (stageKey: string) => void; onNodeMove: (stageKey: string, x: number, y: number) => void;
  onStageChange: (updated: CrmWorkflowStageNode) => void;
  onToggleAllowAnyTransition?: (stageKey: string, allowed: boolean) => void;
  onMoveOrder: (stageKey: string, direction: "up" | "down") => void;
  onRemoveStage: (stageKey: string) => void; onReplaceStage?: (stageKeyToRemove: string, replacementStageKey: string) => void;
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
  onCreateTransition: (fromStageKey?: string, toStageKey?: string) => void;
  onAddCrmCustomField: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => void;
  onApplyLayoutPositions?: (positions: Map<string, { x: number; y: number }> | Record<string, { x: number; y: number }>) => void;
  canUndo?: boolean; canRedo?: boolean; onUndo?: () => void; onRedo?: () => void;
}

/** Standalone Full-Viewport 2D Workflow Studio rendered via React Portal above app chrome (<195 lines). */
export function CrmWorkflowFullscreenStudio(props: CrmWorkflowFullscreenStudioProps) {
  const {
    t, isAr, canManagePipelines = true, workflows, selectedWorkflow, selectedWorkflowId, activeEntity, viewMode, setViewMode,
    zoom, setZoom, activeStages, transitions, selectedStage, selectedTransition, selectedStageKey,
    selectedTransitionId, setSelectedStageKey, setSelectedTransitionId, hasChanges, validationBanner,
    setValidationBanner, crmCustomFields, openRuleCatalogSignal, onSelectWorkflow, onSwitchEntity, onBackToList, onResetDraft,
    onSave, onValidateRules, onImportWorkflowJson, onOpenAddStage, onOpenAddTransition, onOpenRuleForStage, onNodeMove,
    onStageChange, onToggleAllowAnyTransition, onMoveOrder, onRemoveStage, onReplaceStage, onTransitionChange, onDeleteTransition,
    onAddCrmCustomField, onApplyLayoutPositions, canUndo, canRedo, onUndo, onRedo,
  } = props;
  const [guideOpen, setGuideOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = importedWorkflowSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) { setValidationBanner(t("crmWorkflows.pipelinesPage.importedJsonError")); return; }
      onImportWorkflowJson?.(parsed.data.stages as unknown as CrmWorkflowStageNode[], parsed.data.transitions as unknown as CrmWorkflowTransition[]);
      setValidationBanner(`${t("crmWorkflows.pipelinesPage.importedJsonBanner")} (${parsed.data.stages.length} ${t("crmWorkflows.pipelinesPage.statusesCountSuffix")})`);
    } catch { setValidationBanner(t("crmWorkflows.pipelinesPage.importedJsonError")); }
  };

  const studioElement = (
    <div dir={isAr ? "rtl" : "ltr"} className="fixed inset-0 z-[900] bg-nx-ground flex flex-col w-screen h-screen overflow-hidden" data-testid="crm-workflow-fullscreen-studio">
      <header className="h-12 px-2 border-b border-nx-line bg-nx-surface flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="outline" onClick={onBackToList} data-testid="studio-back-to-list-btn" className="h-7 px-1.5 text-[10px] shrink-0">
            <ArrowLeft className="w-3 h-3 me-0.5" />{t("crmWorkflows.pipelinesPage.backToWorkflowsListBtn")}
          </Button>
          <div className="inline-flex items-center rounded-md border border-nx-line bg-nx-raised p-0.5 gap-0.5 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => onSwitchEntity("deal")} data-testid="workflow-switch-deals" className={`h-6 px-1.5 text-[10px] ${activeEntity === "deal" ? "bg-nx-surface text-nx-ink border border-nx-line-hi font-semibold" : "text-nx-ink-2"}`}>
              {t("crmWorkflows.pipelinesPage.dealsPipelineSwitch")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onSwitchEntity("lead")} data-testid="workflow-switch-leads" className={`h-6 px-1.5 text-[10px] ${activeEntity === "lead" ? "bg-nx-surface text-nx-ink border border-nx-line-hi font-semibold" : "text-nx-ink-2"}`}>
              {t("crmWorkflows.pipelinesPage.leadsPipelineSwitch")}
            </Button>
          </div>
          <Select value={selectedWorkflowId} onValueChange={onSelectWorkflow}>
            <SelectTrigger className="h-7 min-w-[140px] max-w-[170px] w-auto text-[10px] bg-nx-raised border-nx-line shrink-0 px-1.5" data-testid="studio-workflow-selector"><SelectValue /></SelectTrigger>
            <SelectContent>{workflows.map((wf) => (<SelectItem key={wf.id} value={wf.id} className="text-xs">{isAr ? wf.nameAr : wf.nameEn}</SelectItem>))}</SelectContent>
          </Select>
          <Badge variant="outline" className="text-[10px] font-mono shrink-0 whitespace-nowrap px-1" data-testid="studio-dynamic-stage-count">
            {activeStages.length} {t("crmWorkflows.pipelinesPage.statStatusesLabel")}
          </Badge>
          <Button type="button" size="sm" variant="outline" className="h-6 px-1.5 text-[10px] font-mono shrink-0" onClick={() => { onResetDraft(); setValidationBanner(`${t("crmWorkflows.pipelinesPage.restoredVersionBanner")} (v${selectedWorkflow?.version ?? 4}.0)`); }} title={t("crmWorkflows.pipelinesPage.restoreVersionBtn")} data-testid="studio-workflow-version-badge">
            <History className="w-2.5 h-2.5 me-0.5 text-nx-accent" />v{selectedWorkflow?.version ?? 4}.0
          </Button>
          {selectedWorkflow?.isActive && (
            <Badge variant="success" className="text-[10px] hidden 2xl:inline-flex shrink-0 whitespace-nowrap">
              <CheckCircle2 className="w-2.5 h-2.5 me-1" />{t("crmWorkflows.pipelinesPage.activeInKanbanBadge")}
            </Badge>
          )}
        </div>

        <div className="inline-flex items-center rounded-md border border-nx-line bg-nx-raised p-0.5 gap-0.5 shrink-0">
          {([
            { id: "diagram", icon: Workflow, labelKey: "crmWorkflows.pipelinesPage.viewModeDiagram" },
            { id: "classic", icon: Layers, labelKey: "crmWorkflows.pipelinesPage.viewModeClassic" },
            { id: "text", icon: Table2, labelKey: "crmWorkflows.pipelinesPage.viewModeText" },
          ] as const).map((m) => {
            const Icon = m.icon;
            return (
              <Button key={m.id} size="sm" variant="ghost" onClick={() => setViewMode(m.id)} data-testid={`workflow-mode-${m.id}`} className={`h-6 px-1.5 text-[10px] ${viewMode === m.id ? "bg-nx-surface text-nx-ink border border-nx-line-hi font-semibold" : "text-nx-ink-2"}`}>
                <Icon className="w-3 h-3 me-0.5" />{t(m.labelKey)}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10px] shrink-0" onClick={() => setGuideOpen(true)} data-testid="studio-smart-guide-btn">
            <HelpCircle className="w-3 h-3 me-0.5 text-nx-accent" />{t("crmWorkflows.pipelinesPage.guideBtn")}
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10px] hidden xl:inline-flex shrink-0" onClick={() => {
            const payload = JSON.stringify({ workflow: selectedWorkflow, stages: activeStages, transitions }, null, 2);
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) void navigator.clipboard.writeText(payload).catch(() => undefined);
            setValidationBanner(`${t("crmWorkflows.pipelinesPage.exportedJsonBanner")} (v${selectedWorkflow?.version ?? 4}.0 • ${payload.length}B)`);
          }} data-testid="workflow-export-json-btn">
            <Download className="w-3 h-3 me-0.5" />{t("crmWorkflows.pipelinesPage.exportJsonBtn")}
          </Button>
          {canManagePipelines && (
            <>
              <Input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImportFile} className="hidden" data-testid="workflow-import-json-input" />
              <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10px] hidden xl:inline-flex shrink-0" onClick={() => fileInputRef.current?.click()} data-testid="workflow-import-json-btn">
                <Upload className="w-3 h-3 me-0.5" />{t("crmWorkflows.pipelinesPage.importJsonBtn")}
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-1.5 text-[10px] shrink-0" onClick={() => { onResetDraft(); onBackToList(); }} data-testid="studio-discard-close-btn">
                <RotateCcw className="w-3 h-3 me-0.5" />{t("crmWorkflows.pipelinesPage.discardCloseBtn")}
              </Button>
              <Button size="sm" className="h-7 px-2 text-[10px] shrink-0" onClick={onSave} disabled={!hasChanges} data-testid="save-pipeline-config-btn">
                <Save className="w-3 h-3 me-0.5" />{t("crmWorkflows.pipelinesPage.updateWorkflowBtn")}
              </Button>
            </>
          )}
        </div>
      </header>

      {validationBanner && (
        <div className="px-4 py-2 bg-nx-raised border-b border-nx-line flex items-center justify-between text-xs text-nx-ink">
          <span className="inline-flex items-center gap-2 font-medium"><GitBranch className="w-3.5 h-3.5 text-success" />{validationBanner}</span>
          <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => setValidationBanner(null)} aria-label={t("crmWorkflows.pipelinesPage.dismissBannerLabel")}><X className="w-3.5 h-3.5" /></Button>
        </div>
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <CrmWorkflowCanvas2D
            stages={activeStages} transitions={transitions} selectedStageKey={selectedStageKey}
            selectedTransitionId={selectedTransitionId} viewMode={viewMode} zoom={zoom}
            crmCustomFields={crmCustomFields} onZoomChange={setZoom} onSelectStage={setSelectedStageKey}
            onSelectTransition={setSelectedTransitionId} onNodeMove={onNodeMove}
            onTransitionChange={onTransitionChange} onOpenAddStage={onOpenAddStage}
            onOpenAddTransition={onOpenAddTransition} onOpenRuleForStage={onOpenRuleForStage} onValidateRules={onValidateRules}
            onApplyLayoutPositions={onApplyLayoutPositions}
            canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo}
          />
        </div>
        <CrmWorkflowInspectorPanel
          activeEntity={activeEntity} stages={activeStages} transitions={transitions}
          selectedStage={selectedStage} selectedTransition={selectedTransition} crmCustomFields={crmCustomFields}
          openRuleCatalogSignal={openRuleCatalogSignal}
          onStageChange={onStageChange} onToggleAllowAnyTransition={onToggleAllowAnyTransition}
          onMoveOrder={onMoveOrder} onRemoveStage={onRemoveStage} onReplaceStage={onReplaceStage}
          onTransitionChange={onTransitionChange} onDeleteTransition={onDeleteTransition}
          onSelectTransition={setSelectedTransitionId} onCreateTransition={(from, to) => onOpenAddTransition(from, to)}
          onAddCrmCustomField={onAddCrmCustomField}
        />
      </div>
      <CrmSmartGuideModal open={guideOpen} onOpenChange={setGuideOpen} isRtl={isAr} />
    </div>
  );

  return typeof document !== "undefined" && document.body ? createPortal(studioElement, document.body) : studioElement;
}
