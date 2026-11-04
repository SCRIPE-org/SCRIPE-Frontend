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
import { Alert, AlertDescription } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import { AlertCircle, AlertTriangle, Building2 } from "lucide-react";
import type { CreateOpportunityInput, DealKind } from "../../domain/entities/OpportunityEntity";

const CURRENCIES = ["SAR", "USD", "AED", "EUR", "GBP", "EGP"];

export interface OpportunityPartyOption {
  partyId: string;
  accountId?: string;
  label: string;
  subtitle?: string;
}

export interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateOpportunityInput) => Promise<boolean>;
  onLookupParties?: (search?: string) => Promise<OpportunityPartyOption[]>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

/**
 * Dialog to create a new commercial opportunity with searchable Account/Contact selector and Custom Fields.
 */
export function CreateOpportunityDialog({
  open,
  onOpenChange,
  onSubmit,
  onLookupParties,
  isSubmitting = false,
  submitError,
}: CreateOpportunityDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [formData, setFormData] = useState<CreateOpportunityInput>({
    title: "",
    estimatedAmount: 0,
    currencyCode: "SAR",
    targetStageKey: "default.discovery",
    targetCloseDate: "",
    dealKind: "NewBusiness",
    directCreateRationale: "",
    partyId: "",
    accountId: "",
  });

  const [partyOptions, setPartyOptions] = useState<OpportunityPartyOption[]>([]);
  const [partySearch, setPartySearch] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !onLookupParties) return;
    let cancelled = false;
    async function loadOptions() {
      try {
        const options = await onLookupParties!(partySearch);
        if (!cancelled) {
          setPartyOptions(options);
        }
      } catch {
        // Ignore lookup error in test/offline mode
      }
    }
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [open, partySearch, onLookupParties]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title?.trim()) {
      errs.title = "Deal title is required";
    }
    if (
      formData.estimatedAmount == null ||
      isNaN(formData.estimatedAmount) ||
      formData.estimatedAmount < 0
    ) {
      errs.estimatedAmount = "Valid estimated amount is required (>= 0)";
    }
    if (
      formData.targetStageKey === "default.proposal" ||
      formData.targetStageKey === "default.negotiation"
    ) {
      if (!formData.partyId?.trim()) {
        errs.partyId =
          "A linked Account or Contact is required when creating a deal in Proposal or Negotiation stage.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSelectParty = (selectedPartyId: string) => {
    if (selectedPartyId === "__none__") {
      setFormData((prev) => ({ ...prev, partyId: "", accountId: "" }));
      return;
    }
    const matched = partyOptions.find((o) => o.partyId === selectedPartyId);
    setFormData((prev) => ({
      ...prev,
      partyId: selectedPartyId,
      accountId: matched?.accountId || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateOpportunityInput = {
      title: formData.title.trim(),
      estimatedAmount: Number(formData.estimatedAmount),
      currencyCode: formData.currencyCode?.trim().toUpperCase() || "SAR",
      targetStageKey: formData.targetStageKey || "default.discovery",
      targetCloseDate: formData.targetCloseDate
        ? new Date(formData.targetCloseDate).toISOString()
        : undefined,
      dealKind: formData.dealKind || "NewBusiness",
      directCreateRationale: formData.directCreateRationale?.trim() || undefined,
      partyId: formData.partyId?.trim() || undefined,
      accountId: formData.accountId?.trim() || undefined,
      customFieldValues,
    };

    const success = await onSubmit(payload);
    if (success) {
      onOpenChange(false);
      setFormData({
        title: "",
        estimatedAmount: 0,
        currencyCode: "SAR",
        targetStageKey: "default.discovery",
        targetCloseDate: "",
        dealKind: "NewBusiness",
        directCreateRationale: "",
        partyId: "",
        accountId: "",
      });
      setCustomFieldValues({});
      setErrors({});
    }
  };

  const isProposalOrLater =
    formData.targetStageKey === "default.proposal" ||
    formData.targetStageKey === "default.negotiation";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("crmOpportunities.dialogs.create.title")}</DialogTitle>
          <DialogDescription>
            {t("crmOpportunities.dialogs.create.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="opp-title">
              {t("crmOpportunities.dialogs.create.titleLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="opp-title"
              placeholder={t("crmOpportunities.dialogs.create.titlePlaceholder")}
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="opp-amount">
                {t("crmOpportunities.dialogs.create.amountLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="opp-amount"
                type="number"
                min="0"
                step="any"
                placeholder={t("crmOpportunities.dialogs.create.amountPlaceholder")}
                value={formData.estimatedAmount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                aria-invalid={Boolean(errors.estimatedAmount)}
              />
              {errors.estimatedAmount && (
                <p className="text-xs text-destructive">{errors.estimatedAmount}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opp-currency">{t("crmOpportunities.dialogs.create.currencyLabel")}</Label>
              <Select
                value={formData.currencyCode || "SAR"}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, currencyCode: val }))}
              >
                <SelectTrigger id="opp-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="opp-stage">{t("crmOpportunities.dialogs.create.stageLabel")}</Label>
              <Select
                value={formData.targetStageKey}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, targetStageKey: val }))}
              >
                <SelectTrigger id="opp-stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default.discovery">Discovery</SelectItem>
                  <SelectItem value="default.qualification">Qualification</SelectItem>
                  <SelectItem value="default.solution_fit">Solution Fit</SelectItem>
                  <SelectItem value="default.proposal">Proposal (Account/Contact required)</SelectItem>
                  <SelectItem value="default.negotiation">Negotiation (Account/Contact required)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opp-deal-kind">{t("crmOpportunities.dialogs.create.dealKindLabel")}</Label>
              <Select
                value={formData.dealKind}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, dealKind: val as DealKind }))
                }
              >
                <SelectTrigger id="opp-deal-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NewBusiness">New Business</SelectItem>
                  <SelectItem value="Expansion">Expansion</SelectItem>
                  <SelectItem value="Renewal">Renewal</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Searchable Account / Organization Selector */}
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
              onChange={(e) => setPartySearch(e.target.value)}
              className="h-8 text-xs mb-1"
            />
            <Select
              value={formData.partyId || "__none__"}
              onValueChange={handleSelectParty}
            >
              <SelectTrigger id="opp-party-id">
                <SelectValue
                  placeholder={t("crmOpportunities.dialogs.create.partyIdPlaceholder")}
                />
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
            <Label htmlFor="opp-close-date">
              {t("crmOpportunities.dialogs.create.closeDateLabel")}
            </Label>
            <Input
              id="opp-close-date"
              type="date"
              value={formData.targetCloseDate || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, targetCloseDate: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opp-rationale">
              {t("crmOpportunities.dialogs.create.rationaleLabel")}
            </Label>
            <Textarea
              id="opp-rationale"
              placeholder={t("crmOpportunities.dialogs.create.rationalePlaceholder")}
              value={formData.directCreateRationale || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, directCreateRationale: e.target.value }))
              }
              rows={2}
            />
          </div>

          {/* Custom Fields Integration */}
          <CustomFieldsSection
            entityTypeKey="crm.opportunity"
            entityDisplayName={t("crmOpportunities.title") || "Commercial Opportunity"}
            values={customFieldValues}
            onChange={(key, val) => setCustomFieldValues((prev) => ({ ...prev, [key]: val }))}
            disabled={isSubmitting}
          />

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("crmOpportunities.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("crmOpportunities.actions.saving")
                : t("crmOpportunities.dialogs.create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
