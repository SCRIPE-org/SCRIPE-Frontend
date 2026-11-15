"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { formatExitFieldLabel } from "./CrmWorkflowCanvasSubViews";
import { CrmWorkflowStagePlaybookAndLocksSection } from "./CrmWorkflowStagePlaybookAndLocksSection";

const CUSTOM_FIELD_VALUE_TYPES: CrmCustomFieldDefinition["valueType"][] = [
  "Text", "Number", "Currency", "Date", "Select", "Boolean",
];

export interface CrmWorkflowStageExitGatesSectionProps {
  t: (k: string) => string;
  isAr: boolean;
  stages: CrmWorkflowStageNode[];
  selectedStage: CrmWorkflowStageNode;
  crmCustomFields: CrmCustomFieldDefinition[];
  coreFieldKeys: string[];
  incoming: CrmWorkflowTransition[];
  outgoing: CrmWorkflowTransition[];
  allowInboundFromAny?: boolean;
  onToggleAllowAnyTransition?: (stageKey: string, allowed: boolean) => void;
  showCfForm: boolean;
  onToggleCfForm: () => void;
  newCfKey: string;
  onNewCfKeyChange: (v: string) => void;
  newCfNameEn: string;
  onNewCfNameEnChange: (v: string) => void;
  newCfNameAr: string;
  onNewCfNameArChange: (v: string) => void;
  newCfType?: CrmCustomFieldDefinition["valueType"];
  onNewCfTypeChange?: (v: CrmCustomFieldDefinition["valueType"]) => void;
  onCreateCustomField: () => void;
  onToggleExitField: (fieldKey: string, checked: boolean) => void;
  onSelectTransition: (transitionId: string) => void;
  onCreateTransition: (fromStageKey?: string, toStageKey?: string) => void;
  onStageChange?: (updated: CrmWorkflowStageNode) => void;
  canCreateCustomField: boolean;
}

/**
 * Pure declarative Stage Exit Validators, Playbooks, Field-Locking, and Transitions section (<195 lines).
 */
