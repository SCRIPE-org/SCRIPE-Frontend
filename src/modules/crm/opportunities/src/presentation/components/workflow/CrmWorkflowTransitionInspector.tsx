"use client";

import React, { useEffect, useRef } from "react";
import { ArrowRight, Plus, Trash2, X, Zap } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { CrmWorkflowRuleCatalogModal } from "./CrmWorkflowRuleCatalogModal";
import { CrmWorkflowPropertiesSection } from "./CrmWorkflowPropertiesSection";
import { CrmWorkflowTransitionRulesSection } from "./CrmWorkflowTransitionRulesSection";
import {
  DOMAIN_EVENT_OPTION_KEYS,
  TRIGGER_OPTION_KEYS,
  useTransitionInspectorViewModel,
} from "../../viewmodels/useTransitionInspectorViewModel";

export interface CrmWorkflowTransitionInspectorProps {
  t: (k: string) => string;
  isAr: boolean;
  activeEntity?: "deal" | "lead";
  stages: CrmWorkflowStageNode[];
  selectedTransition: CrmWorkflowTransition;
  crmCustomFields: CrmCustomFieldDefinition[];
  openRuleCatalogSignal?: number;
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
  onAddCrmCustomField?: (def: CrmCustomFieldDefinition) => void;
}

/**
 * Pure declarative Transition Rule Inspector view consuming useTransitionInspectorViewModel (<180 lines).
 */
