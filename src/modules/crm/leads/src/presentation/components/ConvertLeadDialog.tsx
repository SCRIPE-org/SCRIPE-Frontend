"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { AlertCircle, ArrowRightCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import { useCrmCurrency, useCrmWorkflowsStore } from "@modules/crm";
import type { CrmLead, ConvertLeadInput, ConvertLeadResult, DealKind } from "../../domain/entities/LeadEntity";
import { ConvertLeadFormFields } from "./ConvertLeadFormFields";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead | null;
  onSubmit: (input: ConvertLeadInput) => Promise<ConvertLeadResult | null>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const DEFAULT_CONVERSION_STAGE_OPTIONS = [
  { key: "default.discovery", label: "1. Discovery (Initial Stage)", requiresParty: false },
  { key: "default.qualification", label: "2. Qualification", requiresParty: false },
  { key: "default.solution_fit", label: "3. Solution Fit", requiresParty: false },
  { key: "default.proposal", label: "4. Proposal (Account/Contact Required)", requiresParty: true },
  { key: "default.negotiation", label: "5. Negotiation (Account/Contact Required)", requiresParty: true },
];

export function ConvertLeadDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
  isSubmitting = false,
  submitError,
}: ConvertLeadDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { baseCurrency, defaultDealCurrency, getConversionPreview } = useCrmCurrency();
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));

  const conversionStageOptions =
    activeDealWorkflow?.stages && activeDealWorkflow.stages.length >= 2
      ? [...activeDealWorkflow.stages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s, idx) => {
            const requiresParty = Boolean(s.requiresVerifiedParty || s.requiredExitFields?.includes("partyId"));
            const baseLabel = isRtl && s.labelAr ? s.labelAr : s.labelEn;
            return {
              key: s.stageKey,
              label: `${idx + 1}. ${baseLabel}${requiresParty ? " (Account/Contact Required)" : idx === 0 ? " (Initial Stage)" : ""}`,
              requiresParty,
            };
          })
      : DEFAULT_CONVERSION_STAGE_OPTIONS;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState(defaultDealCurrency || "SAR");
  const [targetStageKey, setTargetStageKey] = useState(conversionStageOptions[0]?.key || "default.discovery");
  const [dealKind, setDealKind] = useState<DealKind>("NewBusiness");
  const [closeDate, setCloseDate] = useState("");
  const [rationale, setRationale] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open && lead) {
      setTitle(lead.title || `${lead.companyName || lead.fullName || "New"} Deal`);
      setAmount(lead.estimatedValue ?? 0);
      setCurrency(lead.currency || defaultDealCurrency || "SAR");
      setTargetStageKey(conversionStageOptions[0]?.key || "default.discovery");
      setDealKind("NewBusiness");
      setCloseDate("");
      setRationale("");
      setValidationError(null);
    }
  }, [open, lead, defaultDealCurrency]);

  const conversionPreview = getConversionPreview(amount, currency);
  const dealKinds: { key: DealKind; label: string }[] = [
    { key: "NewBusiness", label: t("crmLeads.conversion.dealKinds.newBusiness") },
    { key: "Expansion", label: t("crmLeads.conversion.dealKinds.expansion") },
    { key: "Renewal", label: t("crmLeads.conversion.dealKinds.renewal") },
    { key: "Services", label: t("crmLeads.conversion.dealKinds.services") },
  ];

  const hasVerifiedOrAutoParty = Boolean(
    lead?.verifiedPartyId ||
      lead?.organizationPartyId ||
      lead?.personPartyId ||
      lead?.companyName?.trim() ||
      lead?.fullName?.trim() ||
      lead?.firstName?.trim(),
  );

  const selectedStageMeta = conversionStageOptions.find((s) => s.key === targetStageKey);
  const lacksPartyForTargetStage = Boolean(selectedStageMeta?.requiresParty && !hasVerifiedOrAutoParty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    if (!title.trim()) {
      return setValidationError(t("crmLeads.conversion.titleRequired"));
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return setValidationError(t("crmLeads.conversion.amountRequired"));
    }
    if (lacksPartyForTargetStage) {
      return setValidationError(t("crmLeads.conversion.partyRequiredForStage"));
    }
    setValidationError(null);

    const result = await onSubmit({
      leadId: lead.id,
      opportunityTitle: title.trim(),
      estimatedAmount: amount,
      currencyCode: currency,
      targetStageKey,
      targetCloseDate: closeDate ? new Date(closeDate).toISOString() : undefined,
      dealKind,
      directCreateRationale: rationale.trim() || undefined,
      expectedRowVersion: lead.rowVersion ?? "",
    });
    if (result) onOpenChange(false);
  };

  const isConvertible = lead?.status === "Qualified" || lead?.status === "New" || lead?.status === "Working";
  const isQualified = lead?.status === "Qualified";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-nx-surface border-nx-line" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading flex items-center gap-2">
              <ArrowRightCircle className="size-4 text-nx-accent" />
              <span>{t("crmLeads.conversion.dialogTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmLeads.conversion.dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          {!isConvertible && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AlertCircle className="size-4" />
              <AlertTitle className="text-xs font-bold">{t("crmLeads.conversion.notQualifiedTitle")}</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {t("crmLeads.conversion.notQualifiedDescription")}
              </AlertDescription>
            </Alert>
          )}
          {isConvertible && !isQualified && (
            <div className="rounded-nx-md border border-nx-accent/30 bg-nx-accent-wash/40 px-3 py-2 text-xs text-nx-ink-2">
              {t("crmLeads.conversion.autoQualifyNotice")}
            </div>
          )}

          {lead && (
            <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-ground px-3 py-2 text-xs">
              <span className="text-nx-ink-3 font-medium">{t("crmLeads.conversion.accountVerificationLabel")}</span>
              {lead.verifiedPartyId || lead.organizationPartyId || lead.personPartyId ? (
                <span className="inline-flex items-center gap-1 font-semibold text-success">
                  <ShieldCheck className="size-3.5" />
                  <span>{t("crmLeads.conversion.verifiedAccountLinked")}</span>
                </span>
              ) : hasVerifiedOrAutoParty ? (
                <span className="inline-flex items-center gap-1 font-medium text-nx-accent">
                  <ShieldCheck className="size-3.5" />
                  <span>{t("crmLeads.conversion.autoProvisionIntake")}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-warning">
                  <ShieldAlert className="size-3.5" />
                  <span>{t("crmLeads.conversion.unlinkedDiscoveryOnly")}</span>
                </span>
              )}
            </div>
          )}

          {(submitError || validationError) && (
            <Alert variant="destructive" className="py-2 px-3">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{submitError || validationError}</AlertDescription>
            </Alert>
          )}

          <ConvertLeadFormFields
            t={t}
            title={title}
            onTitleChange={setTitle}
            amount={amount}
            onAmountChange={setAmount}
            currency={currency}
            onCurrencyChange={setCurrency}
            baseCurrency={baseCurrency}
            conversionPreview={conversionPreview}
            closeDate={closeDate}
            onCloseDateChange={setCloseDate}
            targetStageKey={targetStageKey}
            onTargetStageKeyChange={setTargetStageKey}
            conversionStageOptions={conversionStageOptions}
            dealKind={dealKind}
            onDealKindChange={setDealKind}
            dealKinds={dealKinds}
            rationale={rationale}
            onRationaleChange={setRationale}
          />

          <DialogFooter className="pt-3 border-t border-nx-line gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink"
            >
              {t("crmLeads.actions.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !isConvertible} className="h-8 text-xs font-bold gap-1.5">
              <ArrowRightCircle className="size-3.5" />
              <span>{isSubmitting ? t("crmLeads.conversion.converting") : t("crmLeads.conversion.convert")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
