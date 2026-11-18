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
import { AlertCircle } from "lucide-react";
import {
  useCrmCurrency,
  useCrmWorkflowsStore,
  type CrmEntitySearchItem,
} from "@modules/crm";
import type { CreateOpportunityInput } from "../../domain/entities/OpportunityEntity";
import {
  CreateOpportunityPartyStageFields,
  type OpportunityPartyOption,
  type OpportunityStageOption,
} from "./CreateOpportunityPartyStageFields";
import { CreateOpportunityTitleAmountFields } from "./CreateOpportunityTitleAmountFields";
import { OpportunityConversionPreviewBanner } from "./OpportunityConversionPreviewBanner";

export type { OpportunityPartyOption };

export interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateOpportunityInput) => Promise<boolean>;
  onLookupParties?: (search?: string) => Promise<OpportunityPartyOption[]>;
  initialAccountId?: string;
  initialPartyId?: string;
  initialPartyLabel?: string;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function CreateOpportunityDialog({
  open,
  onOpenChange,
  onSubmit,
  initialAccountId,
  initialPartyId,
  initialPartyLabel,
  isSubmitting = false,
  submitError,
}: CreateOpportunityDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { baseCurrency, defaultDealCurrency, getConversionPreview } = useCrmCurrency();
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));

  const stageOptions: OpportunityStageOption[] = (activeDealWorkflow?.stages ?? [])
    .filter((s) => s.category !== "done" && s.category !== "lost")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({
      stageKey: s.stageKey,
      labelEn: s.labelEn,
      labelAr: s.labelAr,
      requiresParty: Boolean(s.requiresVerifiedParty || s.requiredExitFields?.includes("partyId")),
    }));
  const defaultStageKey = stageOptions[0]?.stageKey || "default.discovery";

  const [formData, setFormData] = useState<CreateOpportunityInput>({
    title: "",
    estimatedAmount: 0,
    currencyCode: defaultDealCurrency || baseCurrency || "SAR",
    targetStageKey: defaultStageKey,
    targetCloseDate: "",
    dealKind: "NewBusiness",
    directCreateRationale: "",
    partyId: initialPartyId || "",
    accountId: initialAccountId || "",
  });

  const [selectedPartyLabel, setSelectedPartyLabel] = useState(initialPartyLabel || "");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prevOpenSyncKey, setPrevOpenSyncKey] = useState("");

  const syncKey = open
    ? `${defaultStageKey}:${defaultDealCurrency}:${baseCurrency}:${initialAccountId ?? ""}:${initialPartyId ?? ""}:${initialPartyLabel ?? ""}`
    : "";
  if (syncKey && syncKey !== prevOpenSyncKey) {
    setPrevOpenSyncKey(syncKey);
    const hasStage = stageOptions.some((s) => s.stageKey === formData.targetStageKey);
    setFormData((prev) => ({
      ...prev,
      currencyCode: prev.currencyCode || defaultDealCurrency || baseCurrency || "SAR",
      targetStageKey: hasStage ? prev.targetStageKey : defaultStageKey,
      partyId: initialPartyId || prev.partyId || "",
      accountId: initialAccountId || prev.accountId || "",
    }));
    if (initialPartyLabel) setSelectedPartyLabel(initialPartyLabel);
  } else if (!open && prevOpenSyncKey !== "") {
    setPrevOpenSyncKey("");
  }

  const selectedStage = stageOptions.find((s) => s.stageKey === formData.targetStageKey);
  const isStagePartyRequired = Boolean(
    selectedStage?.requiresParty ||
      formData.targetStageKey === "default.proposal" ||
      formData.targetStageKey === "default.negotiation"
  );

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title?.trim()) errs.title = t("crmOpportunities.dialogs.create.titleRequired");
    if (formData.estimatedAmount == null || isNaN(formData.estimatedAmount) || formData.estimatedAmount < 0) {
      errs.estimatedAmount = t("crmOpportunities.dialogs.create.amountRequired");
    }
    if (isStagePartyRequired && !formData.partyId?.trim() && !formData.accountId?.trim()) {
      errs.partyId = t("crmOpportunities.dialogs.create.partyRequiredError");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSelectParty = (selectedPartyId: string, item?: CrmEntitySearchItem) => {
    if (!selectedPartyId) {
      setSelectedPartyLabel("");
      setFormData((prev) => ({ ...prev, partyId: "", accountId: "" }));
      return;
    }
    setSelectedPartyLabel(item ? (isRtl && item.labelAr ? item.labelAr : item.label) : "");
    setFormData((prev) => ({
      ...prev,
      partyId: item?.partyId || selectedPartyId,
      accountId: item?.accountId || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateOpportunityInput = {
      title: formData.title.trim(),
      estimatedAmount: Number(formData.estimatedAmount),
      currencyCode: formData.currencyCode?.trim().toUpperCase() || defaultDealCurrency || baseCurrency || "SAR",
      targetStageKey: formData.targetStageKey || defaultStageKey,
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
        currencyCode: defaultDealCurrency || baseCurrency || "SAR",
        targetStageKey: defaultStageKey,
        targetCloseDate: "",
        dealKind: "NewBusiness",
        directCreateRationale: "",
        partyId: "",
        accountId: "",
      });
      setSelectedPartyLabel("");
      setCustomFieldValues({});
      setErrors({});
    }
  };

  const isProposalOrLater = isStagePartyRequired;
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

          <CreateOpportunityTitleAmountFields
            t={t}
            formData={formData}
            defaultDealCurrency={defaultDealCurrency || "SAR"}
            errors={errors}
            onChangeFormData={setFormData}
          />

          {preview.isDifferentCurrency && (
            <OpportunityConversionPreviewBanner
              baseCurrency={preview.baseCurrency}
              formattedConverted={preview.formattedConverted}
              rateSummary={preview.rateSummary}
              label={t("crmOpportunities.dialogs.create.autoConvertedToBase")}
            />
          )}

          <CreateOpportunityPartyStageFields
            t={t}
            isRtl={isRtl}
            formData={formData}
            onChangeFormData={setFormData}
            stageOptions={stageOptions}
            selectedPartyLabel={selectedPartyLabel}
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
