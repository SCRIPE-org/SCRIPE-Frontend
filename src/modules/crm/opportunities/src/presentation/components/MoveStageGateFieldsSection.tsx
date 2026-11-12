"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Checkbox } from "@core/ui/checkbox";
import { Building2, Plus, ShieldAlert } from "lucide-react";
import { CustomFieldsSection, encodeCustomFieldName } from "@core/crud/customFieldsExtension";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

const CUSTOM_FIELD_VALUE_TYPES: CrmCustomFieldDefinition["valueType"][] = [
  "Text", "Number", "Currency", "Date", "Select", "Boolean",
];

export interface MoveStagePartyOption {
  partyId: string;
  accountId?: string;
  label: string;
  subtitle?: string;
}

export interface MoveStageGateFieldsSectionProps {
  t: (key: string, params?: Record<string, any>) => string;
  isRtl: boolean;
  opportunity: CrmOpportunity;
  effectivePartyId: string;
  targetStageKey: string;
  onTargetStageKeyChange: (val: string) => void;
  effectiveStages: Array<{ key: string; labelEn: string; labelAr: string; partyRequired?: boolean }>;
  currencyCode: string;
  needsPartyInput: boolean;
  selectedPartyId: string;
  partyOptions: MoveStagePartyOption[];
  onPartyChange: (val: string) => void;
  needsAmountInput: boolean;
  estimatedAmount: string;
  onEstimatedAmountChange: (val: string) => void;
  needsCloseDateInput: boolean;
  targetCloseDate: string;
  onTargetCloseDateChange: (val: string) => void;
  needsContactRoleInput: boolean;
  primaryContactRole: string;
  onPrimaryContactRoleChange: (val: string) => void;
  needsSolutionFitInput: boolean;
  solutionFitConfirmed: boolean;
  onSolutionFitConfirmedChange: (val: boolean) => void;
  oppCustomFieldConfigs: any[];
  requiredCustomFieldKeys?: string[];
  storeCustomFields?: CrmCustomFieldDefinition[];
  onAddCrmCustomField?: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => void;
  isOppCfLoading: boolean;
  onRefetchOppCustomFields: () => void;
  customFieldValues: Record<string, unknown>;
  onCustomFieldChange: (key: string, val: unknown) => void;
  isAdjacentForward: boolean;
  reason: string;
  onReasonChange: (val: string) => void;
  isSubmitting: boolean;
}

