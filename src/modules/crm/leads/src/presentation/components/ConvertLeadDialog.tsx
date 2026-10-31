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
import { AlertCircle, ArrowRightCircle, Sparkles } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CrmLead, ConvertLeadInput, ConvertLeadResult, DealKind } from "../../domain/models/crm-lead.types";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead | null;
  onSubmit: (input: ConvertLeadInput) => Promise<ConvertLeadResult | null>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

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
  const [dealKind, setDealKind] = useState<DealKind>("NewBusiness");
  const [closeDate, setCloseDate] = useState<string>("");
  const [rationale, setRationale] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open && lead) {
      setTitle(lead.title || `${lead.companyName || lead.fullName || "New"} Deal`);
      setAmount(lead.estimatedValue ?? 0);
      setCurrency(lead.currency || "SAR");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (!title.trim()) {
      setValidationError(t("crmLeads.conversion.titleRequired") || "Opportunity title is required");
      return;
    }

    if (amount <= 0) {
      setValidationError(t("crmLeads.conversion.amountRequired") || "Estimated commercial amount must be greater than zero");
      return;
    }

    setValidationError(null);

    const result = await onSubmit({
      leadId: lead.id,
      opportunityTitle: title.trim(),
      estimatedAmount: amount,
      currencyCode: currency,
      targetCloseDate: closeDate ? new Date(closeDate).toISOString() : undefined,
      dealKind,
      directCreateRationale: rationale.trim() || undefined,
      expectedRowVersion: lead.rowVersion ?? "",
    });

    if (result) {
      onOpenChange(false);
    }
  };

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

          {!isQualified && (
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

            {/* Estimated Commercial Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-amount" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.conversion.amountLabel")} ({currency}) *
              </Label>
              <Input
                id="opp-amount"
                type="number"
                min="0.01"
                step="any"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="10000"
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
                required
              />
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
                          ? "bg-nx-accent-fill text-nx-on-fill border-transparent font-bold"
                          : "border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-surfaceSubtle"
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
              disabled={isSubmitting || !isQualified}
              className="h-8 text-xs bg-nx-accent-fill text-nx-on-fill font-bold hover:brightness-105 gap-1.5"
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
