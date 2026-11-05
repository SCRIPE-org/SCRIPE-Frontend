"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertTriangle, Building2 } from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import type { CreateOpportunityInput, DealKind } from "../../domain/entities/OpportunityEntity";

export interface OpportunityPartyOption {
  partyId: string;
  accountId?: string;
  label: string;
  subtitle?: string;
}

export interface CreateOpportunityPartyStageFieldsProps {
  t: (key: string, params?: Record<string, any>) => string;
  formData: CreateOpportunityInput;
  onChangeFormData: React.Dispatch<React.SetStateAction<CreateOpportunityInput>>;
  partySearch: string;
  onPartySearchChange: (val: string) => void;
  partyOptions: OpportunityPartyOption[];
  onSelectParty: (val: string) => void;
  isProposalOrLater: boolean;
  errors: Record<string, string>;
  customFieldValues: Record<string, unknown>;
  onCustomFieldChange: (key: string, val: unknown) => void;
  isSubmitting: boolean;
}

export function CreateOpportunityPartyStageFields({
  t,
  formData,
  onChangeFormData,
  partySearch,
  onPartySearchChange,
  partyOptions,
  onSelectParty,
  isProposalOrLater,
  errors,
  customFieldValues,
  onCustomFieldChange,
  isSubmitting,
}: CreateOpportunityPartyStageFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="opp-stage">{t("crmOpportunities.dialogs.create.stageLabel")}</Label>
          <Select
            value={formData.targetStageKey}
            onValueChange={(val) => onChangeFormData((prev) => ({ ...prev, targetStageKey: val }))}
          >
            <SelectTrigger id="opp-stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default.discovery">{t("crmOpportunities.stages.discovery")}</SelectItem>
              <SelectItem value="default.qualification">{t("crmOpportunities.stages.qualification")}</SelectItem>
              <SelectItem value="default.solution_fit">{t("crmOpportunities.stages.solutionFit")}</SelectItem>
              <SelectItem value="default.proposal">{t("crmOpportunities.stages.proposal")}</SelectItem>
              <SelectItem value="default.negotiation">{t("crmOpportunities.stages.negotiation")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opp-deal-kind">{t("crmOpportunities.dialogs.create.dealKindLabel")}</Label>
          <Select
            value={formData.dealKind}
            onValueChange={(val) => onChangeFormData((prev) => ({ ...prev, dealKind: val as DealKind }))}
          >
            <SelectTrigger id="opp-deal-kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NewBusiness">{t("crmOpportunities.dealKind.newBusiness")}</SelectItem>
              <SelectItem value="Expansion">{t("crmOpportunities.dealKind.expansion")}</SelectItem>
              <SelectItem value="Renewal">{t("crmOpportunities.dealKind.renewal")}</SelectItem>
              <SelectItem value="Services">{t("crmOpportunities.dealKind.services")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="opp-party-id" className="flex items-center gap-1.5">
          <Building2 className="size-3.5 text-nx-accent" />
          <span>{t("crmOpportunities.dialogs.create.partyIdLabel")}</span>
          {isProposalOrLater && <span className="text-destructive">*</span>}
        </Label>
        <Input
          placeholder={t("crmOpportunities.dialogs.create.partySearchPlaceholder", {
            defaultValue: "Filter Accounts or Contacts...",
          })}
          value={partySearch}
          onChange={(e) => onPartySearchChange(e.target.value)}
          className="h-8 text-xs mb-1"
        />
        <Select value={formData.partyId || "__none__"} onValueChange={onSelectParty}>
          <SelectTrigger id="opp-party-id">
            <SelectValue placeholder={t("crmOpportunities.dialogs.create.partyIdPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">
              {t("crmOpportunities.dialogs.create.noAccountOption", {
                defaultValue: "No linked Account / Contact yet (Link later)",
              })}
            </SelectItem>
            {partyOptions.map((opt) => (
              <SelectItem key={opt.partyId} value={opt.partyId}>
                {opt.label} {opt.subtitle ? `(${opt.subtitle})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.partyId && <p className="text-xs text-destructive">{errors.partyId}</p>}
        {isProposalOrLater && !formData.partyId && (
          <p className="text-xs text-warning flex items-center gap-1 mt-1">
            <AlertTriangle className="size-3" />
            {t("crmOpportunities.dialogs.create.partyRequiredHint", {
              defaultValue: "Advancing to Proposal or Negotiation requires a linked Account or Contact.",
            })}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="opp-close-date">{t("crmOpportunities.dialogs.create.closeDateLabel")}</Label>
        <Input
          id="opp-close-date"
          type="date"
          value={formData.targetCloseDate || ""}
          onChange={(e) => onChangeFormData((prev) => ({ ...prev, targetCloseDate: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="opp-rationale">{t("crmOpportunities.dialogs.create.rationaleLabel")}</Label>
        <Textarea
          id="opp-rationale"
          placeholder={t("crmOpportunities.dialogs.create.rationalePlaceholder")}
          value={formData.directCreateRationale || ""}
          onChange={(e) => onChangeFormData((prev) => ({ ...prev, directCreateRationale: e.target.value }))}
          rows={2}
        />
      </div>

      <CustomFieldsSection
        entityTypeKey="crm.opportunity"
        entityDisplayName={t("crmOpportunities.title") || "Commercial Opportunity"}
        values={customFieldValues}
        onChange={onCustomFieldChange}
        disabled={isSubmitting}
      />
    </>
  );
}
