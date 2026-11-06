"use client";

import React from "react";
import { ArrowDown, ArrowRightLeft, ArrowUp, Trash2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmCustomFieldDefinition, CrmWorkflowStageCategory } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { CrmWorkflowTransitionInspector } from "./CrmWorkflowTransitionInspector";
import { CrmWorkflowReplaceStageModal } from "./CrmWorkflowReplaceStageModal";
import { CrmWorkflowPropertiesSection } from "./CrmWorkflowPropertiesSection";
import { CrmWorkflowStageExitGatesSection } from "./CrmWorkflowStageExitGatesSection";
import { useStageInspectorViewModel } from "../../viewmodels/useStageInspectorViewModel";

export interface CrmWorkflowInspectorPanelProps {
  t?: (k: string) => string; isAr?: boolean; activeEntity: "deal" | "lead";
  stages: CrmWorkflowStageNode[]; transitions: CrmWorkflowTransition[];
  selectedStage: CrmWorkflowStageNode | null; selectedTransition: CrmWorkflowTransition | null;
  crmCustomFields: CrmCustomFieldDefinition[]; openRuleCatalogSignal?: number;
  onStageChange: (updated: CrmWorkflowStageNode) => void;
  onMoveOrder?: (stageKey: string, dir: "up" | "down") => void;
  onMoveStage?: (stageKey: string, dir: "up" | "down") => void;
  onRemoveStage: (stageKey: string) => void;
  onReplaceStage?: (oldStageKey: string, replacementStageKey: string) => void;
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
  onCreateTransition: (fromStageKey: string) => void;
  onSelectTransition: (transitionId: string) => void;
  onAddCrmCustomField?: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => void;
}

/**
 * Pure declarative Workflow Inspector Panel consuming useStageInspectorViewModel (<165 lines).
 */
