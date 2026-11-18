"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { CrmWorkflowTransitionGateSection } from "./CrmWorkflowTransitionGateSection";
import { CrmWorkflowTransitionOutcomeFields } from "./CrmWorkflowTransitionOutcomeFields";
import { useCrmSettingsStore } from "../stores/useCrmSettingsStore";
import { useCrmCurrency } from "../viewmodels/useCrmCurrency";
import {
  type CrmWorkflowTransitionCustomFieldSpec,
  type CrmWorkflowTransitionDialogProps,
  type CrmWorkflowTransitionFormData,
  LOSS_REASONS,
  DISQUALIFICATION_REASONS,
  deriveTransitionDialogFlags,
  buildTransitionSchema,
  buildTransitionSubmitPayload,
  getDefaultTransitionValues,
  resolveTransitionCustomFields,
} from "./crmTransitionTypes";

export { LOSS_REASONS, DISQUALIFICATION_REASONS };

const EMPTY_CUSTOM_FIELDS: CrmWorkflowTransitionCustomFieldSpec[] = [];

export function CrmWorkflowTransitionDialog({
  open,
  onOpenChange,
  entityType,
  record,
  fromStageKey,
  toStageKey,
  fromStageLabel,
  toStageLabel,
  partyOptions,
  customFieldsCatalog = EMPTY_CUSTOM_FIELDS,
  evalResult,
  onSubmit,
  isSubmitting = false,
}: CrmWorkflowTransitionDialogProps) {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const storeCustomFields = useCrmSettingsStore((s) => s.crmCustomFields);
  const { baseCurrency, defaultDealCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();

  const availableTransitions = useMemo(() => {
    if (evalResult?.matchedTransitions && evalResult.matchedTransitions.length > 0) {
      return evalResult.matchedTransitions;
    }
    return evalResult?.matchedTransition ? [evalResult.matchedTransition] : [];
  }, [evalResult]);

  const [selectedTransitionId, setSelectedTransitionId] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedTransitionId(evalResult?.matchedTransition?.id || availableTransitions[0]?.id || "");
    }
  }, [open, evalResult, availableTransitions]);

  const flags = useMemo(
    () => deriveTransitionDialogFlags(evalResult, record, entityType),
    [evalResult, record, entityType]
  );

  const activeCustomFields = useMemo(
    () => resolveTransitionCustomFields(evalResult, storeCustomFields, entityType, toStageKey, customFieldsCatalog),
    [evalResult, storeCustomFields, entityType, toStageKey, customFieldsCatalog]
  );

  const schema = useMemo(
    () => buildTransitionSchema({ flags, entityType, customFields: activeCustomFields, t }),
    [flags, entityType, activeCustomFields, t]
  );

  const defaultValues = useMemo(
    () => getDefaultTransitionValues(record, activeCustomFields),
    [record, activeCustomFields]
  );

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<CrmWorkflowTransitionFormData>({
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  const lastResetKeyRef = useRef<string>("");
  const recordId = record?.id ?? "";
  useEffect(() => {
    if (!open) {
      lastResetKeyRef.current = "";
      return;
    }
    const nextKey = `${recordId}::${toStageKey}`;
    if (lastResetKeyRef.current !== nextKey) {
      lastResetKeyRef.current = nextKey;
      reset(defaultValues);
    }
  }, [open, recordId, toStageKey, defaultValues, reset]);

  const selectedLossReason = watch("lossReasonCode");
  const watchedAccountId = watch("accountId");
  const watchedEstimatedAmount = watch("estimatedAmount");
  const recordCurrency = (record?.currencyCode || record?.currency || defaultDealCurrency || "SAR").toUpperCase();
  const numericEstimate = Number(watchedEstimatedAmount);
  const showConvertedPreview =
    autoConvertToBase && recordCurrency !== baseCurrency && Number.isFinite(numericEstimate) && numericEstimate > 0;
  const convertedEstimateAmount = showConvertedPreview
    ? convertAmount(numericEstimate, recordCurrency, baseCurrency)
    : 0;

  const hasGateSection =
    flags.requiresParty || flags.requiresFinance || flags.isLeadConvert || flags.needsAccountId ||
    flags.needsContactId || flags.needsOwnerUserId || flags.needsDiscountPercent ||
    flags.needsNextStepSummary || flags.needsLeadPhoneOrEmail || flags.needsLeadSourceChannel ||
    flags.needsLeadBantNotes || flags.needsSolutionFit || flags.needsPrimaryContactRole ||
    flags.needsQualificationNotes || activeCustomFields.length > 0;

  const handleFormSubmit = async (data: CrmWorkflowTransitionFormData) => {
    if (!record) return;
    const payload = buildTransitionSubmitPayload({
      record,
      toStageKey,
      selectedTransitionId,
      flags,
      data,
      hasCustomFields: activeCustomFields.length > 0,
    });
    const success = await onSubmit(payload);
    if (success !== false) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-nx-surface border-nx-line" dir={dir}>
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-nx-md bg-nx-accent-wash text-nx-accent border border-nx-line">
              <ShieldCheck className="size-4" />
            </span>
            <DialogTitle className="text-base font-bold text-nx-ink">{t("crm.transitionDialog.title")}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">{fromStageKey} {toStageKey}</DialogDescription>
          <div className="flex items-center gap-1.5 mt-2">
            <Badge variant="outline" className="text-xs font-medium border-nx-line bg-nx-ground text-nx-ink" title={fromStageKey}>
              {fromStageLabel || fromStageKey}
            </Badge>
            <ArrowRight className="size-3.5 text-nx-ink-3 rtl:rotate-180 shrink-0" />
            <Badge variant="outline" className="text-xs font-medium border-nx-line bg-nx-ground text-nx-ink" title={toStageKey}>
              {toStageLabel || toStageKey}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4 px-6 pb-6 pt-2 max-h-[75vh] overflow-y-auto">
          <Alert variant="default" className="border-nx-line bg-nx-raised/40 py-2.5">
            <AlertCircle className="size-3.5 text-nx-accent shrink-0" />
            <AlertDescription className="text-[11px] text-nx-ink-2">
              {t("crm.transitionDialog.fieldsRequiredNotice")}
            </AlertDescription>
          </Alert>

          {availableTransitions.length > 1 && (
            <div className="space-y-1.5" data-testid="transition-path-container">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crm.transitionDialog.selectTransitionPath")}
              </Label>
              <Select value={selectedTransitionId} onValueChange={setSelectedTransitionId}>
                <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface" data-testid="transition-path-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((tr) => (
                    <SelectItem key={tr.id} value={tr.id} className="text-xs">
                      {language === "ar" && tr.nameAr ? tr.nameAr : tr.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {hasGateSection && (
            <CrmWorkflowTransitionGateSection
              flags={flags}
              record={record}
              partyOptions={partyOptions}
              accountFilterId={watchedAccountId}
              customFields={activeCustomFields}
              recordCurrency={recordCurrency}
              baseCurrency={baseCurrency}
              showConvertedPreview={showConvertedPreview}
              convertedEstimateAmount={convertedEstimateAmount}
              control={control}
              register={register}
              errors={errors}
              t={t}
            />
          )}

          <CrmWorkflowTransitionOutcomeFields
            entityType={entityType}
            flags={flags}
            currencyCode={recordCurrency}
            selectedLossReason={selectedLossReason}
            control={control}
            register={register}
            errors={errors}
            t={t}
          />

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="h-8 text-xs border-nx-line">
              {t("crm.transitionDialog.cancelBtn")}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-bold bg-nx-accent-fill text-nx-on-fill hover:bg-nx-accent-fill/90">
              {isSubmitting ? t("crm.transitionDialog.submittingBtn") : t("crm.transitionDialog.confirmBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
