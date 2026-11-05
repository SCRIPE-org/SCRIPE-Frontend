"use client";

import React, { useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, ShieldCheck, Trash2, Zap } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "./CrmWorkflowCanvas2D";
import { formatExitFieldLabel } from "./CrmWorkflowCanvasSubViews";

const CORE_EXIT_FIELD_KEYS = [
  "partyId",
  "estimatedAmount",
  "targetCloseDate",
  "primaryContactRole",
  "solutionFitConfirmed",
];

export interface CrmWorkflowTransitionInspectorProps {
  t: (k: string) => string;
  isAr: boolean;
  stages: CrmWorkflowStageNode[];
  selectedTransition: CrmWorkflowTransition;
  crmCustomFields: CrmCustomFieldDefinition[];
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
}

export function CrmWorkflowTransitionInspector({
  t,
  isAr,
  stages,
  selectedTransition,
  crmCustomFields,
  onTransitionChange,
  onDeleteTransition,
}: CrmWorkflowTransitionInspectorProps) {
  const [openSection, setOpenSection] = useState<
    "restrict" | "input" | "validate" | "actions" | null
  >("validate");

  const stageLabel = (key: string) => {
    if (key === "*") return t("crmOpportunities.pipelinesPage.anyStageGlobal");
    const found = stages.find((s) => s.stageKey === key);
    return found ? (isAr ? found.labelAr : found.labelEn) : key;
  };

  const toggleField = (fieldKey: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selectedTransition.requiredFields, fieldKey]))
      : selectedTransition.requiredFields.filter((f) => f !== fieldKey);
    onTransitionChange({ ...selectedTransition, requiredFields: next });
  };

  return (
    <div
      className="w-80 lg:w-96 border-s border-nx-line bg-nx-surface flex flex-col overflow-y-auto p-4 space-y-4 shrink-0"
      data-testid="workflow-inspector-panel"
    >
      <div className="flex items-center justify-between pb-3 border-b border-nx-line">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-nx-ink-3 block">
            {t("crmOpportunities.pipelinesPage.transitionInspectorEyebrow")}
          </span>
          <h3 className="text-sm font-bold text-nx-ink flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-warning" />
            {isAr ? selectedTransition.nameAr : selectedTransition.nameEn}
          </h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive"
          onClick={() => onDeleteTransition(selectedTransition.id)}
          title={t("crmOpportunities.pipelinesPage.deleteTransitionTitle")}
          data-testid="inspector-delete-transition-btn"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Path Summary */}
      <div className="rounded-md border border-nx-line bg-nx-raised px-3 py-2 flex items-center justify-between gap-2 text-xs">
        <Badge variant="outline" className="text-[10px] text-nx-ink font-semibold truncate">
          {stageLabel(selectedTransition.fromStageKey)}
        </Badge>
        <ArrowRight className="w-3.5 h-3.5 text-nx-ink-3 shrink-0" />
        <Badge variant="secondary" className="text-[10px] text-nx-ink font-semibold truncate">
          {stageLabel(selectedTransition.toStageKey)}
        </Badge>
      </div>

      {/* Bilingual Action Labels */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px]">
            {t("crmOpportunities.pipelinesPage.actionLabelEn")}
          </Label>
          <Input
            value={selectedTransition.nameEn}
            onChange={(e) =>
              onTransitionChange({ ...selectedTransition, nameEn: e.target.value })
            }
            className="h-8 text-xs"
            data-testid="inspector-transition-name-en"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">
            {t("crmOpportunities.pipelinesPage.actionLabelAr")}
          </Label>
          <Input
            dir="rtl"
            value={selectedTransition.nameAr}
            onChange={(e) =>
              onTransitionChange({ ...selectedTransition, nameAr: e.target.value })
            }
            className="h-8 text-xs"
            data-testid="inspector-transition-name-ar"
          />
        </div>
      </div>

      {/* Card 1: Restrict Transition */}
      <div className="rounded-md border border-nx-line bg-nx-raised/40 overflow-hidden">
        <Button
          variant="ghost"
          onClick={() => setOpenSection(openSection === "restrict" ? null : "restrict")}
          data-testid="transition-rule-card-restrict"
          className="w-full justify-between px-3 py-2 h-auto text-xs font-bold text-nx-ink"
        >
          <span>{t("crmOpportunities.pipelinesPage.rule1RestrictTitle")}</span>
          {openSection === "restrict" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </Button>
        {openSection === "restrict" && (
          <div className="p-3 pt-1 space-y-2 border-t border-nx-line bg-nx-surface">
            <div className="flex items-center gap-2">
              <Checkbox
                id="tr-allow-rollback"
                checked={selectedTransition.allowRollback ?? true}
                onCheckedChange={(v) =>
                  onTransitionChange({ ...selectedTransition, allowRollback: Boolean(v) })
                }
                data-testid="transition-rule-allow-rollback"
              />
              <Label htmlFor="tr-allow-rollback" className="text-xs cursor-pointer">
                {t("crmOpportunities.pipelinesPage.rule1RestrictDesc")}
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Request Input */}
      <div className="rounded-md border border-nx-line bg-nx-raised/40 overflow-hidden">
        <Button
          variant="ghost"
          onClick={() => setOpenSection(openSection === "input" ? null : "input")}
          data-testid="transition-rule-card-input"
          className="w-full justify-between px-3 py-2 h-auto text-xs font-bold text-nx-ink"
        >
          <span>{t("crmOpportunities.pipelinesPage.rule2InputScreenTitle")}</span>
          {openSection === "input" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </Button>
        {openSection === "input" && (
          <div className="p-3 pt-1 space-y-2 border-t border-nx-line bg-nx-surface">
            <div className="flex items-center gap-2">
              <Checkbox
                id="tr-require-reason"
                checked={Boolean(selectedTransition.requireReason)}
                onCheckedChange={(v) =>
                  onTransitionChange({ ...selectedTransition, requireReason: Boolean(v) })
                }
                data-testid="transition-rule-prompt-comment"
              />
              <Label htmlFor="tr-require-reason" className="text-xs cursor-pointer">
                {t("crmOpportunities.pipelinesPage.requireStructuredReasonToggle")}
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Card 3: Validate Details */}
      <div className="rounded-md border border-nx-line bg-nx-raised/40 overflow-hidden">
        <Button
          variant="ghost"
          onClick={() => setOpenSection(openSection === "validate" ? null : "validate")}
          data-testid="transition-rule-card-validate"
          className="w-full justify-between px-3 py-2 h-auto text-xs font-bold text-nx-ink"
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-info" />
            {t("crmOpportunities.pipelinesPage.rule3ValidatorsTitle")}
          </span>
          {openSection === "validate" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </Button>
        {openSection === "validate" && (
          <div className="p-3 pt-1 space-y-1.5 border-t border-nx-line bg-nx-surface">
            {CORE_EXIT_FIELD_KEYS.map((fk) => (
              <div key={fk} className="flex items-center gap-2">
                <Checkbox
                  id={`tr-field-${fk}`}
                  checked={selectedTransition.requiredFields.includes(fk)}
                  onCheckedChange={(v) => toggleField(fk, Boolean(v))}
                />
                <Label htmlFor={`tr-field-${fk}`} className="text-xs cursor-pointer">
                  {formatExitFieldLabel(fk, t, isAr, crmCustomFields)}
                </Label>
              </div>
            ))}
            {crmCustomFields.map((cf) => {
              const fk = `custom:${cf.key}`;
              return (
                <div key={fk} className="flex items-center gap-2">
                  <Checkbox
                    id={`tr-cf-${cf.key}`}
                    checked={selectedTransition.requiredFields.includes(fk)}
                    onCheckedChange={(v) => toggleField(fk, Boolean(v))}
                  />
                  <Label htmlFor={`tr-cf-${cf.key}`} className="text-xs cursor-pointer">
                    {isAr ? cf.labelAr : cf.labelEn}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card 4: Perform Actions */}
      <div className="rounded-md border border-nx-line bg-nx-raised/40 overflow-hidden">
        <Button
          variant="ghost"
          onClick={() => setOpenSection(openSection === "actions" ? null : "actions")}
          data-testid="transition-rule-card-actions"
          className="w-full justify-between px-3 py-2 h-auto text-xs font-bold text-nx-ink"
        >
          <span>{t("crmOpportunities.pipelinesPage.rule4PostActionsTitle")}</span>
          {openSection === "actions" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </Button>
        {openSection === "actions" && (
          <div className="p-3 pt-1 space-y-2 border-t border-nx-line bg-nx-surface">
            <div className="flex items-center gap-2">
              <Checkbox
                id="tr-convert-deal"
                checked={Boolean(selectedTransition.triggerDealConversion)}
                onCheckedChange={(v) =>
                  onTransitionChange({ ...selectedTransition, triggerDealConversion: Boolean(v) })
                }
                data-testid="transition-action-convert-deal"
              />
              <Label htmlFor="tr-convert-deal" className="text-xs cursor-pointer">
                {t("crmOpportunities.pipelinesPage.convertsToDealToggleTitle")}
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