export function CrmWorkflowInspectorPanel({
  t: propT, isAr: propIsAr, activeEntity, stages, transitions, selectedStage, selectedTransition,
  crmCustomFields, openRuleCatalogSignal, onStageChange, onMoveOrder, onMoveStage, onRemoveStage, onReplaceStage,
  onTransitionChange, onDeleteTransition, onCreateTransition, onSelectTransition, onAddCrmCustomField,
}: CrmWorkflowInspectorPanelProps) {
  const i18n = useI18n();
  const t = propT ?? i18n.t;
  const isAr = propIsAr ?? i18n.language === "ar";
  const handleMove = onMoveOrder ?? onMoveStage ?? (() => undefined);

  const vm = useStageInspectorViewModel({
    activeEntity, stages, transitions, selectedStage, onStageChange, onRemoveStage, onReplaceStage, onAddCrmCustomField,
  });

  if (selectedTransition) {
    return (
      <CrmWorkflowTransitionInspector
        t={t} isAr={isAr} activeEntity={activeEntity} stages={stages} selectedTransition={selectedTransition}
        crmCustomFields={crmCustomFields} openRuleCatalogSignal={openRuleCatalogSignal}
        onTransitionChange={onTransitionChange} onDeleteTransition={onDeleteTransition}
      />
    );
  }

  if (!selectedStage) {
    return (
      <div className="w-80 lg:w-96 border-s border-nx-line bg-nx-surface flex flex-col justify-between p-4 shrink-0" data-testid="workflow-inspector-panel">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-nx-ink-2">{t("crmOpportunities.pipelinesPage.inspectorEmptyTitle")}</h3>
          <p className="text-xs text-nx-ink-3 leading-relaxed">{t("crmOpportunities.pipelinesPage.inspectorEmptyDesc")}</p>
          <div className="rounded-md border border-nx-line bg-nx-raised/40 p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-nx-ink-2">{t("crmOpportunities.pipelinesPage.statStatusesLabel")}</span>
              <span className="font-mono font-bold text-nx-ink">{vm.nonTerminalStages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-nx-ink-2">{t("crmOpportunities.pipelinesPage.statTransitionsLabel")}</span>
              <span className="font-mono font-bold text-nx-ink">{transitions.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 lg:w-96 border-s border-nx-line bg-nx-surface flex flex-col overflow-y-auto p-4 space-y-4 shrink-0" data-testid="workflow-inspector-panel">
      <div className="flex items-center justify-between pb-3 border-b border-nx-line">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-nx-ink-3 block">{t("crmOpportunities.pipelinesPage.statusInspectorEyebrow")}</span>
          <h3 className="text-sm font-bold text-nx-ink">{isAr ? selectedStage.labelAr : selectedStage.labelEn}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleMove(selectedStage.stageKey, "up")} title={t("crmOpportunities.pipelinesPage.moveStageEarlierTitle")}><ArrowUp className="w-3.5 h-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleMove(selectedStage.stageKey, "down")} title={t("crmOpportunities.pipelinesPage.moveStageLaterTitle")}><ArrowDown className="w-3.5 h-3.5" /></Button>
          {vm.canDeleteStage && <Button size="icon" variant="ghost" className="h-7 w-7 text-warning" onClick={vm.handleOpenReplaceModal} title={t("crmOpportunities.pipelinesPage.replaceAndMigrateStatusTitle")} data-testid="inspector-replace-stage-btn"><ArrowRightLeft className="w-3.5 h-3.5" /></Button>}
          {vm.canDeleteStage && <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onRemoveStage(selectedStage.stageKey)} title={t("crmOpportunities.pipelinesPage.deleteStatusTitle")} data-testid={`inspector-delete-stage-${selectedStage.stageKey}`}><Trash2 className="w-3.5 h-3.5" /></Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.labelEnglish")}</Label>
          <Input value={selectedStage.labelEn} onChange={(e) => onStageChange({ ...selectedStage, labelEn: e.target.value })} className="h-8 text-xs" data-testid="inspector-stage-label-en" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.labelArabic")}</Label>
          <Input dir="rtl" value={selectedStage.labelAr} onChange={(e) => onStageChange({ ...selectedStage, labelAr: e.target.value })} className="h-8 text-xs" data-testid="inspector-stage-label-ar" />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.statusCategoryLabel")}</Label>
        <Select value={selectedStage.category || "in_progress"} onValueChange={(val) => onStageChange({ ...selectedStage, category: val as CrmWorkflowStageCategory })}>
          <SelectTrigger className="h-8 text-xs" data-testid="inspector-stage-category-select"><SelectValue /></SelectTrigger>
          <SelectContent className="z-[10001]">
            <SelectItem value="todo" className="text-xs">{t("crmOpportunities.pipelinesPage.statusCategoryTodo")}</SelectItem>
            <SelectItem value="in_progress" className="text-xs">{t("crmOpportunities.pipelinesPage.statusCategoryInProgress")}</SelectItem>
            <SelectItem value="done" className="text-xs">{t("crmOpportunities.pipelinesPage.statusCategoryDone")}</SelectItem>
            <SelectItem value="lost" className="text-xs">{t("crmOpportunities.pipelinesPage.statusCategoryLost")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.winProbabilityPct")}</Label>
          <Input type="number" min={0} max={100} value={selectedStage.probability} onChange={(e) => onStageChange({ ...selectedStage, probability: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="h-8 text-xs font-mono" data-testid="inspector-stage-probability" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.slaTargetDays")}</Label>
          <Input type="number" min={0} max={365} value={selectedStage.slaDays ?? 5} onChange={(e) => onStageChange({ ...selectedStage, slaDays: Math.max(0, Number(e.target.value) || 0) })} className="h-8 text-xs font-mono" />
        </div>
      </div>

      {activeEntity === "lead" && (
        <div className="rounded-md border border-nx-line bg-nx-raised/40 p-2.5 flex items-center gap-2.5">
          <Checkbox id="stage-converts-deal" checked={Boolean(selectedStage.convertsToDeal)} onCheckedChange={(v) => onStageChange({ ...selectedStage, convertsToDeal: Boolean(v) })} data-testid="inspector-stage-converts-to-deal" />
          <Label htmlFor="stage-converts-deal" className="text-xs cursor-pointer font-semibold text-nx-ink">{t("crmOpportunities.pipelinesPage.convertsToDealToggleTitle")}</Label>
        </div>
      )}

      <CrmWorkflowStageExitGatesSection
        t={t} isAr={isAr} stages={stages} selectedStage={selectedStage} crmCustomFields={crmCustomFields}
        coreFieldKeys={vm.coreFieldKeys} incoming={vm.incoming} outgoing={vm.outgoing}
        showCfForm={vm.showCfForm} onToggleCfForm={() => vm.setShowCfForm((v) => !v)}
        newCfKey={vm.newCfKey} onNewCfKeyChange={vm.setNewCfKey}
        newCfNameEn={vm.newCfNameEn} onNewCfNameEnChange={vm.setNewCfNameEn}
        newCfNameAr={vm.newCfNameAr} onNewCfNameArChange={vm.setNewCfNameAr}
        onCreateCustomField={vm.handleCreateCustomField} onToggleExitField={vm.toggleExitField}
        onSelectTransition={onSelectTransition} onCreateTransition={onCreateTransition}
        canCreateCustomField={Boolean(onAddCrmCustomField)}
      />

      <div className="rounded-md border border-nx-line bg-nx-raised/40 p-2.5">
        <CrmWorkflowPropertiesSection
          t={t} properties={vm.stageProps} showForm={vm.showStagePropForm} onToggleForm={() => vm.setShowStagePropForm((v) => !v)}
          propKey={vm.stagePropKey} onPropKeyChange={vm.setStagePropKey} propVal={vm.stagePropVal} onPropValChange={vm.setStagePropVal}
          onSaveProperty={vm.handleAddStageProperty} onRemoveProperty={vm.handleRemoveStageProperty} testIdPrefix="stage"
        />
      </div>

      <CrmWorkflowReplaceStageModal
        t={t} isAr={isAr} open={vm.replaceModalOpen} onOpenChange={vm.setReplaceModalOpen}
        retiringStage={selectedStage} candidateStages={vm.candidateReplacementStages}
        replacementTargetKey={vm.replacementTargetKey} onTargetKeyChange={vm.setReplacementTargetKey}
        onConfirmReplace={vm.handleConfirmReplaceStage}
      />
    </div>
  );
}
