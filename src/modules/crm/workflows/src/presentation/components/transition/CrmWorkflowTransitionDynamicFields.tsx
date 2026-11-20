"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { CrmTransitionDynamicEntityPickers } from "./CrmTransitionDynamicEntityPickers";
import { CrmWorkflowTransitionCustomFields } from "./CrmWorkflowTransitionCustomFields";
import { STAKEHOLDER_ROLES } from "@modules/crm/shared";
import {
  type CrmWorkflowTransitionCustomFieldSpec,
  type CrmWorkflowTransitionFormData,
  type TransitionDialogFlags,
  type TransitionRecordContext,
} from "./crmTransitionTypes";

/** Props for `CrmWorkflowTransitionDynamicFields`. */
export interface CrmWorkflowTransitionDynamicFieldsProps {
  flags: TransitionDialogFlags;
  record: TransitionRecordContext | null;
  accountFilterId?: string;
  customFields: CrmWorkflowTransitionCustomFieldSpec[];
  currencyCode?: string;
  control: Control<CrmWorkflowTransitionFormData>;
  register: UseFormRegister<CrmWorkflowTransitionFormData>;
  errors: FieldErrors<CrmWorkflowTransitionFormData>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/** Renders dynamic `@core/ui/*` transition gate inputs derived from `evalResult` and custom fields (<200 lines). */
export function CrmWorkflowTransitionDynamicFields({
  flags, record, accountFilterId, customFields, currencyCode = "SAR", control, register, errors, t,
}: CrmWorkflowTransitionDynamicFieldsProps) {
  return (
    <>
      <CrmTransitionDynamicEntityPickers flags={flags} record={record} accountFilterId={accountFilterId} control={control} errors={errors} t={t} />

      {flags.needsDiscountPercent && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.discountPercentLabel")} {flags.requireDiscountPercent && <span className="text-destructive">*</span>}
          </Label>
          <Input type="number" min={0} max={100} step="0.5" {...register("discountPercent")} placeholder={t("crm.transitionDialog.discountPercentPlaceholder")} className="h-8 text-xs border-nx-line bg-nx-surface" data-testid="crm-transition-discount-input" />
          {errors.discountPercent && <p className="text-[11px] text-destructive">{errors.discountPercent.message}</p>}
        </div>
      )}

      {flags.needsLeadPhoneOrEmail && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.leadPhoneOrEmailLabel")} {flags.requireLeadPhoneOrEmail && <span className="text-destructive">*</span>}
          </Label>
          <Input {...register("leadPhoneOrEmail")} placeholder={t("crm.transitionDialog.leadPhoneOrEmailPlaceholder")} className="h-8 text-xs border-nx-line bg-nx-surface" />
          {errors.leadPhoneOrEmail && <p className="text-[11px] text-destructive">{errors.leadPhoneOrEmail.message}</p>}
        </div>
      )}

      {flags.needsLeadSourceChannel && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.leadSourceChannelLabel")} {flags.requireLeadSourceChannel && <span className="text-destructive">*</span>}
          </Label>
          <Input {...register("leadSourceChannel")} placeholder={t("crm.transitionDialog.leadSourceChannelPlaceholder")} className="h-8 text-xs border-nx-line bg-nx-surface" />
          {errors.leadSourceChannel && <p className="text-[11px] text-destructive">{errors.leadSourceChannel.message}</p>}
        </div>
      )}

      {flags.needsSolutionFit && (
        <div className="space-y-1.5 rounded-nx-md border border-nx-line bg-nx-surface/60 p-2.5">
          <div className="flex items-start gap-2">
            <Controller control={control} name="solutionFitConfirmed" render={({ field }) => (
              <Checkbox id="transition-solution-fit" checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} className="mt-0.5" />
            )} />
            <div className="space-y-0.5">
              <Label htmlFor="transition-solution-fit" className="text-xs font-semibold text-nx-ink cursor-pointer">
                {t("crm.transitionDialog.solutionFitConfirmedLabel")} {flags.requireSolutionFit && <span className="text-destructive">*</span>}
              </Label>
              <p className="text-[11px] text-nx-ink-3">{t("crm.transitionDialog.solutionFitConfirmedHint")}</p>
            </div>
          </div>
          {errors.solutionFitConfirmed && <p className="text-[11px] text-destructive">{errors.solutionFitConfirmed.message}</p>}
        </div>
      )}

      {flags.needsPrimaryContactRole && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.primaryContactRoleLabel")} {flags.requirePrimaryContactRole && <span className="text-destructive">*</span>}
          </Label>
          <Controller control={control} name="primaryContactRole" render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger id="stage-gate-contact-role" className="h-8 text-xs border-nx-line bg-nx-surface"><SelectValue placeholder={t("crm.transitionDialog.primaryContactRolePlaceholder")} /></SelectTrigger>
              <SelectContent>
                {STAKEHOLDER_ROLES.map((role) => (<SelectItem key={role.value} value={role.value} className="text-xs">{t(role.labelKey)}</SelectItem>))}
              </SelectContent>
            </Select>
          )} />
          {errors.primaryContactRole && <p className="text-[11px] text-destructive">{errors.primaryContactRole.message}</p>}
        </div>
      )}

      {flags.needsNextStepSummary && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.nextStepSummaryLabel")} {flags.requireNextStepSummary && <span className="text-destructive">*</span>}
          </Label>
          <Textarea {...register("nextStepSummary")} placeholder={t("crm.transitionDialog.nextStepSummaryPlaceholder")} className="min-h-[60px] text-xs border-nx-line bg-nx-surface resize-none" />
          {errors.nextStepSummary && <p className="text-[11px] text-destructive">{errors.nextStepSummary.message}</p>}
        </div>
      )}

      {flags.needsQualificationNotes && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.qualificationNotesLabel")} {flags.requireQualificationNotes && <span className="text-destructive">*</span>}
          </Label>
          <Textarea {...register("qualificationNotes")} placeholder={t("crm.transitionDialog.qualificationNotesPlaceholder")} className="min-h-[65px] text-xs border-nx-line bg-nx-surface resize-none" />
          {errors.qualificationNotes && <p className="text-[11px] text-destructive">{errors.qualificationNotes.message}</p>}
        </div>
      )}

      {flags.needsLeadBantNotes && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.leadBantNotesLabel")} {flags.requireLeadBantNotes && <span className="text-destructive">*</span>}
          </Label>
          <Textarea {...register("leadBantNotes")} placeholder={t("crm.transitionDialog.leadBantNotesPlaceholder")} className="min-h-[65px] text-xs border-nx-line bg-nx-surface resize-none" />
          {errors.leadBantNotes && <p className="text-[11px] text-destructive">{errors.leadBantNotes.message}</p>}
        </div>
      )}

      <CrmWorkflowTransitionCustomFields customFields={customFields} control={control} errors={errors} currencyCode={currencyCode} />
    </>
  );
}
