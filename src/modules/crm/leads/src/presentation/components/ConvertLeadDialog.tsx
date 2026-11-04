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
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, ArrowRightCircle, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CrmLead, ConvertLeadInput, ConvertLeadResult, DealKind } from "../../domain/entities/LeadEntity";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead | null;
  onSubmit: (input: ConvertLeadInput) => Promise<ConvertLeadResult | null>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const CONVERSION_STAGE_OPTIONS = [
  { key: "default.discovery", label: "1. Discovery (Initial Stage)", requiresParty: false },
  { key: "default.qualification", label: "2. Qualification", requiresParty: false },
  { key: "default.solution_fit", label: "3. Solution Fit", requiresParty: false },
  { key: "default.proposal", label: "4. Proposal (Party Required)", requiresParty: true },
  { key: "default.negotiation", label: "5. Negotiation (Party Required)", requiresParty: true },
];

const CURRENCY_OPTIONS = ["SAR", "USD", "EUR", "AED", "GBP", "EGP"];

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

  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("SAR");
  const [targetStageKey, setTargetStageKey] = useState<string>("default.discovery");
  const [dealKind, setDealKind] = useState<DealKind>("NewBusiness");
  const [closeDate, setCloseDate] = useState<string>("");
  const [rationale, setRationale] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open && lead) {
      setTitle(lead.title || `${lead.companyName || lead.fullName || "New"} Deal`);
      setAmount(lead.estimatedValue ?? 0);
      setCurrency(lead.currency || "SAR");
      setTargetStageKey("default.discovery");
      setDealKind("NewBusiness");
      setCloseDate("");
      setRationale("");
      setValidationError(null);
    }
  }, [open, lead]);

  const dealKinds: { key: DealKind; label: string }[] = [
    { key: "NewBusiness", label: t("crmLeads.conversion.dealKinds.newBusiness") || "New Business" },
    { key: "Expansion", label: t("crmLeads.conversion.dealKinds.expansion") || "Expansion" },
    { key: "Renewal", label: t("crmLeads.conversion.dealKinds.renewal") || "Renewal" },
    { key: "Services", label: t("crmLeads.conversion.dealKinds.services") || "Services" },
  ];

  const hasVerifiedOrAutoParty = Boolean(
    lead?.verifiedPartyId ||
      lead?.organizationPartyId ||
      lead?.personPartyId ||
      lead?.companyName?.trim() ||
      lead?.fullName?.trim() ||
      lead?.firstName?.trim()
  );

  const selectedStageMeta = CONVERSION_STAGE_OPTIONS.find((s) => s.key === targetStageKey);
  const lacksPartyForTargetStage = Boolean(selectedStageMeta?.requiresParty && !hasVerifiedOrAutoParty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (!title.trim()) {
      setValidationError(t("crmLeads.conversion.titleRequired") || "Opportunity title is required");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setValidationError(t("crmLeads.conversion.amountRequired") || "Estimated commercial amount must be greater than zero");
      return;
    }

    if (lacksPartyForTargetStage) {
      setValidationError("A verified Account or Contact (or company/contact name on the lead) is required before converting directly into Proposal or Negotiation.");
      return;
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

    if (result) {
      onOpenChange(false);
    }
  };

  const isConvertible =
    lead?.status === "Qualified" || lead?.status === "New" || lead?.status === "Working";
  const isQualified = lead?.status === "Qualified";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-nx-surface border-nx-line" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading flex items-center gap-2">
              <Sparkles className="size-4 text-nx-accent" />
              <span>{t("crmLeads.conversion.dialogTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmLeads.conversion.dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          {!isConvertible && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AlertCircle className="size-4" />
              <AlertTitle className="text-xs font-bold">
                {t("crmLeads.conversion.notQualifiedTitle")}
              </AlertTitle>
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

          {/* Party Verification Status Indicator */}
          {lead && (
            <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-ground px-3 py-2 text-xs">
              <span className="text-nx-ink-3 font-medium">Account / Contact Verification:</span>
              {lead.verifiedPartyId || lead.organizationPartyId || lead.personPartyId ? (
                <span className="inline-flex items-center gap-1 font-semibold text-success">
                  <ShieldCheck className="size-3.5" />
                  <span>Verified Party Linked</span>
                </span>
              ) : hasVerifiedOrAutoParty ? (
                <span className="inline-flex items-center gap-1 font-medium text-nx-accent">
                  <ShieldCheck className="size-3.5" />
                  <span>Auto-Provision from Lead Intake</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-warning">
                  <ShieldAlert className="size-3.5" />
                  <span>Unlinked (Discovery–Solution Fit only)</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Opportunity Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="opp-title" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.conversion.titleLabel")} *
              </Label>
              <Input
                id="opp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("crmLeads.conversion.titlePlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
                required
              />
            </div>

            {/* Estimated Commercial Amount & Currency */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-amount" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.conversion.amountLabel")} ({currency}) *
              </Label>
              <div className="flex items-center gap-1.5">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger aria-label="Currency" className="h-9 w-24 text-xs border-nx-line bg-nx-ground text-nx-ink shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="opp-amount"
                  type="number"
                  min="0.01"
                  step="any"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="10000"
                  className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink flex-1"
                  required
                />
              </div>
            </div>

            {/* Target Close Date */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-close-date" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.conversion.closeDateLabel")}
              </Label>
              <Input
                id="opp-close-date"
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
              />
            </div>

            {/* Target Pipeline Stage */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="opp-target-stage" className="text-xs font-semibold text-nx-ink">
                Initial Pipeline Stage
              </Label>
              <Select value={targetStageKey} onValueChange={setTargetStageKey}>
                <SelectTrigger id="opp-target-stage" className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONVERSION_STAGE_OPTIONS.map((stg) => (
                    <SelectItem key={stg.key} value={stg.key}>
                      {stg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deal Kind Selector */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.conversion.dealKindLabel")}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {dealKinds.map((dk) => {
                  const isSelected = dealKind === dk.key;
                  return (
                    <Button
                      key={dk.key}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDealKind(dk.key)}
                      className={cn(
                        "h-8 px-2 text-xs font-medium rounded-nx-md border",
                        isSelected
                          ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                          : "border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
                      )}
                    >
                      {dk.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Rationale / Context */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="opp-rationale" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.conversion.rationaleLabel")}
              </Label>
              <Textarea
                id="opp-rationale"
                rows={2}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder={t("crmLeads.conversion.rationalePlaceholder")}
                className="text-xs border-nx-line bg-nx-ground text-nx-ink resize-none"
              />
            </div>
          </div>

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
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !isConvertible}
              className="h-8 text-xs font-bold gap-1.5"
            >
              <ArrowRightCircle className="size-3.5" />
              <span>
                {isSubmitting
                  ? t("crmLeads.conversion.converting")
                  : t("crmLeads.conversion.convert")}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