export function MoveStageGateFieldsSection({
  t, isRtl, opportunity, effectivePartyId, targetStageKey, onTargetStageKeyChange, effectiveStages,
  currencyCode, needsPartyInput, selectedPartyId, partyOptions, onPartyChange,
  needsAmountInput, estimatedAmount, onEstimatedAmountChange, needsCloseDateInput, targetCloseDate, onTargetCloseDateChange,
  needsContactRoleInput, primaryContactRole, onPrimaryContactRoleChange, needsSolutionFitInput, solutionFitConfirmed, onSolutionFitConfirmedChange,
  oppCustomFieldConfigs, requiredCustomFieldKeys = [], storeCustomFields = [], onAddCrmCustomField,
  isOppCfLoading, onRefetchOppCustomFields, customFieldValues, onCustomFieldChange, isAdjacentForward, reason, onReasonChange, isSubmitting,
}: MoveStageGateFieldsSectionProps) {
  const [showAddCf, setShowAddCf] = useState(false);
  const [newCfNameEn, setNewCfNameEn] = useState("");
  const [newCfKey, setNewCfKey] = useState("");
  const [newCfType, setNewCfType] = useState<CrmCustomFieldDefinition["valueType"]>("Text");

  const handleAddStageCf = () => {
    if (!newCfNameEn.trim() || !onAddCrmCustomField) return;
    const key = (newCfKey.trim() || newCfNameEn.trim()).toLowerCase().replace(/[^a-z0-9_]+/g, "_");
    onAddCrmCustomField({
      entityTypeKey: "crm.opportunity",
      key,
      labelEn: newCfNameEn.trim(),
      labelAr: newCfNameEn.trim(),
      valueType: newCfType,
      isRequired: false,
      defaultStageGateKey: targetStageKey,
    });
    setNewCfNameEn("");
    setNewCfKey("");
    setNewCfType("Text");
    setShowAddCf(false);
    onRefetchOppCustomFields();
  };

  const hasGateSection = needsAmountInput || needsCloseDateInput || needsContactRoleInput || needsSolutionFitInput || requiredCustomFieldKeys.length > 0;

  return (
    <>
      <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-nx-ink-3">{t("crmOpportunities.table.deal")}:</span>
          <span className="font-semibold text-nx-ink">{opportunity.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-nx-ink-3">{t("crmOpportunities.dialogs.stage.currentStage")}:</span>
          <span className="font-medium text-nx-ink">
            {isRtl && opportunity.stageLabelArSnapshot ? opportunity.stageLabelArSnapshot : opportunity.stageLabelEnSnapshot || opportunity.stageKey}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-nx-ink-3">{t("crmOpportunities.table.party")}:</span>
          <span className={effectivePartyId ? "text-success font-medium" : "text-warning font-medium"}>
            {effectivePartyId ? t("crmOpportunities.kanban.partyVerified") : t("crmOpportunities.kanban.partyUnlinked")}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="target-stage">{t("crmOpportunities.dialogs.stage.targetStageLabel")}</Label>
        <Select value={targetStageKey} onValueChange={onTargetStageKeyChange}>
          <SelectTrigger id="target-stage"><SelectValue /></SelectTrigger>
          <SelectContent>
            {effectiveStages.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {isRtl && s.labelAr ? s.labelAr : s.labelEn} {s.partyRequired ? `• (${t("crmOpportunities.dialogs.stage.accountContactRequired")})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsPartyInput && (
        <div className="space-y-2 rounded-nx-md border border-nx-accent/30 bg-nx-accent-wash/30 p-3">
          <Label className="text-xs font-semibold text-nx-ink flex items-center gap-1.5">
            <Building2 className="size-3.5 text-nx-accent" />
            <span>{t("crmOpportunities.dialogs.create.partyIdLabel")} <span className="text-destructive">*</span></span>
          </Label>
          <p className="text-[11px] text-nx-ink-2">{t("crmOpportunities.dialogs.stage.partyNotice")}</p>
          <Select value={selectedPartyId} onValueChange={onPartyChange}>
            <SelectTrigger className="h-9 text-xs bg-nx-surface border-nx-line">
              <SelectValue placeholder={t("crmOpportunities.dialogs.create.partyIdPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {partyOptions.map((opt) => <SelectItem key={opt.partyId} value={opt.partyId}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {hasGateSection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-nx-md border border-nx-line bg-nx-raised/40 p-3">
          {needsAmountInput && (
            <div className="space-y-1">
              <Label htmlFor="stage-gate-amount" className="text-xs">{t("crmOpportunities.dialogs.create.amountLabel")} ({currencyCode}) <span className="text-destructive">*</span></Label>
              <Input id="stage-gate-amount" type="number" min="0.01" step="any" value={estimatedAmount} onChange={(e) => onEstimatedAmountChange(e.target.value)} className="h-8 text-xs" />
            </div>
          )}
          {needsCloseDateInput && (
            <div className="space-y-1">
              <Label htmlFor="stage-gate-close-date" className="text-xs">{t("crmOpportunities.dialogs.create.closeDateLabel")} <span className="text-destructive">*</span></Label>
              <Input id="stage-gate-close-date" type="date" value={targetCloseDate} onChange={(e) => onTargetCloseDateChange(e.target.value)} className="h-8 text-xs" />
            </div>
          )}
          {needsContactRoleInput && (
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="stage-gate-contact-role" className="text-xs">{t("crmOpportunities.dialogs.pipelineAdmin.exitFields.primaryContactRole")} <span className="text-destructive">*</span></Label>
              <Select value={primaryContactRole} onValueChange={onPrimaryContactRoleChange}>
                <SelectTrigger id="stage-gate-contact-role" className="h-8 text-xs bg-nx-surface">
                  <SelectValue placeholder={t("crmOpportunities.dialogs.stage.selectStakeholderRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Decision Maker">{t("crmOpportunities.dialogs.stage.roles.decisionMaker")}</SelectItem>
                  <SelectItem value="Executive Sponsor">{t("crmOpportunities.dialogs.stage.roles.executiveSponsor")}</SelectItem>
                  <SelectItem value="Technical Evaluator">{t("crmOpportunities.dialogs.stage.roles.technicalEvaluator")}</SelectItem>
                  <SelectItem value="Procurement / Commercial">{t("crmOpportunities.dialogs.stage.roles.procurementCommercial")}</SelectItem>
                  <SelectItem value="Champion">{t("crmOpportunities.dialogs.stage.roles.champion")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {needsSolutionFitInput && (
            <div className="flex items-center gap-2 sm:col-span-2 pt-1">
              <Checkbox id="stage-gate-solution-fit" checked={solutionFitConfirmed} onCheckedChange={(checked) => onSolutionFitConfirmedChange(Boolean(checked))} />
              <Label htmlFor="stage-gate-solution-fit" className="text-xs font-medium text-nx-ink cursor-pointer">
                {t("crmOpportunities.dialogs.pipelineAdmin.exitFields.solutionFitConfirmed")} <span className="text-destructive">*</span>
              </Label>
            </div>
          )}
          {requiredCustomFieldKeys.map((cfKey) => {
            const def = storeCustomFields.find((f) => f.key === cfKey);
            const encodedKey = encodeCustomFieldName(cfKey);
            const label = def ? (isRtl && def.labelAr ? def.labelAr : def.labelEn) : cfKey;
            const vType = def?.valueType ?? "Text";
            const currentVal = customFieldValues[encodedKey] ?? customFieldValues[cfKey] ?? "";
            if (vType === "Boolean") {
              return (
                <div key={cfKey} className="flex items-center gap-2 sm:col-span-2 pt-1" data-testid={`move-stage-gate-cf-${cfKey}`}>
                  <Checkbox id={`stage-gate-cf-${cfKey}`} checked={Boolean(currentVal)} onCheckedChange={(checked) => { onCustomFieldChange(encodedKey, Boolean(checked)); onCustomFieldChange(cfKey, Boolean(checked)); }} />
                  <Label htmlFor={`stage-gate-cf-${cfKey}`} className="text-xs font-medium text-nx-ink cursor-pointer">{label} <span className="text-destructive">*</span></Label>
                </div>
              );
            }
            return (
              <div key={cfKey} className="space-y-1 sm:col-span-2" data-testid={`move-stage-gate-cf-${cfKey}`}>
                <Label htmlFor={`stage-gate-cf-${cfKey}`} className="text-xs">{label} <span className="text-destructive">*</span></Label>
                <Input
                  id={`stage-gate-cf-${cfKey}`}
                  type={vType === "Number" || vType === "Currency" ? "number" : vType === "Date" ? "date" : "text"}
                  value={String(currentVal)}
                  onChange={(e) => { onCustomFieldChange(encodedKey, e.target.value); onCustomFieldChange(cfKey, e.target.value); }}
                  className="h-8 text-xs"
                  data-testid={`move-stage-gate-cf-input-${cfKey}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {onAddCrmCustomField && (
        <div className="rounded-nx-md border border-nx-line bg-nx-surface/60 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-nx-ink-2">{t("crmOpportunities.dialogs.stage.stageCustomFieldsTitle")}</span>
            <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => setShowAddCf((v) => !v)} data-testid="move-stage-add-cf-toggle-btn">
              <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.dialogs.stage.addFieldBtn")}
            </Button>
          </div>
          {showAddCf && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 border-t border-nx-line">
              <Input value={newCfNameEn} onChange={(e) => setNewCfNameEn(e.target.value)} placeholder={t("crmOpportunities.dialogs.stage.fieldLabelPlaceholder")} className="h-7 text-xs" data-testid="move-stage-cf-label-input" />
              <Input value={newCfKey} onChange={(e) => setNewCfKey(e.target.value)} placeholder={t("crmOpportunities.dialogs.stage.fieldKeyOptionalPlaceholder")} className="h-7 text-xs font-mono" data-testid="move-stage-cf-key-input" />
              <div className="flex items-center gap-1.5">
                <Select value={newCfType} onValueChange={(v) => setNewCfType(v as CrmCustomFieldDefinition["valueType"])}>
                  <SelectTrigger className="h-7 text-xs bg-nx-surface flex-1" data-testid="move-stage-cf-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[10002]">
                    {CUSTOM_FIELD_VALUE_TYPES.map((vt) => <SelectItem key={vt} value={vt} className="text-xs">{vt}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs shrink-0" onClick={handleAddStageCf} data-testid="move-stage-cf-save-btn">{t("crmOpportunities.dialogs.stage.addBtn")}</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <CustomFieldsSection
        entityTypeKey="crm.opportunity"
        entityDisplayName={t("crmOpportunities.title") || "Commercial Opportunity"}
        configs={oppCustomFieldConfigs}
        isLoading={isOppCfLoading}
        onFieldCreated={onRefetchOppCustomFields}
        values={customFieldValues}
        onChange={onCustomFieldChange}
        disabled={isSubmitting}
      />

      <div className={!isAdjacentForward ? "space-y-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3" : "space-y-1.5"}>
        {!isAdjacentForward && (
          <div className="flex items-center gap-2 text-warning text-xs font-semibold">
            <ShieldAlert className="size-4" />
            <span>{t("crmOpportunities.dialogs.stage.overrideNotice")}</span>
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="stage-reason" className="text-xs">
            {!isAdjacentForward ? t("crmOpportunities.dialogs.stage.reasonLabel") : t("crmOpportunities.dialogs.stage.transitionNoteLabel")}{" "}
            {!isAdjacentForward && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            id="stage-reason"
            placeholder={!isAdjacentForward ? t("crmOpportunities.dialogs.stage.reasonPlaceholder") : t("crmOpportunities.dialogs.stage.transitionNotePlaceholder")}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </>
  );
}
