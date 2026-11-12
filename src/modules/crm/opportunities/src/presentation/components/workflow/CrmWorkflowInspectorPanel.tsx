"use client";

import React, { useEffect, useRef } from "react";
import { ArrowDown, ArrowRightLeft, ArrowUp, Palette, Trash2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  CRM_STAGE_COLOR_TOKENS, STAGE_COLOR_PALETTE, resolveDefaultStageColor,
  type CrmCustomFieldDefinition, type CrmStageColorToken, type CrmWorkflowStageCategory,
} from "@modules/crm";
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
  onToggleAllowAnyTransition?: (stageKey: string, allowed: boolean) => void;
  onMoveOrder?: (stageKey: string, dir: "up" | "down") => void;
  onMoveStage?: (stageKey: string, dir: "up" | "down") => void;
  onRemoveStage: (stageKey: string) => void;
  onReplaceStage?: (oldStageKey: string, replacementStageKey: string) => void;
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
  onCreateTransition: (fromStageKey?: string, toStageKey?: string) => void;
  onSelectTransition: (transitionId: string) => void;
  onAddCrmCustomField?: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => void;
}

/** Pure declarative Workflow Inspector Panel consuming useStageInspectorViewModel (<180 lines). */
export function CrmWorkflowInspectorPanel({
  t: propT, isAr: propIsAr, activeEntity, stages, transitions, selectedStage, selectedTransition,
  crmCustomFields, openRuleCatalogSignal, onStageChange, onToggleAllowAnyTransition, onMoveOrder, onMoveStage, onRemoveStage, onReplaceStage,
  onTransitionChange, onDeleteTransition, onCreateTransition, onSelectTransition, onAddCrmCustomField,
}: CrmWorkflowInspectorPanelProps) {
  const i18n = useI18n();
  const t = propT ?? i18n.t;
  const isAr = propIsAr ?? i18n.language === "ar";
  const handleMove = onMoveOrder ?? onMoveStage ?? (() => undefined);
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedStageKey = selectedStage?.stageKey;
  const selectedTransitionId = selectedTransition?.id;

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [selectedStageKey, selectedTransitionId]);

  const vm = useStageInspectorViewModel({
    activeEntity, stages, transitions, selectedStage, onStageChange, onRemoveStage, onReplaceStage, onAddCrmCustomField,
  });

  if (selectedTransition) {
    return (
      <CrmWorkflowTransitionInspector
        t={t} isAr={isAr} activeEntity={activeEntity} stages={stages} selectedTransition={selectedTransition}
        crmCustomFields={crmCustomFields} openRuleCatalogSignal={openRuleCatalogSignal}
        onTransitionChange={onTransitionChange} onDeleteTransition={onDeleteTransition} onAddCrmCustomField={onAddCrmCustomField}
      />
    );
  }

  if (!selectedStage) {
    return (
      <div className="w-80 xl:w-[352px] border-s border-nx-line bg-nx-surface flex flex-col justify-between p-4 shrink-0" data-testid="workflow-inspector-panel">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-nx-ink-2">{t("crmOpportunities.pipelinesPage.inspectorEmptyTitle")}</h3>
          <p className="text-xs text-nx-ink-3 leading-relaxed">{t("crmOpportunities.pipelinesPage.inspectorEmptyDesc")}</p>
          <div className="rounded-md border border-nx-line bg-nx-raised/40 p-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-nx-ink-2">{t("crmOpportunities.pipelinesPage.statStatusesLabel")}</span><span className="font-mono font-bold text-nx-ink">{stages.length}</span></div>
            <div className="flex justify-between"><span className="text-nx-ink-2">{t("crmOpportunities.pipelinesPage.statTransitionsLabel")}</span><span className="font-mono font-bold text-nx-ink">{transitions.length}</span></div>
          </div>
        </div>
      </div>
    );
  }

  const activeColor = resolveDefaultStageColor(selectedStage.stageKey, selectedStage.category, selectedStage.order, selectedStage.color || selectedStage.properties?.color);
  const customHexValue = selectedStage.customColorHex || selectedStage.properties?.customColorHex || "";
  const applyCustomHex = (hex: string) => {
    const clean = hex.trim();
    const nextProps = { ...(selectedStage.properties ?? {}) };
    if (clean) nextProps.customColorHex = clean; else delete nextProps.customColorHex;
    onStageChange({ ...selectedStage, customColorHex: clean || undefined, properties: nextProps });
  };

  return (
    <div ref={panelRef} className="w-80 xl:w-[352px] border-s border-nx-line bg-nx-surface flex flex-col overflow-y-auto p-4 space-y-3.5 shrink-0" data-testid="workflow-inspector-panel">
      <div className="flex items-center justify-between pb-2.5 border-b border-nx-line">
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
        <div className="space-y-1"><Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.labelEnglish")}</Label><Input value={selectedStage.labelEn} onChange={(e) => onStageChange({ ...selectedStage, labelEn: e.target.value })} className="h-8 text-xs" data-testid="inspector-stage-label-en" /></div>
        <div className="space-y-1"><Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.labelArabic")}</Label><Input dir="rtl" value={selectedStage.labelAr} onChange={(e) => onStageChange({ ...selectedStage, labelAr: e.target.value })} className="h-8 text-xs" data-testid="inspector-stage-label-ar" /></div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.statusCategoryLabel")}</Label>
        <Select value={selectedStage.category || "in_progress"} onValueChange={(val) => { const cat = val as CrmWorkflowStageCategory; onStageChange({ ...selectedStage, category: cat, isTerminalWon: cat === "done" && activeEntity === "deal", isTerminalLost: cat === "lost" }); }}>
          <SelectTrigger className="h-8 text-xs" data-testid="inspector-stage-category-select"><SelectValue /></SelectTrigger>
          <SelectContent className="z-[10001]">
            <SelectItem value="todo" className="text-xs">{t("crmOpportunities.pipelinesPage.statusCategoryTodo")}</SelectItem>
            <SelectItem value="in_progress" className="text-xs">{t("crmOpportunities.pipelinesPage.statusCategoryInProgress")}</SelectItem>
            <SelectItem value="done" className="text-xs">{t("crmOpportunities.pipelinesPage.statusCategoryDone")}</SelectItem>
            <SelectItem value="lost" className="text-xs">{t("crmOpportunities.pipelinesPage.statusCategoryLost")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 rounded-md border border-nx-line bg-nx-raised/30 p-2.5" data-testid="status-inspector-color-picker">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] inline-flex items-center gap-1.5"><Palette className="w-3 h-3 text-nx-ink-2" />{t("crmOpportunities.pipelinesPage.stageColorLabel")} ({customHexValue || (isAr ? STAGE_COLOR_PALETTE[activeColor]?.labelAr : STAGE_COLOR_PALETTE[activeColor]?.labelEn) || activeColor})</Label>
          {customHexValue && <Button type="button" size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => applyCustomHex("")}>{t("crmOpportunities.pipelinesPage.resetHexBtn")}</Button>}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CRM_STAGE_COLOR_TOKENS.map((c: CrmStageColorToken) => (
            <Button
              key={c} type="button" size="icon" variant="outline" data-testid={`status-color-swatch-${c}`} title={(isAr ? STAGE_COLOR_PALETTE[c]?.labelAr : STAGE_COLOR_PALETTE[c]?.labelEn) || c}
              onClick={() => { const nextProps: Record<string, string> = { ...(selectedStage.properties ?? {}), color: c }; delete nextProps.customColorHex; onStageChange({ ...selectedStage, color: c, customColorHex: undefined, properties: nextProps }); }}
              className={`h-5 w-5 rounded-full p-0 border ${STAGE_COLOR_PALETTE[c].swatchClass} ${!customHexValue && activeColor === c ? "ring-2 ring-primary ring-offset-1 ring-offset-nx-surface scale-110" : "opacity-75 hover:opacity-100"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-nx-line">
          <Input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(customHexValue) ? customHexValue : "#14B8A6"} onChange={(e) => applyCustomHex(e.target.value.toUpperCase())} className="h-7 w-9 p-0.5 cursor-pointer bg-nx-surface border-nx-line shrink-0" data-testid="status-custom-hex-picker" />
          <Input value={customHexValue} placeholder="#RRGGBB" onChange={(e) => applyCustomHex(e.target.value)} className="h-7 text-[11px] font-mono" data-testid="status-custom-hex-input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1"><Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.winProbabilityPct")}</Label><Input type="number" min={0} max={100} value={selectedStage.probability} onChange={(e) => onStageChange({ ...selectedStage, probability: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="h-8 text-xs font-mono" data-testid="inspector-stage-probability" /></div>
        <div className="space-y-1"><Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.slaTargetDays")}</Label><Input type="number" min={0} max={365} value={selectedStage.slaDays ?? 5} onChange={(e) => onStageChange({ ...selectedStage, slaDays: Math.max(0, Number(e.target.value) || 0) })} className="h-8 text-xs font-mono" /></div>
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
        allowInboundFromAny={vm.allowInboundFromAny} onToggleAllowAnyTransition={onToggleAllowAnyTransition}
        showCfForm={vm.showCfForm} onToggleCfForm={() => vm.setShowCfForm((v) => !v)}
        newCfKey={vm.newCfKey} onNewCfKeyChange={vm.setNewCfKey} newCfNameEn={vm.newCfNameEn} onNewCfNameEnChange={vm.setNewCfNameEn}
        newCfNameAr={vm.newCfNameAr} onNewCfNameArChange={vm.setNewCfNameAr} newCfType={vm.newCfType} onNewCfTypeChange={vm.setNewCfType}
        onCreateCustomField={vm.handleCreateCustomField} onToggleExitField={vm.toggleExitField}
        onSelectTransition={onSelectTransition} onCreateTransition={onCreateTransition} onStageChange={onStageChange} canCreateCustomField={Boolean(onAddCrmCustomField)}
      />

      <div className="rounded-md border border-nx-line bg-nx-raised/40 p-2.5">
        <CrmWorkflowPropertiesSection
          t={t} properties={vm.stageProps} showForm={vm.showStagePropForm} onToggleForm={() => vm.setShowStagePropForm((v) => !v)}
          propKey={vm.stagePropKey} onPropKeyChange={vm.setStagePropKey} propVal={vm.stagePropVal} onPropValChange={vm.setStagePropVal}
          onSaveProperty={vm.handleAddStageProperty} onRemoveProperty={vm.handleRemoveStageProperty} testIdPrefix="stage"
        />
      </div>

      {vm.canDeleteStage && (
        <div className="pt-3 border-t border-nx-line grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => onRemoveStage(selectedStage.stageKey)} data-testid="inspector-bottom-remove-stage-btn"><Trash2 className="w-3.5 h-3.5 me-1.5" />{t("crmOpportunities.pipelinesPage.deleteStatusTitle")}</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={vm.handleOpenReplaceModal} data-testid="inspector-bottom-replace-stage-btn"><ArrowRightLeft className="w-3.5 h-3.5 me-1.5" />{t("crmOpportunities.pipelinesPage.replaceAndMigrateStatusTitle")}</Button>
        </div>
      )}

      <CrmWorkflowReplaceStageModal
        t={t} isAr={isAr} open={vm.replaceModalOpen} onOpenChange={vm.setReplaceModalOpen}
        retiringStage={selectedStage} candidateStages={vm.candidateReplacementStages}
        replacementTargetKey={vm.replacementTargetKey} onTargetKeyChange={vm.setReplacementTargetKey}
        onConfirmReplace={vm.handleConfirmReplaceStage}
      />
    </div>
  );
}
