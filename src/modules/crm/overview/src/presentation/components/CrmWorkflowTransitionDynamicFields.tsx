"use client";

import React from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmWorkflowTransitionFormData, TransitionDialogFlags } from "./crmTransitionTypes";
import { STAKEHOLDER_ROLES } from "./crmTransitionTypes";

/** Props for dynamically rendered stage gate and transition prompt inputs. */
export interface CrmWorkflowTransitionDynamicFieldsProps {
  flags: TransitionDialogFlags;
  control: Control<CrmWorkflowTransitionFormData>;
  register: UseFormRegister<CrmWorkflowTransitionFormData>;
  errors: FieldErrors<CrmWorkflowTransitionFormData>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/** Renders dynamic `@core/ui/*` transition gate inputs derived from `evalResult`. */
export function CrmWorkflowTransitionDynamicFields({
  flags,
  control,
  register,
  errors,
  t,
}: CrmWorkflowTransitionDynamicFieldsProps) {
  return (
    <>
      {flags.needsSolutionFit && (
        <div className="space-y-1.5 rounded-nx-md border border-nx-line bg-nx-surface/60 p-2.5">
          <div className="flex items-start gap-2">
            <Controller
              control={control}
              name="solutionFitConfirmed"
              render={({ field }) => (
                <Checkbox
                  id="transition-solution-fit"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  className="mt-0.5"
                />
              )}
            />
            <div className="space-y-0.5">
              <Label htmlFor="transition-solution-fit" className="text-xs font-semibold text-nx-ink cursor-pointer">
                {t("crm.transitionDialog.solutionFitConfirmedLabel")}{" "}
                {flags.requireSolutionFit && <span className="text-destructive">*</span>}
              </Label>
              <p className="text-[11px] text-nx-ink-3">{t("crm.transitionDialog.solutionFitConfirmedHint")}</p>
            </div>
          </div>
          {errors.solutionFitConfirmed && (
            <p className="text-[11px] text-destructive">{errors.solutionFitConfirmed.message}</p>
          )}
        </div>
      )}

      {flags.needsPrimaryContactRole && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.primaryContactRoleLabel")}{" "}
            {flags.requirePrimaryContactRole && <span className="text-destructive">*</span>}
          </Label>
          <Controller
            control={control}
            name="primaryContactRole"
            render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface">
                  <SelectValue placeholder={t("crm.transitionDialog.primaryContactRolePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {STAKEHOLDER_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="text-xs">
                      {t(role.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.primaryContactRole && (
            <p className="text-[11px] text-destructive">{errors.primaryContactRole.message}</p>
          )}
        </div>
      )}

      {flags.needsQualificationNotes && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.qualificationNotesLabel")}{" "}
            {flags.requireQualificationNotes && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            {...register("qualificationNotes")}
            placeholder={t("crm.transitionDialog.qualificationNotesPlaceholder")}
            className="min-h-[65px] text-xs border-nx-line bg-nx-surface resize-none"
          />
          {errors.qualificationNotes && (
            <p className="text-[11px] text-destructive">{errors.qualificationNotes.message}</p>
          )}
        </div>
      )}
    </>
  );
}
