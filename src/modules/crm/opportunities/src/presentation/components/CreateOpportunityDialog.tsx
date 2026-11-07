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
import { Alert, AlertDescription } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, ArrowRightLeft } from "lucide-react";
import { useCrmCurrency, CRM_CURRENCY_OPTIONS } from "@modules/crm";
import type { CreateOpportunityInput } from "../../domain/entities/OpportunityEntity";
import {
  CreateOpportunityPartyStageFields,
  type OpportunityPartyOption,
} from "./CreateOpportunityPartyStageFields";

export type { OpportunityPartyOption };

export interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateOpportunityInput) => Promise<boolean>;
  onLookupParties?: (search?: string) => Promise<OpportunityPartyOption[]>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

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
  const { baseCurrency, defaultDealCurrency, getConversionPreview } = useCrmCurrency();

  const [formData, setFormData] = useState<CreateOpportunityInput>({
    title: "",
    estimatedAmount: 0,
    currencyCode: defaultDealCurrency || baseCurrency || "SAR",
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
    onLookupParties(partySearch)
      .then((options) => {
        if (!cancelled) setPartyOptions(options);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, partySearch, onLookupParties]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title?.trim()) errs.title = "Deal title is required";
    if (formData.estimatedAmount == null || isNaN(formData.estimatedAmount) || formData.estimatedAmount < 0) {
      errs.estimatedAmount = "Valid estimated amount is required (>= 0)";
    }
    if (
      (formData.targetStageKey === "default.proposal" || formData.targetStageKey === "default.negotiation") &&
      !formData.partyId?.trim()
    ) {
      errs.partyId = "A linked Account or Contact is required when creating a deal in Proposal or Negotiation stage.";
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
      targetCloseDate: formData.targetCloseDate ? new Date(formData.targetCloseDate).toISOString() : undefined,
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
    formData.targetStageKey === "default.proposal" || formData.targetStageKey === "default.negotiation";
  const preview = getConversionPreview(formData.estimatedAmount || 0, formData.currencyCode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("crmOpportunities.dialogs.create.title")}</DialogTitle>
          <DialogDescription>{t("crmOpportunities.dialogs.create.description")}</DialogDescription>
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
              {t("crmOpportunities.dialogs.create.titleLabel")} <span className="text-destructive">*</span>
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
                {t("crmOpportunities.dialogs.create.amountLabel")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="opp-amount"
                type="number"
                min="0"
                step="any"
                placeholder={t("crmOpportunities.dialogs.create.amountPlaceholder")}
                value={formData.estimatedAmount || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimatedAmount: parseFloat(e.target.value) || 0 }))}
                aria-invalid={Boolean(errors.estimatedAmount)}
              />
              {errors.estimatedAmount && <p className="text-xs text-destructive">{errors.estimatedAmount}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opp-currency">{t("crmOpportunities.dialogs.create.currencyLabel")}</Label>
              <Select
                value={formData.currencyCode || defaultDealCurrency || "SAR"}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, currencyCode: val }))}
              >
                <SelectTrigger id="opp-currency" data-testid="create-opp-currency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRM_CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.name} ({c.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {preview.isDifferentCurrency && (
            <div
              data-testid="create-opp-conversion-preview"
              className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 text-nx-ink-2">
                <ArrowRightLeft className="size-3.5 text-nx-accent shrink-0" />
                <span>
                  {t("crmOpportunities.dialogs.create.autoConvertedToBase", {
                    defaultValue: "Auto-Converted to CRM Base",
                  })}{" "}
                  (<strong>{preview.baseCurrency}</strong>):
                </span>
              </div>
              <div className="text-end font-mono">
                <span className="font-bold text-nx-accent">{preview.formattedConverted}</span>
                <span className="ms-2 text-[10px] text-nx-ink-3">({preview.rateSummary})</span>
              </div>
            </div>
          )}

          <CreateOpportunityPartyStageFields
            t={t}
            formData={formData}
            onChangeFormData={setFormData}
            partySearch={partySearch}
            onPartySearchChange={setPartySearch}
            partyOptions={partyOptions}
            onSelectParty={handleSelectParty}
            isProposalOrLater={isProposalOrLater}
            errors={errors}
            customFieldValues={customFieldValues}
            onCustomFieldChange={(key, val) => setCustomFieldValues((prev) => ({ ...prev, [key]: val }))}
            isSubmitting={isSubmitting}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("crmOpportunities.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("crmOpportunities.actions.saving") : t("crmOpportunities.dialogs.create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