export function CrmWorkflowTransitionInspector({
  t, isAr, activeEntity = "deal", stages, selectedTransition, crmCustomFields, openRuleCatalogSignal, onTransitionChange, onDeleteTransition, onAddCrmCustomField,
}: CrmWorkflowTransitionInspectorProps) {
  const vm = useTransitionInspectorViewModel({ t, isAr, stages, selectedTransition, openRuleCatalogSignal, onTransitionChange });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [selectedTransition.id]);

  return (
    <div ref={panelRef} className="w-80 xl:w-[352px] border-s border-nx-line bg-nx-surface flex flex-col overflow-y-auto p-3 space-y-2.5 shrink-0" data-testid="workflow-inspector-panel">
      <div className="flex items-center justify-between pb-2 border-b border-nx-line">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-nx-ink-3 block">{t("crmOpportunities.pipelinesPage.transitionInspectorEyebrow")}</span>
          <h3 className="text-sm font-bold text-nx-ink flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-warning" />{isAr ? selectedTransition.nameAr : selectedTransition.nameEn}</h3>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDeleteTransition(selectedTransition.id)} title={t("crmOpportunities.pipelinesPage.deleteTransitionTitle")} data-testid="inspector-delete-transition-btn">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="rounded-md border border-nx-line bg-nx-raised p-2 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1" data-testid="inspector-transition-from-tags">
            {vm.currentFromKeys.map((fk) => (
              <Badge key={fk} variant="outline" className="text-[10px] text-nx-ink font-semibold">{vm.stageLabel(fk)}</Badge>
            ))}
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-nx-ink-3 shrink-0" />
          <Badge variant="secondary" className="text-[10px] text-nx-ink font-semibold truncate">{vm.stageLabel(selectedTransition.toStageKey)}</Badge>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-nx-line">
          <span className="text-[10px] text-nx-ink-3">{t("crmOpportunities.pipelinesPage.multiSourceFromStatusesLabel")}</span>
          <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => vm.setShowMultiFromSelector((v) => !v)} data-testid="inspector-toggle-multi-from-btn">
            <Plus className="w-2.5 h-2.5 me-1" />{t("crmOpportunities.pipelinesPage.editSourcesBtn")}
          </Button>
        </div>
        {vm.showMultiFromSelector && (
          <div className="pt-1.5 space-y-1 border-t border-nx-line" data-testid="inspector-multi-from-list">
            <div className="flex items-center gap-2">
              <Checkbox
                id="multi-from-any"
                checked={vm.currentFromKeys.includes("*")}
                onCheckedChange={() => vm.toggleFromStageKey("*")}
                data-testid="multi-from-checkbox-any"
              />
              <Label htmlFor="multi-from-any" className="text-[11px] cursor-pointer font-semibold text-nx-ink">
                {t("crmOpportunities.pipelinesPage.anyStageGlobal")}
              </Label>
            </div>
            {stages
              .filter((s) => s.stageKey !== selectedTransition.toStageKey)
              .map((st) => (
                <div key={st.stageKey} className="flex items-center gap-2">
                  <Checkbox id={`multi-from-${st.stageKey}`} checked={vm.currentFromKeys.includes(st.stageKey)} onCheckedChange={() => vm.toggleFromStageKey(st.stageKey)} data-testid={`multi-from-checkbox-${st.stageKey}`} />
                  <Label htmlFor={`multi-from-${st.stageKey}`} className="text-[11px] cursor-pointer">{isAr ? st.labelAr : st.labelEn}</Label>
                </div>
              ))}
          </div>
        )}
        <div className="space-y-1 pt-1 border-t border-nx-line">
          <Label className="text-[10px] text-nx-ink-3">{t("crmOpportunities.pipelinesPage.toStatusLabel")}</Label>
          <Select value={selectedTransition.toStageKey} onValueChange={(val) => onTransitionChange({ ...selectedTransition, toStageKey: val })}>
            <SelectTrigger className="h-7 text-xs bg-nx-surface" data-testid="inspector-to-stage-select"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[10001]">
              {stages.map((st) => (
                <SelectItem key={st.stageKey} value={st.stageKey} className="text-xs">{isAr ? st.labelAr : st.labelEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5">
          <Label className="text-[10px]">{t("crmOpportunities.pipelinesPage.actionLabelEn")}</Label>
          <Input value={selectedTransition.nameEn} onChange={(e) => onTransitionChange({ ...selectedTransition, nameEn: e.target.value })} className="h-7 text-xs" data-testid="inspector-transition-name-en" />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px]">{t("crmOpportunities.pipelinesPage.actionLabelAr")}</Label>
          <Input dir="rtl" value={selectedTransition.nameAr} onChange={(e) => onTransitionChange({ ...selectedTransition, nameAr: e.target.value })} className="h-7 text-xs" data-testid="inspector-transition-name-ar" />
        </div>
      </div>

      <CrmWorkflowTransitionRulesSection
        t={t} isAr={isAr} activeEntity={activeEntity} selectedTransition={selectedTransition} crmCustomFields={crmCustomFields}
        openSection={vm.openSection} onSetOpenSection={vm.setOpenSection} onOpenCatalogForCategory={vm.openCatalogForCategory}
        attachedCatalogRules={vm.attachedCatalogRules} onRemoveCatalogRule={vm.handleRemoveCatalogRule}
        onToggleField={vm.toggleField} onTransitionChange={onTransitionChange}
      />

      <div className="rounded-md border border-nx-line bg-nx-raised/40 p-2.5 space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-nx-ink-2">
              {t("crmOpportunities.pipelinesPage.triggersHeader")} ({vm.triggers.length})
            </span>
            <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => vm.setShowTriggerSelector((v) => !v)} data-testid="inspector-transition-add-trigger-btn">
              <Plus className="w-2.5 h-2.5 me-1" />{t("crmOpportunities.pipelinesPage.addBtn")}
            </Button>
          </div>
          {vm.showTriggerSelector && (
            <div className="flex flex-wrap gap-1 pt-1" data-testid="inspector-transition-trigger-options">
              {TRIGGER_OPTION_KEYS.map((trOpt) => (
                <Button key={trOpt.key} size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => vm.handleAddTrigger(trOpt.key)} data-testid={`add-trigger-${trOpt.key}`}>
                  {t(trOpt.labelKey)}
                </Button>
              ))}
            </div>
          )}
          {vm.triggers.map((trig) => (
            <div key={trig} className="flex items-center justify-between rounded border border-nx-line bg-nx-surface px-2 py-0.5 text-[11px]" data-testid={`transition-trigger-badge-${trig}`}>
              <span className="font-mono text-nx-ink">{trig}</span>
              <Button size="icon" variant="ghost" className="h-4 w-4 text-destructive" onClick={() => vm.handleRemoveTrigger(trig)}><X className="w-2.5 h-2.5" /></Button>
            </div>
          ))}
        </div>

        <div className="space-y-1 pt-1.5 border-t border-nx-line">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-nx-ink-2">{t("crmOpportunities.pipelinesPage.domainEventLabel")}</Label>
          <Select value={selectedTransition.domainEventKey || "GenericEvent"} onValueChange={(val) => onTransitionChange({ ...selectedTransition, domainEventKey: val })}>
            <SelectTrigger className="h-7 text-xs" data-testid="inspector-transition-event-select"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[10001]">
              {DOMAIN_EVENT_OPTION_KEYS.map((ev) => (
                <SelectItem key={ev.key} value={ev.key} className="text-xs">{t(ev.labelKey)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-1.5 border-t border-nx-line">
          <CrmWorkflowPropertiesSection
            t={t} properties={vm.transitionProps} showForm={vm.showPropForm} onToggleForm={() => vm.setShowPropForm((v) => !v)}
            propKey={vm.newPropKey} onPropKeyChange={vm.setNewPropKey} propVal={vm.newPropVal} onPropValChange={vm.setNewPropVal}
            onSaveProperty={vm.handleAddProperty} onRemoveProperty={vm.handleRemoveProperty} testIdPrefix="transition"
          />
        </div>

        <div className="pt-1.5 border-t border-nx-line flex justify-end">
          <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive gap-1.5 w-full" onClick={() => onDeleteTransition(selectedTransition.id)} data-testid="inspector-bottom-delete-transition-btn">
            <Trash2 className="w-3.5 h-3.5" />{t("crmOpportunities.pipelinesPage.deleteTransitionTitle")}
          </Button>
        </div>
      </div>

      <CrmWorkflowRuleCatalogModal
        t={t} isAr={isAr} open={vm.ruleCatalogOpen} onOpenChange={vm.setRuleCatalogOpen}
        activeFilter={vm.ruleCatalogFilter} onFilterChange={vm.setRuleCatalogFilter}
        searchQuery={vm.ruleCatalogSearch} onSearchChange={vm.setRuleCatalogSearch}
        templates={vm.filteredCatalogTemplates}
        transitionSummary={`${isAr ? selectedTransition.nameAr : selectedTransition.nameEn}: ${vm.currentFromKeys.map((fk) => vm.stageLabel(fk)).join(", ")} -> ${vm.stageLabel(selectedTransition.toStageKey)}`}
        activeEntity={activeEntity} stages={stages} crmCustomFields={crmCustomFields} onAddCrmCustomField={onAddCrmCustomField}
        onSelectRule={vm.handleAddCatalogRule}
      />
    </div>
  );
}
