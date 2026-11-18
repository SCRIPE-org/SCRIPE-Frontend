"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Checkbox } from "@core/ui/checkbox";
import { Building2, ShieldAlert } from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import { CrmEntitySearchSelect, type CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";
import { MoveStageExtraGateInputs } from "./MoveStageExtraGateInputs";
import { MoveStageInlineCustomFieldCreator } from "./MoveStageInlineCustomFieldCreator";
import { MoveStageSummaryBanner } from "./MoveStageSummaryBanner";

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
  partyOptions?: MoveStagePartyOption[];
  onPartyChange: (val: string, accountId?: string | null) => void;
  needsContactIdInput: boolean;
  selectedContactId: string;
  onContactChange: (val: string) => void;
  needsAccountIdInput: boolean;
  selectedAccountId: string;
  onAccountChange: (val: string) => void;
  needsOwnerUserIdInput: boolean;
  selectedOwnerUserId: string;
  onOwnerChange: (val: string) => void;
  needsDiscountPercentInput: boolean;
  discountPercent: string;
  onDiscountPercentChange: (val: string) => void;
  needsNextStepInput: boolean;
  nextStepSummary: string;
  onNextStepSummaryChange: (val: string) => void;
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
  currencyCode, needsPartyInput, selectedPartyId, onPartyChange,
  needsContactIdInput, selectedContactId, onContactChange,
  needsAccountIdInput, selectedAccountId, onAccountChange,
  needsOwnerUserIdInput, selectedOwnerUserId, onOwnerChange,
  needsDiscountPercentInput, discountPercent, onDiscountPercentChange,
  needsNextStepInput, nextStepSummary, onNextStepSummaryChange,
  needsAmountInput, estimatedAmount, onEstimatedAmountChange, needsCloseDateInput, targetCloseDate, onTargetCloseDateChange,
  needsContactRoleInput, primaryContactRole, onPrimaryContactRoleChange, needsSolutionFitInput, solutionFitConfirmed, onSolutionFitConfirmedChange,
  oppCustomFieldConfigs, requiredCustomFieldKeys = [], storeCustomFields = [], onAddCrmCustomField,
  isOppCfLoading, onRefetchOppCustomFields, customFieldValues, onCustomFieldChange, isAdjacentForward, reason, onReasonChange, isSubmitting,
}: MoveStageGateFieldsSectionProps) {
  const hasGateSection =
    needsAmountInput ||
    needsCloseDateInput ||
    needsContactRoleInput ||
    needsSolutionFitInput ||
    needsContactIdInput ||
    needsAccountIdInput ||
    needsOwnerUserIdInput ||
    needsDiscountPercentInput ||
    needsNextStepInput ||
    requiredCustomFieldKeys.length > 0;

  return (
    <>
      <MoveStageSummaryBanner
        t={t}
        isRtl={isRtl}
        opportunity={opportunity}
        effectivePartyId={effectivePartyId}
        targetStageKey={targetStageKey}
        onTargetStageKeyChange={onTargetStageKeyChange}
        effectiveStages={effectiveStages}
      />

      {needsPartyInput && (
        <div className="space-y-2 rounded-nx-md border border-nx-accent/30 bg-nx-accent-wash p-3">
          <Label className="text-xs font-semibold text-nx-ink flex items-center gap-1.5">
            <Building2 className="size-3.5 text-nx-accent" />
            <span>{t("crmOpportunities.dialogs.create.partyIdLabel")} <span className="text-destructive">*</span></span>
          </Label>
          <p className="text-[11px] text-nx-ink-2">{t("crmOpportunities.dialogs.stage.partyNotice")}</p>
          <CrmEntitySearchSelect
            entityKind="party"
            value={selectedPartyId}
            initialLabel={opportunity.partyDisplayName || opportunity.accountDisplayName || undefined}
            onChange={(val, item) => onPartyChange(val, item?.accountId)}
            placeholder={t("crmOpportunities.dialogs.create.partyIdPlaceholder")}
            enableQuickCreate
            quickCreateDefaultKind="account"
            quickCreateInitialValues={{
              accountNameEn: opportunity.accountDisplayName || opportunity.partyDisplayName || opportunity.title || undefined,
              contactNameEn: opportunity.primaryContactName || undefined,
              nameEn: opportunity.accountDisplayName || opportunity.partyDisplayName || opportunity.title || undefined,
            }}
          />
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
          <MoveStageExtraGateInputs
            t={t}
            isRtl={isRtl}
            needsContactIdInput={needsContactIdInput}
            selectedContactId={selectedContactId}
            initialContactLabel={opportunity.primaryContactName}
            onContactChange={onContactChange}
            needsAccountIdInput={needsAccountIdInput}
            selectedAccountId={selectedAccountId}
            initialAccountLabel={opportunity.accountDisplayName}
            onAccountChange={onAccountChange}
            needsOwnerUserIdInput={needsOwnerUserIdInput}
            selectedOwnerUserId={selectedOwnerUserId}
            initialOwnerLabel={opportunity.ownerDisplayName}
            onOwnerChange={onOwnerChange}
            needsDiscountPercentInput={needsDiscountPercentInput}
            discountPercent={discountPercent}
            onDiscountPercentChange={onDiscountPercentChange}
            needsNextStepInput={needsNextStepInput}
            nextStepSummary={nextStepSummary}
            onNextStepSummaryChange={onNextStepSummaryChange}
            requiredCustomFieldKeys={requiredCustomFieldKeys}
            storeCustomFields={storeCustomFields}
            customFieldValues={customFieldValues}
            onCustomFieldChange={onCustomFieldChange}
          />
        </div>
      )}

      <MoveStageInlineCustomFieldCreator
        targetStageKey={targetStageKey}
        onAddCrmCustomField={onAddCrmCustomField}
        onRefetchOppCustomFields={onRefetchOppCustomFields}
        disabled={isSubmitting}
        t={t}
      />

      <CustomFieldsSection
        entityTypeKey="crm.opportunity"
        entityDisplayName={t("crmOpportunities.title") || "Commercial Opportunity"}
        configs={oppCustomFieldConfigs}
        isLoading={isOppCfLoading}
        onFieldCreated={() => {
          onRefetchOppCustomFields();
        }}
        values={customFieldValues}
        onChange={onCustomFieldChange}
        disabled={isSubmitting}
      />

      <div className={!isAdjacentForward ? "space-y-2 rounded-nx-md border border-warning-strong/30 bg-warning/5 p-3" : "space-y-1.5"}>
        {!isAdjacentForward && (
          <div className="flex items-center gap-2 text-nx-warning-strong text-xs font-semibold">
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
