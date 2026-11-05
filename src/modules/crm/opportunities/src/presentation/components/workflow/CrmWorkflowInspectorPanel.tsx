"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp, Plus, ShieldCheck, Trash2, Zap } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { formatExitFieldLabel } from "./CrmWorkflowCanvasSubViews";
import { CrmWorkflowTransitionInspector } from "./CrmWorkflowTransitionInspector";

const CORE_EXIT_FIELD_KEYS = ["partyId", "estimatedAmount", "targetCloseDate", "primaryContactRole", "solutionFitConfirmed"];

export interface CrmWorkflowInspectorPanelProps {
  activeEntity: "deal" | "lead";
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
  selectedStage: CrmWorkflowStageNode | null;
  selectedTransition: CrmWorkflowTransition | null;
  crmCustomFields?: CrmCustomFieldDefinition[];
  onStageChange: (updated: CrmWorkflowStageNode) => void;
  onMoveOrder: (stageKey: string, direction: "up" | "down") => void;
  onRemoveStage: (stageKey: string) => void;
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
  onSelectTransition: (transitionId: string) => void;
  onCreateTransition: (fromStageKey: string) => void;
  onAddCrmCustomField?: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => void;
}

/** Right-hand Studio Inspector Panel for configuring selected Statuses or Transitions. */
export function CrmWorkflowInspectorPanel({
  activeEntity, stages, transitions, selectedStage, selectedTransition, crmCustomFields = [],
  onStageChange, onMoveOrder, onRemoveStage, onTransitionChange, onDeleteTransition,
  onSelectTransition, onCreateTransition, onAddCrmCustomField,
}: CrmWorkflowInspectorPanelProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const [showCfForm, setShowCfForm] = useState(false);
  const [newCfKey, setNewCfKey] = useState("");
  const [newCfNameEn, setNewCfNameEn] = useState("");
  const [newCfNameAr, setNewCfNameAr] = useState("");

  if (selectedTransition) {
    return (
      <CrmWorkflowTransitionInspector
        t={t} isAr={isAr} stages={stages} selectedTransition={selectedTransition}
        crmCustomFields={crmCustomFields} onTransitionChange={onTransitionChange} onDeleteTransition={onDeleteTransition}
      />
    );
  }

  if (!selectedStage) {
    return (
      <div className="w-80 lg:w-96 border-s border-nx-line bg-nx-surface p-5 flex flex-col justify-between shrink-0" data-testid="workflow-inspector-panel">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-nx-ink">{t("crmOpportunities.pipelinesPage.inspectorEmptyTitle")}</h3>
          <p className="text-xs text-nx-ink-2">{t("crmOpportunities.pipelinesPage.inspectorEmptyDesc")}</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="rounded-md border border-nx-line bg-nx-raised p-2.5">
              <span className="text-[10px] text-nx-ink-3 block">{t("crmOpportunities.pipelinesPage.statStatusesLabel")}</span>
              <span className="text-base font-bold font-mono text-nx-ink">{stages.length}</span>
            </div>
            <div className="rounded-md border border-nx-line bg-nx-raised p-2.5">
              <span className="text-[10px] text-nx-ink-3 block">{t("crmOpportunities.pipelinesPage.statTransitionsLabel")}</span>
              <span className="text-base font-bold font-mono text-nx-ink">{transitions.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleExitField = (fieldKey: string, checked: boolean) => {
    const next = checked ? Array.from(new Set([...selectedStage.requiredExitFields, fieldKey])) : selectedStage.requiredExitFields.filter((f) => f !== fieldKey);
    onStageChange({ ...selectedStage, requiredExitFields: next });
  };
  const outgoing = transitions.filter((tr) => tr.fromStageKey === selectedStage.stageKey || tr.fromStageKey === "*");

  return (
    <div className="w-80 lg:w-96 border-s border-nx-line bg-nx-surface flex flex-col overflow-y-auto p-4 space-y-4 shrink-0" data-testid="workflow-inspector-panel">
      <div className="flex items-center justify-between pb-3 border-b border-nx-line">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-nx-ink-3 block">{t("crmOpportunities.pipelinesPage.statusInspectorEyebrow")}</span>
          <h3 className="text-sm font-bold text-nx-ink">{isAr ? selectedStage.labelAr : selectedStage.labelEn}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onMoveOrder(selectedStage.stageKey, "up")} title={t("crmOpportunities.pipelinesPage.moveStageEarlierTitle")}><ArrowUp className="w-3.5 h-3.5" /></Button>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onMoveOrder(selectedStage.stageKey, "down")} title={t("crmOpportunities.pipelinesPage.moveStageLaterTitle")}><ArrowDown className="w-3.5 h-3.5" /></Button>
          {!selectedStage.isTerminalWon && !selectedStage.isTerminalLost && (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onRemoveStage(selectedStage.stageKey)} title={t("crmOpportunities.pipelinesPage.deleteStatusTitle")} data-testid="inspector-delete-stage-btn"><Trash2 className="w-3.5 h-3.5" /></Button>
          )}
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
        <div className="space-y-1">
          <Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.winProbabilityPct")}</Label>
          <Input type="number" min={0} max={100} value={selectedStage.probability} onChange={(e) => onStageChange({ ...selectedStage, probability: Number(e.target.value) || 0 })} className="h-8 text-xs" data-testid="inspector-stage-probability" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">{t("crmOpportunities.pipelinesPage.slaTargetDays")}</Label>
          <Input type="number" min={0} value={selectedStage.slaDays} onChange={(e) => onStageChange({ ...selectedStage, slaDays: Number(e.target.value) || 0 })} className="h-8 text-xs" data-testid="inspector-stage-sla" />
        </div>
      </div>

      {activeEntity === "lead" && !selectedStage.isTerminalLost && (
        <div className="rounded-md border border-nx-line bg-nx-raised/50 p-2.5 flex items-start gap-2">
          <Checkbox id="inspector-converts-to-deal" checked={Boolean(selectedStage.convertsToDeal)} onCheckedChange={(v) => onStageChange({ ...selectedStage, convertsToDeal: Boolean(v) })} data-testid="inspector-stage-converts-to-deal" />
          <Label htmlFor="inspector-converts-to-deal" className="text-xs cursor-pointer">{t("crmOpportunities.pipelinesPage.convertsToDealToggleTitle")}</Label>
        </div>
      )}

      <div className="rounded-md border border-nx-line bg-nx-raised/40 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-info" />
            <p className="text-xs font-bold text-nx-ink">{t("crmOpportunities.pipelinesPage.mandatoryExitGateRulesHeader")}</p>
          </div>
          {onAddCrmCustomField && (
            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => setShowCfForm((v) => !v)} data-testid="workflow-create-custom-field-btn">
              <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.pipelinesPage.addBtn")}
            </Button>
          )}
        </div>
        <div className="space-y-1.5 pt-1">
          {CORE_EXIT_FIELD_KEYS.map((fk) => (
            <div key={fk} className="flex items-center gap-2" data-testid={`inspector-${selectedStage.stageKey}-exit-field-${fk}`}>
              <Checkbox id={`stage-exit-${fk}`} checked={selectedStage.requiredExitFields.includes(fk)} onCheckedChange={(v) => toggleExitField(fk, Boolean(v))} />
              <Label htmlFor={`stage-exit-${fk}`} className="text-xs cursor-pointer">{formatExitFieldLabel(fk, t, isAr, crmCustomFields)}</Label>
            </div>
          ))}
          {crmCustomFields.map((cf) => {
            const fk = `custom:${cf.key}`;
            return (
              <div key={fk} className="flex items-center gap-2" data-testid={`inspector-${selectedStage.stageKey}-exit-field-${fk}`}>
                <Checkbox id={`stage-cf-${cf.key}`} checked={selectedStage.requiredExitFields.includes(fk)} onCheckedChange={(v) => toggleExitField(fk, Boolean(v))} />
                <Label htmlFor={`stage-cf-${cf.key}`} className="text-xs cursor-pointer">{isAr ? cf.labelAr : cf.labelEn}</Label>
              </div>
            );
          })}
        </div>

        {onAddCrmCustomField && showCfForm && (
          <div className="pt-2 border-t border-nx-line space-y-1.5">
            <Input value={newCfKey} onChange={(e) => setNewCfKey(e.target.value)} placeholder="field_key" className="h-7 text-xs font-mono" data-testid="workflow-cf-key-input" />
            <div className="grid grid-cols-2 gap-1.5">
              <Input value={newCfNameEn} onChange={(e) => setNewCfNameEn(e.target.value)} placeholder={t("crmOpportunities.pipelinesPage.newCustomFieldEnPlaceholder")} className="h-7 text-xs" data-testid="workflow-cf-label-input" />
              <Input dir="rtl" value={newCfNameAr} onChange={(e) => setNewCfNameAr(e.target.value)} placeholder={t("crmOpportunities.pipelinesPage.newCustomFieldArPlaceholder")} className="h-7 text-xs" />
            </div>
            <Button
              size="sm" variant="outline" className="w-full h-7 text-xs" data-testid="workflow-cf-save-btn"
              onClick={() => {
                if (!newCfNameEn.trim()) return;
                const key = (newCfKey.trim() || newCfNameEn.trim()).toLowerCase().replace(/[^a-z0-9_]+/g, "_");
                onAddCrmCustomField({
                  entityTypeKey: activeEntity === "lead" ? "crm.lead" : "crm.opportunity", key,
                  labelEn: newCfNameEn.trim(), labelAr: newCfNameAr.trim() || newCfNameEn.trim(),
                  valueType: "Text", isRequired: false, defaultStageGateKey: selectedStage.stageKey,
                });
                toggleExitField(`custom:${key}`, true); setNewCfKey(""); setNewCfNameEn(""); setNewCfNameAr(""); setShowCfForm(false);
              }}
            >
              <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.pipelinesPage.addRequireOnStageBtn")}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-nx-ink">{t("crmOpportunities.pipelinesPage.transitionsFromStatusHeader")}</span>
          <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onCreateTransition(selectedStage.stageKey)}>
            <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.pipelinesPage.addBtn")}
          </Button>
        </div>
        <div className="space-y-1.5">
          {outgoing.map((tr) => {
            const targetStage = stages.find((s) => s.stageKey === tr.toStageKey);
            const targetLabel = targetStage ? (isAr ? targetStage.labelAr : targetStage.labelEn) : tr.toStageKey;
            return (
              <div key={tr.id} onClick={() => onSelectTransition(tr.id)} className="rounded-md border border-nx-line bg-nx-raised/50 px-2.5 py-1.5 flex items-center justify-between text-xs cursor-pointer hover:border-nx-line-hi">
                <span className="inline-flex items-center gap-1.5 font-semibold text-nx-ink truncate"><Zap className="w-3 h-3 text-warning shrink-0" />{isAr ? tr.nameAr : tr.nameEn}</span>
                <Badge variant="outline" className="text-[10px]">{targetLabel}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
