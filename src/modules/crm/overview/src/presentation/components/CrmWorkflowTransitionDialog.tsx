"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import {
  type CrmWorkflowTransitionDialogProps,
  type CrmWorkflowTransitionSubmitPayload,
  type CrmWorkflowTransitionFormData,
  LOSS_REASONS,
  DISQUALIFICATION_REASONS,
  buildTransitionSchema,
  getDefaultTransitionValues,
} from "./crmTransitionTypes";

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
  evalResult,
  onSubmit,
  isSubmitting = false,
}: CrmWorkflowTransitionDialogProps) {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";

  const availableTransitions = useMemo(() => {
    if (evalResult?.matchedTransitions && evalResult.matchedTransitions.length > 0) {
      return evalResult.matchedTransitions;
    }
    return evalResult?.matchedTransition ? [evalResult.matchedTransition] : [];
  }, [evalResult]);

  const [selectedTransitionId, setSelectedTransitionId] = useState<string>("");

  useEffect(() => {
    if (open) {
      const initialId = evalResult?.matchedTransition?.id || availableTransitions[0]?.id || "";
      setSelectedTransitionId(initialId);
    }
  }, [open, evalResult, availableTransitions]);

  const isDone = evalResult?.targetStage?.category === "done";
  const isLost = evalResult?.targetStage?.category === "lost";
  const isReopen = Boolean(evalResult?.requiresReopenReason);
  const requiresParty = Boolean(
    evalResult?.requiresVerifiedParty &&
      !record?.partyId &&
      !record?.organizationPartyId &&
      !record?.personPartyId
  );
  const requiresFinance = Boolean(evalResult?.requiresFinancialForecast);
  const isLeadConvert = Boolean(
    entityType === "lead" &&
      (evalResult?.shouldTriggerDealConversion || evalResult?.triggerDealConversion || isDone)
  );

  const schema: z.ZodType<CrmWorkflowTransitionFormData> = useMemo(() => {
    return buildTransitionSchema({
      requiresParty,
      requiresFinance,
      isDone,
      isLost,
      isReopen,
      isLeadConvert,
      entityType,
      evalResult,
      t,
    });
  }, [requiresParty, requiresFinance, isDone, isLost, isReopen, isLeadConvert, entityType, evalResult, t]);

  const defaultValues: Partial<CrmWorkflowTransitionFormData> = useMemo(
    () => getDefaultTransitionValues(record),
    [record]
  );

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CrmWorkflowTransitionFormData>({
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  const selectedLossReason = watch("lossReasonCode");

  const handleFormSubmit = async (data: CrmWorkflowTransitionFormData) => {
    if (!record) return;
    const payload: CrmWorkflowTransitionSubmitPayload = {
      entityId: record.id, targetStageKey: toStageKey, transitionId: selectedTransitionId || undefined, expectedRowVersion: record.rowVersion,
      partyId: data.partyId || undefined, estimatedAmount: data.estimatedAmount, actualAmount: data.actualAmount,
      targetCloseDate: data.targetCloseDate || undefined, closeNotes: data.closeNotes || undefined,
      lossReasonCode: data.lossReasonCode || undefined, competitorName: data.competitorName || undefined,
      disqualificationReasonCode: data.disqualificationReasonCode || undefined, reopenReason: data.reopenReason || undefined,
      reason: data.reason || data.reopenReason || undefined, auditNote: data.auditNote || undefined,
      convertDealTitle: data.convertDealTitle || undefined,
    };
    const success = await onSubmit(payload);
    if (success !== false) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" dir={dir}>
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-nx-md bg-nx-accent-wash text-nx-accent border border-nx-line">
              <ShieldCheck className="size-4" />
            </span>
            <DialogTitle className="text-base font-bold text-nx-ink">
              {t("crm.transitionDialog.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {fromStageKey} {toStageKey}
          </DialogDescription>
          <div className="flex items-center gap-1.5 mt-2">
            <Badge variant="outline" className="text-xs font-medium border-nx-line bg-nx-surface text-nx-ink" title={fromStageKey}>
              {fromStageLabel || fromStageKey}
            </Badge>
            <ArrowRight className="size-3.5 text-nx-ink-3 rtl:rotate-180 shrink-0" />
            <Badge variant="outline" className="text-xs font-medium border-nx-line bg-nx-surface text-nx-ink" title={toStageKey}>
              {toStageLabel || toStageKey}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 px-6 pb-6 pt-2">
          <Alert variant="default" className="border-nx-line bg-nx-raised/40 py-2.5">
            <AlertCircle className="size-3.5 text-nx-accent shrink-0" />
            <AlertDescription className="text-[11px] text-nx-ink-2">
              {t("crm.transitionDialog.fieldsRequiredNotice")}
            </AlertDescription>
          </Alert>

          {availableTransitions.length > 1 && (
            <div className="space-y-1.5" data-testid="transition-path-container">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crm.transitionDialog.selectTransitionPath", { defaultValue: "Transition Path" })}
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

          {requiresParty && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.partyLabel")} <span className="text-destructive">*</span></Label>
              {partyOptions && partyOptions.length > 0 ? (
                <Controller control={control} name="partyId" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface"><SelectValue placeholder={t("crm.transitionDialog.partyPlaceholder")} /></SelectTrigger>
                    <SelectContent>{partyOptions.map((p) => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              ) : (
                <Input {...register("partyId")} placeholder={t("crm.transitionDialog.partyPlaceholder")} className="h-8 text-xs border-nx-line bg-nx-surface" />
              )}
              {errors.partyId && <p className="text-[11px] text-destructive">{errors.partyId.message}</p>}
            </div>
          )}

          {requiresFinance && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.estimatedAmountLabel")}</Label>
                <Input type="number" step="any" {...register("estimatedAmount")} className="h-8 text-xs border-nx-line bg-nx-surface" />
                {errors.estimatedAmount && <p className="text-[11px] text-destructive">{errors.estimatedAmount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.targetCloseDateLabel")}</Label>
                <Input type="date" {...register("targetCloseDate")} className="h-8 text-xs border-nx-line bg-nx-surface" />
              </div>
            </div>
          )}

          {isLeadConvert && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.convertDealTitleLabel")}</Label>
              <Input {...register("convertDealTitle")} placeholder={t("crm.transitionDialog.convertDealTitlePlaceholder")} className="h-8 text-xs border-nx-line bg-nx-surface" />
              {errors.convertDealTitle && <p className="text-[11px] text-destructive">{errors.convertDealTitle.message}</p>}
            </div>
          )}

          {isDone && entityType === "deal" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.actualAmountLabel")}</Label>
              <Input type="number" step="any" {...register("actualAmount")} className="h-8 text-xs border-nx-line bg-nx-surface" />
            </div>
          )}

          {isLost && entityType === "deal" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.lossReasonLabel")}</Label>
                <Controller control={control} name="lossReasonCode" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface"><SelectValue placeholder={t("crm.transitionDialog.lossReasonPlaceholder")} /></SelectTrigger>
                    <SelectContent>{LOSS_REASONS.map((r) => <SelectItem key={r.code} value={r.code} className="text-xs">{t(r.labelKey)}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
              {selectedLossReason === "COMPETITOR" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.competitorNameLabel")} <span className="text-destructive">*</span></Label>
                  <Input {...register("competitorName")} placeholder={t("crm.transitionDialog.competitorNamePlaceholder")} className="h-8 text-xs border-nx-line bg-nx-surface" />
                  {errors.competitorName && <p className="text-[11px] text-destructive">{errors.competitorName.message}</p>}
                </div>
              )}
            </>
          )}

          {isLost && entityType === "lead" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.disqualificationReasonLabel")}</Label>
              <Controller control={control} name="disqualificationReasonCode" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface"><SelectValue placeholder={t("crm.transitionDialog.disqualificationReasonPlaceholder")} /></SelectTrigger>
                  <SelectContent>{DISQUALIFICATION_REASONS.map((r) => <SelectItem key={r.code} value={r.code} className="text-xs">{t(r.labelKey)}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
          )}

          {(isDone || isLost) && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.closeNotesLabel")}</Label>
              <Textarea {...register("closeNotes")} placeholder={t("crm.transitionDialog.closeNotesPlaceholder")} className="min-h-[70px] text-xs border-nx-line bg-nx-surface resize-none" />
              {errors.closeNotes && <p className="text-[11px] text-destructive">{errors.closeNotes.message}</p>}
            </div>
          )}

          {isReopen && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.reopenReasonLabel")}</Label>
              <Textarea {...register("reopenReason")} placeholder={t("crm.transitionDialog.reopenReasonPlaceholder")} className="min-h-[70px] text-xs border-nx-line bg-nx-surface resize-none" />
              {errors.reopenReason && <p className="text-[11px] text-destructive">{errors.reopenReason.message}</p>}
            </div>
          )}

          {evalResult?.promptForComment && !isReopen && !isLost && !isDone && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.reasonLabel")}</Label>
              <Textarea {...register("reason")} placeholder={t("crm.transitionDialog.reasonPlaceholder")} className="min-h-[60px] text-xs border-nx-line bg-nx-surface resize-none" />
              {errors.reason && <p className="text-[11px] text-destructive">{errors.reason.message}</p>}
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="h-8 text-xs border-nx-line">
              {t("crm.transitionDialog.cancelBtn")}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-bold">
              {isSubmitting ? t("crm.transitionDialog.submittingBtn") : t("crm.transitionDialog.confirmBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
