"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Checkbox } from "@core/ui/checkbox";
import { Building2, ShieldAlert } from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

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
  t,
  isRtl,
  opportunity,
  effectivePartyId,
  targetStageKey,
  onTargetStageKeyChange,
  effectiveStages,
  currencyCode,
  needsPartyInput,
  selectedPartyId,
  partyOptions,
  onPartyChange,
  needsAmountInput,
  estimatedAmount,
  onEstimatedAmountChange,
  needsCloseDateInput,
  targetCloseDate,
  onTargetCloseDateChange,
  needsContactRoleInput,
  primaryContactRole,
  onPrimaryContactRoleChange,
  needsSolutionFitInput,
  solutionFitConfirmed,
  onSolutionFitConfirmedChange,
  oppCustomFieldConfigs,
  isOppCfLoading,
  onRefetchOppCustomFields,
  customFieldValues,
  onCustomFieldChange,
  isAdjacentForward,
  reason,
  onReasonChange,
  isSubmitting,
}: MoveStageGateFieldsSectionProps) {
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
            {isRtl && opportunity.stageLabelArSnapshot
              ? opportunity.stageLabelArSnapshot
              : opportunity.stageLabelEnSnapshot || opportunity.stageKey}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-nx-ink-3">{t("crmOpportunities.table.party")}:</span>
          <span className={effectivePartyId ? "text-success font-medium" : "text-warning font-medium"}>
            {effectivePartyId
              ? t("crmOpportunities.kanban.partyVerified", { defaultValue: "Verified Account / Contact Linked" })
              : t("crmOpportunities.kanban.partyUnlinked", { defaultValue: "Not Linked Yet" })}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="target-stage">{t("crmOpportunities.dialogs.stage.targetStageLabel")}</Label>
        <Select value={targetStageKey} onValueChange={onTargetStageKeyChange}>
          <SelectTrigger id="target-stage">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {effectiveStages.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {isRtl && s.labelAr ? s.labelAr : s.labelEn} {s.partyRequired ? "• (Account/Contact Required)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsPartyInput && (
        <div className="space-y-2 rounded-nx-md border border-nx-accent/30 bg-nx-accent-wash/30 p-3">
          <Label className="text-xs font-semibold text-nx-ink flex items-center gap-1.5">
            <Building2 className="size-3.5 text-nx-accent" />
            <span>
              {t("crmOpportunities.dialogs.create.partyIdLabel", { defaultValue: "Link Account or Contact" })}{" "}
              <span className="text-destructive">*</span>
            </span>
          </Label>
          <p className="text-[11px] text-nx-ink-2">{t("crmOpportunities.dialogs.stage.partyNotice")}</p>
          <Select value={selectedPartyId} onValueChange={onPartyChange}>
            <SelectTrigger className="h-9 text-xs bg-nx-surface border-nx-line">
              <SelectValue
                placeholder={t("crmOpportunities.dialogs.create.partyIdPlaceholder", {
                  defaultValue: "Select an Account or Contact...",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              {partyOptions.map((opt) => (
                <SelectItem key={opt.partyId} value={opt.partyId}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(needsAmountInput || needsCloseDateInput || needsContactRoleInput || needsSolutionFitInput) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-nx-md border border-nx-line bg-nx-raised/40 p-3">
          {needsAmountInput && (
            <div className="space-y-1">
              <Label htmlFor="stage-gate-amount" className="text-xs">
                {t("crmOpportunities.dialogs.create.amountLabel")} ({currencyCode}){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stage-gate-amount"
                type="number"
                min="0.01"
                step="any"
                value={estimatedAmount}
                onChange={(e) => onEstimatedAmountChange(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}
          {needsCloseDateInput && (
            <div className="space-y-1">
              <Label htmlFor="stage-gate-close-date" className="text-xs">
                {t("crmOpportunities.dialogs.create.closeDateLabel")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stage-gate-close-date"
                type="date"
                value={targetCloseDate}
                onChange={(e) => onTargetCloseDateChange(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}
          {needsContactRoleInput && (
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="stage-gate-contact-role" className="text-xs">
                {t("crmOpportunities.pipelineAdmin.exitFields.primaryContactRole", {
                  defaultValue: "Primary Contact Role",
                })}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select value={primaryContactRole} onValueChange={onPrimaryContactRoleChange}>
                <SelectTrigger id="stage-gate-contact-role" className="h-8 text-xs bg-nx-surface">
                  <SelectValue
                    placeholder={t("crmOpportunities.dialogs.stage.selectStakeholderRole", {
                      defaultValue: "Select stakeholder role...",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                  <SelectItem value="Executive Sponsor">Executive Sponsor</SelectItem>
                  <SelectItem value="Technical Evaluator">Technical Evaluator</SelectItem>
                  <SelectItem value="Procurement / Commercial">Procurement / Commercial</SelectItem>
                  <SelectItem value="Champion">Champion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {needsSolutionFitInput && (
            <div className="flex items-center gap-2 sm:col-span-2 pt-1">
              <Checkbox
                id="stage-gate-solution-fit"
                checked={solutionFitConfirmed}
                onCheckedChange={(checked) => onSolutionFitConfirmedChange(Boolean(checked))}
              />
              <Label htmlFor="stage-gate-solution-fit" className="text-xs font-medium text-nx-ink cursor-pointer">
                {t("crmOpportunities.pipelineAdmin.exitFields.solutionFitConfirmed", {
                  defaultValue: "Solution Fit Confirmed",
                })}{" "}
                <span className="text-destructive">*</span>
              </Label>
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

      <div
        className={
          !isAdjacentForward ? "space-y-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3" : "space-y-1.5"
        }
      >
        {!isAdjacentForward && (
          <div className="flex items-center gap-2 text-warning text-xs font-semibold">
            <ShieldAlert className="size-4" />
            <span>{t("crmOpportunities.dialogs.stage.overrideNotice")}</span>
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="stage-reason" className="text-xs">
            {!isAdjacentForward
              ? t("crmOpportunities.dialogs.stage.reasonLabel")
              : t("crmOpportunities.dialogs.stage.transitionNoteLabel", {
                  defaultValue: "Stage Transition Comment / Note",
                })}{" "}
            {!isAdjacentForward && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            id="stage-reason"
            placeholder={
              !isAdjacentForward
                ? t("crmOpportunities.dialogs.stage.reasonPlaceholder")
                : t("crmOpportunities.dialogs.stage.transitionNotePlaceholder", {
                    defaultValue: "Record key takeaways, stakeholder feedback, or stage exit notes...",
                  })
            }
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </>
  );
}
