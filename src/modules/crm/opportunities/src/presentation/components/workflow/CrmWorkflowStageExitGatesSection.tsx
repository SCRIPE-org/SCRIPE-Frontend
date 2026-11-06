"use client";

import React from "react";
import { Plus, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { formatExitFieldLabel } from "./CrmWorkflowCanvasSubViews";

export interface CrmWorkflowStageExitGatesSectionProps {
  t: (k: string) => string;
  isAr: boolean;
  stages: CrmWorkflowStageNode[];
  selectedStage: CrmWorkflowStageNode;
  crmCustomFields: CrmCustomFieldDefinition[];
  coreFieldKeys: string[];
  incoming: CrmWorkflowTransition[];
  outgoing: CrmWorkflowTransition[];
  showCfForm: boolean;
  onToggleCfForm: () => void;
  newCfKey: string;
  onNewCfKeyChange: (v: string) => void;
  newCfNameEn: string;
  onNewCfNameEnChange: (v: string) => void;
  newCfNameAr: string;
  onNewCfNameArChange: (v: string) => void;
  onCreateCustomField: () => void;
  onToggleExitField: (fieldKey: string, checked: boolean) => void;
  onSelectTransition: (transitionId: string) => void;
  onCreateTransition: (fromStageKey: string) => void;
  canCreateCustomField: boolean;
}

/**
 * Pure declarative Stage Exit Validators, Inline Custom Field Creator, and Incoming/Outgoing Transitions section.
 */
export function CrmWorkflowStageExitGatesSection({
  t,
  isAr,
  stages,
  selectedStage,
  crmCustomFields,
  coreFieldKeys,
  incoming,
  outgoing,
  showCfForm,
  onToggleCfForm,
  newCfKey,
  onNewCfKeyChange,
  newCfNameEn,
  onNewCfNameEnChange,
  newCfNameAr,
  onNewCfNameArChange,
  onCreateCustomField,
  onToggleExitField,
  onSelectTransition,
  onCreateTransition,
  canCreateCustomField,
}: CrmWorkflowStageExitGatesSectionProps) {
  return (
    <>
      <div className="rounded-md border border-nx-line bg-nx-raised/30 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-nx-ink inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-info" />
            {t("crmOpportunities.pipelinesPage.mandatoryExitGateRulesHeader")}
          </span>
          {canCreateCustomField && (
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={onToggleCfForm} data-testid="workflow-create-custom-field-btn">
              <Plus className="w-3 h-3 me-1" />
              {t("crmOpportunities.pipelinesPage.addBtn")}
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          {coreFieldKeys.map((fk) => (
            <div key={fk} className="flex items-center gap-2" data-testid={`inspector-${selectedStage.stageKey}-exit-field-${fk}`}>
              <Checkbox id={`stage-exit-${fk}`} checked={selectedStage.requiredExitFields.includes(fk)} onCheckedChange={(v) => onToggleExitField(fk, Boolean(v))} />
              <Label htmlFor={`stage-exit-${fk}`} className="text-xs cursor-pointer">{formatExitFieldLabel(fk, t, isAr, crmCustomFields)}</Label>
            </div>
          ))}
          {crmCustomFields.map((cf) => {
            const fk = `custom:${cf.key}`;
            return (
              <div key={fk} className="flex items-center gap-2" data-testid={`inspector-${selectedStage.stageKey}-exit-field-${fk}`}>
                <Checkbox id={`stage-cf-${cf.key}`} checked={selectedStage.requiredExitFields.includes(fk)} onCheckedChange={(v) => onToggleExitField(fk, Boolean(v))} />
                <Label htmlFor={`stage-cf-${cf.key}`} className="text-xs cursor-pointer">{isAr ? cf.labelAr : cf.labelEn}</Label>
              </div>
            );
          })}
        </div>

        {canCreateCustomField && showCfForm && (
          <div className="pt-2 border-t border-nx-line space-y-1.5">
            <Input value={newCfKey} onChange={(e) => onNewCfKeyChange(e.target.value)} placeholder="field_key" className="h-7 text-xs font-mono" data-testid="workflow-cf-key-input" />
            <div className="grid grid-cols-2 gap-1.5">
              <Input value={newCfNameEn} onChange={(e) => onNewCfNameEnChange(e.target.value)} placeholder={t("crmOpportunities.pipelinesPage.newCustomFieldEnPlaceholder")} className="h-7 text-xs" data-testid="workflow-cf-label-input" />
              <Input dir="rtl" value={newCfNameAr} onChange={(e) => onNewCfNameArChange(e.target.value)} placeholder={t("crmOpportunities.pipelinesPage.newCustomFieldArPlaceholder")} className="h-7 text-xs" />
            </div>
            <Button size="sm" variant="outline" className="w-full h-7 text-xs" data-testid="workflow-cf-save-btn" onClick={onCreateCustomField}>
              <Plus className="w-3 h-3 me-1" />
              {t("crmOpportunities.pipelinesPage.addRequireOnStageBtn")}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-bold text-nx-ink block">
          {t("crmOpportunities.pipelinesPage.incomingTransitionsHeader")} ({incoming.length})
        </span>
        <div className="space-y-1">
          {incoming.map((tr) => (
            <div key={tr.id} onClick={() => onSelectTransition(tr.id)} className="rounded-md border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 flex items-center justify-between text-xs cursor-pointer hover:border-nx-line-hi">
              <span className="inline-flex items-center gap-1.5 font-medium text-nx-ink truncate"><Zap className="w-3 h-3 text-info shrink-0" />{isAr ? tr.nameAr : tr.nameEn}</span>
              <Badge variant="outline" className="text-[10px]">{tr.fromStageKey}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-nx-ink">{t("crmOpportunities.pipelinesPage.transitionsFromStatusHeader")} ({outgoing.length})</span>
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
    </>
  );
}
