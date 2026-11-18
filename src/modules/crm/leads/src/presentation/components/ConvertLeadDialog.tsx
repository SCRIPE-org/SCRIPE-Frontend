"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle, ArrowRightCircle } from "lucide-react";
import { useCrmCurrency, useCrmWorkflowsStore, type CrmEntitySearchItem } from "@modules/crm";
import type { CrmLead, ConvertLeadInput, ConvertLeadResult, DealKind, LinkPartyToLeadInput } from "../../domain/entities/LeadEntity";
import { buildLeadConversionStageOptions, buildLeadQuickCreateDefaults } from "../utils/leadTransitionHelpers";
import { ConvertLeadFormFields } from "./ConvertLeadFormFields";
import { LeadVerificationStatusBanner } from "./LeadVerificationStatusBanner";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead | null;
  onLinkPartyBeforeConvert?: (input: LinkPartyToLeadInput) => Promise<CrmLead | null>;
  onSubmit: (input: ConvertLeadInput) => Promise<ConvertLeadResult | null>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function ConvertLeadDialog({
  open,
  onOpenChange,
  lead,
  onLinkPartyBeforeConvert,
  onSubmit,
  isSubmitting = false,
  submitError,
}: ConvertLeadDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { baseCurrency, defaultDealCurrency, getConversionPreview } = useCrmCurrency();
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));

  const conversionStageOptions = buildLeadConversionStageOptions(
    activeDealWorkflow,
    isRtl,
    t("crmLeads.conversion.partyRequiredSuffix"),
    t("crmLeads.conversion.initialStageSuffix")
  );

  const defaultConversionStageKey = conversionStageOptions[0]?.key || "";
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState(defaultDealCurrency || "SAR");
  const [targetStageKey, setTargetStageKey] = useState(defaultConversionStageKey);
  const [dealKind, setDealKind] = useState<DealKind>("NewBusiness");
  const [closeDate, setCloseDate] = useState("");
  const [rationale, setRationale] = useState("");
  const [accountPartyId, setAccountPartyId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [contactPartyId, setContactPartyId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [prevSyncKey, setPrevSyncKey] = useState("");

  const syncKey = open && lead ? `${lead.id}:${lead.rowVersion ?? ""}:${defaultConversionStageKey}` : "";
  if (syncKey && syncKey !== prevSyncKey && lead) {
    setPrevSyncKey(syncKey);
    setTitle(lead.title || `${lead.companyName || lead.fullName || "New"} Deal`);
    setAmount(lead.estimatedValue ?? 0);
    setCurrency(lead.currency || defaultDealCurrency || "SAR");
    setTargetStageKey(defaultConversionStageKey);
    setDealKind("NewBusiness");
    setCloseDate("");
    setRationale("");
    setAccountPartyId(lead.organizationPartyId ?? "");
    setAccountId(lead.accountId ?? "");
    setContactPartyId(lead.personPartyId ?? "");
    setValidationError(null);
  } else if (!open && prevSyncKey !== "") {
    setPrevSyncKey("");
  }

  const conversionPreview = getConversionPreview(amount, currency);
  const dealKinds: { key: DealKind; label: string }[] = [
    { key: "NewBusiness", label: t("crmLeads.conversion.dealKinds.newBusiness") },
    { key: "Expansion", label: t("crmLeads.conversion.dealKinds.expansion") },
    { key: "Renewal", label: t("crmLeads.conversion.dealKinds.renewal") },
    { key: "Services", label: t("crmLeads.conversion.dealKinds.services") },
  ];

  const hasVerifiedOrAutoParty = Boolean(
    accountPartyId ||
      accountId ||
      contactPartyId ||
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

    let activeRowVersion = lead.rowVersion ?? "";
    const pickedNewLink =
      accountPartyId !== (lead.organizationPartyId ?? "") ||
      contactPartyId !== (lead.personPartyId ?? "") ||
      accountId !== (lead.accountId ?? "");
    if (pickedNewLink && onLinkPartyBeforeConvert && (accountPartyId || contactPartyId || accountId)) {
      const updatedLead = await onLinkPartyBeforeConvert({
        leadId: lead.id,
        organizationPartyId: accountPartyId || undefined,
        personPartyId: contactPartyId || undefined,
        accountId: accountId || undefined,
        createMissingParties: true,
        expectedRowVersion: activeRowVersion,
      });
      if (!updatedLead) return;
      activeRowVersion = updatedLead.rowVersion ?? activeRowVersion;
    }

    const result = await onSubmit({
      leadId: lead.id,
      opportunityTitle: title.trim(),
      estimatedAmount: amount,
      currencyCode: currency,
      targetStageKey,
      targetCloseDate: closeDate ? new Date(closeDate).toISOString() : undefined,
      dealKind,
      directCreateRationale: rationale.trim() || undefined,
      expectedRowVersion: activeRowVersion,
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

          <LeadVerificationStatusBanner
            lead={lead}
            isConvertible={isConvertible}
            isQualified={isQualified}
            hasVerifiedOrAutoParty={hasVerifiedOrAutoParty}
            t={t}
          />

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
            accountPartyId={accountPartyId}
            accountId={accountId}
            initialAccountLabel={lead?.organizationDisplayName || lead?.accountDisplayName || undefined}
            accountQuickCreateDefaults={buildLeadQuickCreateDefaults(lead, "account")}
            onAccountChange={(val: string, item?: CrmEntitySearchItem) => {
              setAccountPartyId(val);
              setAccountId(item?.accountId || "");
            }}
            contactPartyId={contactPartyId}
            initialContactLabel={lead?.personDisplayName || undefined}
            contactQuickCreateDefaults={buildLeadQuickCreateDefaults(lead, "contact")}
            onContactChange={setContactPartyId}
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
