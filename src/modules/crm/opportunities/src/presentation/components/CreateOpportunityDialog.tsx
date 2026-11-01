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
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { CreateOpportunityInput, DealKind } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for CreateOpportunityDialog.
 */
export interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateOpportunityInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

/**
 * Dialog to create a new commercial opportunity with stage and amount validation.
 */
export function CreateOpportunityDialog({
  open,
  onOpenChange,
  onSubmit,
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title?.trim()) {
      errs.title = "Deal title is required";
    }
    if (formData.estimatedAmount == null || isNaN(formData.estimatedAmount) || formData.estimatedAmount < 0) {
      errs.estimatedAmount = "Valid estimated amount is required (>= 0)";
    }
    if (
      formData.targetStageKey === "default.proposal" ||
      formData.targetStageKey === "default.negotiation"
    ) {
      if (!formData.partyId?.trim()) {
        errs.partyId = "A verified Party ID is required for Proposal or later stages (PD-1)";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
      });
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
              <Input
                id="opp-currency"
                maxLength={3}
                value={formData.currencyCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currencyCode: e.target.value.toUpperCase() }))
                }
              />
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
                  <SelectItem value="default.proposal">Proposal (Party required)</SelectItem>
                  <SelectItem value="default.negotiation">Negotiation (Party required)</SelectItem>
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

          <div className="space-y-1.5">
            <Label htmlFor="opp-party-id">
              {t("crmOpportunities.dialogs.create.partyIdLabel")}
              {isProposalOrLater && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id="opp-party-id"
              placeholder={t("crmOpportunities.dialogs.create.partyIdPlaceholder")}
              value={formData.partyId || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, partyId: e.target.value }))}
              aria-invalid={Boolean(errors.partyId)}
            />
            {errors.partyId && <p className="text-xs text-destructive">{errors.partyId}</p>}
            {isProposalOrLater && !formData.partyId && (
              <p className="text-xs text-warning flex items-center gap-1 mt-1">
                <AlertTriangle className="size-3" />
                PD-1: Advancing to Proposal requires a linked verified party.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opp-close-date">
              {t("crmOpportunities.dialogs.create.targetCloseDateLabel")}
            </Label>
            <Input
              id="opp-close-date"
              type="date"
              value={formData.targetCloseDate || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, targetCloseDate: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opp-rationale">
              {t("crmOpportunities.dialogs.create.directRationaleLabel")}
            </Label>
            <Textarea
              id="opp-rationale"
              placeholder={t("crmOpportunities.dialogs.create.directRationalePlaceholder")}
              value={formData.directCreateRationale || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, directCreateRationale: e.target.value }))
              }
              rows={2}
            />
          </div>

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
                ? t("crmOpportunities.actions.creating")
                : t("crmOpportunities.actions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