export function CrmWorkflowStageExitGatesSection({
  t, isAr, stages, selectedStage, crmCustomFields, coreFieldKeys, incoming, outgoing,
  allowInboundFromAny, onToggleAllowAnyTransition,
  showCfForm, onToggleCfForm, newCfKey, onNewCfKeyChange, newCfNameEn, onNewCfNameEnChange,
  newCfNameAr, onNewCfNameArChange, newCfType = "Text", onNewCfTypeChange,
  onCreateCustomField, onToggleExitField, onSelectTransition, onCreateTransition, onStageChange, canCreateCustomField,
}: CrmWorkflowStageExitGatesSectionProps) {
  const [incomingOpen, setIncomingOpen] = useState(true);
  const [outgoingOpen, setOutgoingOpen] = useState(true);
  const isAnyAllowed = allowInboundFromAny ?? Boolean(selectedStage.allowInboundFromAny || incoming.some((tr) => tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")));

  return (
    <>
      <div className="rounded-md border border-nx-line bg-nx-raised/40 p-2.5 flex items-center gap-2.5">
        <Checkbox
          id={`stage-allow-any-${selectedStage.stageKey}`}
          checked={isAnyAllowed}
          onCheckedChange={(v) => onToggleAllowAnyTransition?.(selectedStage.stageKey, Boolean(v))}
          data-testid="inspector-allow-any-inbound-checkbox"
        />
        <Label htmlFor={`stage-allow-any-${selectedStage.stageKey}`} className="text-xs cursor-pointer font-semibold text-nx-ink">
          {t("crmOpportunities.pipelinesPage.allowTransitionsFromAnyStatusLabel")}
        </Label>
      </div>

      <div className="rounded-md border border-nx-line bg-nx-raised/30 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-nx-ink inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-info" />
            {t("crmOpportunities.pipelinesPage.mandatoryExitGateRulesHeader")}
          </span>
          {canCreateCustomField && (
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={onToggleCfForm} data-testid="workflow-create-custom-field-btn">
              <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.pipelinesPage.addBtn")}
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
              <div key={fk} className="flex items-center justify-between gap-2" data-testid={`inspector-${selectedStage.stageKey}-exit-field-${fk}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox id={`stage-cf-${cf.key}`} checked={selectedStage.requiredExitFields.includes(fk)} onCheckedChange={(v) => onToggleExitField(fk, Boolean(v))} />
                  <Label htmlFor={`stage-cf-${cf.key}`} className="text-xs cursor-pointer truncate">{isAr ? cf.labelAr : cf.labelEn}</Label>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 shrink-0">{cf.valueType}</Badge>
              </div>
            );
          })}
        </div>

        {canCreateCustomField && showCfForm && (
          <div className="pt-2 border-t border-nx-line space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <Input value={newCfKey} onChange={(e) => onNewCfKeyChange(e.target.value)} placeholder="field_key" className="h-7 text-xs font-mono" data-testid="workflow-cf-key-input" />
              <Select value={newCfType} onValueChange={(v) => onNewCfTypeChange?.(v as CrmCustomFieldDefinition["valueType"])}>
                <SelectTrigger className="h-7 text-xs bg-nx-surface" data-testid="workflow-cf-type-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUSTOM_FIELD_VALUE_TYPES.map((vt) => <SelectItem key={vt} value={vt} className="text-xs">{vt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Input value={newCfNameEn} onChange={(e) => onNewCfNameEnChange(e.target.value)} placeholder={t("crmOpportunities.pipelinesPage.newCustomFieldEnPlaceholder")} className="h-7 text-xs" data-testid="workflow-cf-label-input" />
              <Input dir="rtl" value={newCfNameAr} onChange={(e) => onNewCfNameArChange(e.target.value)} placeholder={t("crmOpportunities.pipelinesPage.newCustomFieldArPlaceholder")} className="h-7 text-xs" />
            </div>
            <Button size="sm" variant="outline" className="w-full h-7 text-xs" data-testid="workflow-cf-save-btn" onClick={onCreateCustomField}>
              <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.pipelinesPage.addRequireOnStageBtn")}
            </Button>
          </div>
        )}
      </div>

      <CrmWorkflowStagePlaybookAndLocksSection isAr={isAr} selectedStage={selectedStage} onStageChange={onStageChange} />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Button size="sm" variant="ghost" className="h-6 px-1 text-xs font-bold text-nx-ink inline-flex items-center gap-1" onClick={() => setIncomingOpen((v) => !v)} data-testid="toggle-incoming-transitions-btn">
            {incomingOpen ? <ChevronDown className="w-3.5 h-3.5 text-nx-ink-3" /> : <ChevronRight className="w-3.5 h-3.5 text-nx-ink-3" />}
            {t("crmOpportunities.pipelinesPage.incomingTransitionsHeader")} ({incoming.length})
          </Button>
          <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onCreateTransition(undefined, selectedStage.stageKey)} data-testid="inspector-add-incoming-transition-btn">
            <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.pipelinesPage.addBtn")}
          </Button>
        </div>
        {incomingOpen && (
          <div className="space-y-1">
            {incoming.map((tr) => {
              const sourceStage = stages.find((s) => s.stageKey === tr.fromStageKey);
              const sourceLabel = tr.fromStageKey === "*" ? t("crmOpportunities.pipelinesPage.anyStageGlobal") : sourceStage ? (isAr ? sourceStage.labelAr : sourceStage.labelEn) : tr.fromStageKey;
              return (
                <Button type="button" variant="ghost" key={tr.id} onClick={() => onSelectTransition(tr.id)} className="w-full h-auto rounded-md border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 justify-between text-xs hover:border-nx-line-hi hover:bg-nx-raised/60" data-testid={`inspector-incoming-tr-${tr.id}`}>
                  <span className="inline-flex items-center gap-1.5 font-medium text-nx-ink truncate"><Zap className="w-3 h-3 text-info shrink-0" />{isAr ? tr.nameAr : tr.nameEn}</span>
                  <Badge variant="outline" className="text-[10px]">{sourceLabel}</Badge>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Button size="sm" variant="ghost" className="h-6 px-1 text-xs font-bold text-nx-ink inline-flex items-center gap-1" onClick={() => setOutgoingOpen((v) => !v)} data-testid="toggle-outgoing-transitions-btn">
            {outgoingOpen ? <ChevronDown className="w-3.5 h-3.5 text-nx-ink-3" /> : <ChevronRight className="w-3.5 h-3.5 text-nx-ink-3" />}
            {t("crmOpportunities.pipelinesPage.transitionsFromStatusHeader")} ({outgoing.length})
          </Button>
          <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onCreateTransition(selectedStage.stageKey, undefined)} data-testid="inspector-add-outgoing-transition-btn">
            <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.pipelinesPage.addBtn")}
          </Button>
        </div>
        {outgoingOpen && (
          <div className="space-y-1.5">
            {outgoing.map((tr) => {
              const targetStage = stages.find((s) => s.stageKey === tr.toStageKey);
              const targetLabel = targetStage ? (isAr ? targetStage.labelAr : targetStage.labelEn) : tr.toStageKey;
              return (
                <Button type="button" variant="ghost" key={tr.id} onClick={() => onSelectTransition(tr.id)} className="w-full h-auto rounded-md border border-nx-line bg-nx-raised/50 px-2.5 py-1.5 justify-between text-xs hover:border-nx-line-hi hover:bg-nx-raised/70" data-testid={`inspector-outgoing-tr-${tr.id}`}>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-nx-ink truncate"><Zap className="w-3 h-3 text-nx-warning-strong shrink-0" />{isAr ? tr.nameAr : tr.nameEn}</span>
                  <Badge variant="outline" className="text-[10px]">{targetLabel}</Badge>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
