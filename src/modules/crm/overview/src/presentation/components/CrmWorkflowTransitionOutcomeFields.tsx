"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  DISQUALIFICATION_REASONS,
  LOSS_REASONS,
  type CrmWorkflowTransitionFormData,
  type TransitionDialogFlags,
} from "./crmTransitionTypes";

export interface CrmWorkflowTransitionOutcomeFieldsProps {
  entityType: "deal" | "lead";
  flags: TransitionDialogFlags;
  currencyCode: string;
  selectedLossReason?: string;
  control: Control<CrmWorkflowTransitionFormData>;
  register: UseFormRegister<CrmWorkflowTransitionFormData>;
  errors: FieldErrors<CrmWorkflowTransitionFormData>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Renders terminal outcome, win/loss/disqualification rationale, reopen, and audit fields.
 */
export function CrmWorkflowTransitionOutcomeFields({
  entityType,
  flags,
  currencyCode,
  selectedLossReason,
  control,
  register,
  errors,
  t,
}: CrmWorkflowTransitionOutcomeFieldsProps) {
  return (
    <>
      {flags.isDone && entityType === "deal" && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink flex items-center justify-between">
            <span>{t("crm.transitionDialog.actualAmountLabel")}</span>
            <span className="text-[10px] font-mono text-nx-ink-3">{currencyCode}</span>
          </Label>
          <Input type="number" step="any" {...register("actualAmount")} className="h-8 text-xs border-nx-line bg-nx-surface" />
          {errors.actualAmount && <p className="text-[11px] text-destructive">{errors.actualAmount.message}</p>}
        </div>
      )}

      {flags.requiresLossReason && entityType === "deal" && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.lossReasonLabel")}</Label>
            <Controller
              control={control}
              name="lossReasonCode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface">
                    <SelectValue placeholder={t("crm.transitionDialog.lossReasonPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {LOSS_REASONS.map((r) => (
                      <SelectItem key={r.code} value={r.code} className="text-xs">{t(r.labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.lossReasonCode && <p className="text-[11px] text-destructive">{errors.lossReasonCode.message}</p>}
          </div>

          {selectedLossReason === "COMPETITOR" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crm.transitionDialog.competitorNameLabel")} <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("competitorName")}
                placeholder={t("crm.transitionDialog.competitorNamePlaceholder")}
                className="h-8 text-xs border-nx-line bg-nx-surface"
              />
              {errors.competitorName && <p className="text-[11px] text-destructive">{errors.competitorName.message}</p>}
            </div>
          )}
        </>
      )}

      {flags.requiresLossReason && entityType === "lead" && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.disqualificationReasonLabel")}</Label>
          <Controller
            control={control}
            name="disqualificationReasonCode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface">
                  <SelectValue placeholder={t("crm.transitionDialog.disqualificationReasonPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {DISQUALIFICATION_REASONS.map((r) => (
                    <SelectItem key={r.code} value={r.code} className="text-xs">{t(r.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.disqualificationReasonCode && (
            <p className="text-[11px] text-destructive">{errors.disqualificationReasonCode.message}</p>
          )}
        </div>
      )}

      {flags.requiresCloseNotes && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.closeNotesLabel")}</Label>
          <Textarea
            {...register("closeNotes")}
            placeholder={t("crm.transitionDialog.closeNotesPlaceholder")}
            className="min-h-[70px] text-xs border-nx-line bg-nx-surface resize-none"
          />
          {errors.closeNotes && <p className="text-[11px] text-destructive">{errors.closeNotes.message}</p>}
        </div>
      )}

      {flags.requiresReopenReason && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.reopenReasonLabel")}</Label>
          <Textarea
            {...register("reopenReason")}
            placeholder={t("crm.transitionDialog.reopenReasonPlaceholder")}
            className="min-h-[70px] text-xs border-nx-line bg-nx-surface resize-none"
          />
          {errors.reopenReason && <p className="text-[11px] text-destructive">{errors.reopenReason.message}</p>}
        </div>
      )}

      {flags.requiresReasonPrompt && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.reasonLabel")}</Label>
          <Textarea
            {...register("reason")}
            placeholder={t("crm.transitionDialog.reasonPlaceholder")}
            className="min-h-[60px] text-xs border-nx-line bg-nx-surface resize-none"
          />
          {errors.reason && <p className="text-[11px] text-destructive">{errors.reason.message}</p>}
        </div>
      )}
    </>
  );
}
