"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { CrmEntitySearchSelect } from "@modules/crm/shared";
import { CrmWorkflowTransitionDynamicFields } from "./CrmWorkflowTransitionDynamicFields";
import {
  buildTransitionQuickCreateDefaults,
  type CrmWorkflowTransitionCustomFieldSpec,
  type CrmWorkflowTransitionFormData,
  type PartyOption,
  type TransitionDialogFlags,
  type TransitionRecordContext,
} from "./crmTransitionTypes";

/** Props for `CrmWorkflowTransitionGateSection`. */
export interface CrmWorkflowTransitionGateSectionProps {
  flags: TransitionDialogFlags;
  record: TransitionRecordContext | null;
  partyOptions?: PartyOption[];
  accountFilterId?: string;
  customFields: CrmWorkflowTransitionCustomFieldSpec[];
  recordCurrency: string;
  baseCurrency: string;
  showConvertedPreview: boolean;
  convertedEstimateAmount: number;
  control: Control<CrmWorkflowTransitionFormData>;
  register: UseFormRegister<CrmWorkflowTransitionFormData>;
  errors: FieldErrors<CrmWorkflowTransitionFormData>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/** Renders the grouped Required Exit-Gate Fields card inside the stage transition dialog. */
export function CrmWorkflowTransitionGateSection({
  flags,
  record,
  partyOptions,
  accountFilterId,
  customFields,
  recordCurrency,
  baseCurrency,
  showConvertedPreview,
  convertedEstimateAmount,
  control,
  register,
  errors,
  t,
}: CrmWorkflowTransitionGateSectionProps) {
  return (
    <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-ground/50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-nx-ink-2">
        {t("crm.transitionDialog.requiredSectionTitle")}
      </p>

      {flags.requiresParty && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.partyLabel")} <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="partyId"
            render={({ field }) =>
              partyOptions && partyOptions.length > 0 ? (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface">
                    <SelectValue placeholder={t("crm.transitionDialog.partyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {partyOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <CrmEntitySearchSelect
                  entityKind="party"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  initialLabel={record?.partyDisplayName}
                  enableQuickCreate
                  quickCreateInitialValues={buildTransitionQuickCreateDefaults(record, "party")}
                  required
                  invalid={Boolean(errors.partyId)}
                  placeholder={t("crm.transitionDialog.partyPlaceholder")}
                  data-testid="crm-transition-party-select"
                />
              )
            }
          />
          {errors.partyId && <p className="text-[11px] text-destructive">{errors.partyId.message}</p>}
        </div>
      )}

      {flags.requiresFinance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink flex items-center justify-between">
              <span>{t("crm.transitionDialog.estimatedAmountLabel")}</span>
              <span className="text-[10px] font-mono text-nx-ink-3">{recordCurrency}</span>
            </Label>
            <Input type="number" step="any" {...register("estimatedAmount")} className="h-8 text-xs border-nx-line bg-nx-surface" />
            {showConvertedPreview && (
              <p className="text-[10px] text-nx-ink-3 font-mono">
                {t("crm.transitionDialog.convertedPreviewLabel")} ~ {baseCurrency}{" "}
                {Math.round(convertedEstimateAmount).toLocaleString()}
              </p>
            )}
            {errors.estimatedAmount && <p className="text-[11px] text-destructive">{errors.estimatedAmount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.targetCloseDateLabel")}</Label>
            <Input type="date" {...register("targetCloseDate")} className="h-8 text-xs border-nx-line bg-nx-surface" />
            {errors.targetCloseDate && <p className="text-[11px] text-destructive">{errors.targetCloseDate.message}</p>}
          </div>
        </div>
      )}

      {flags.isLeadConvert && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">{t("crm.transitionDialog.convertDealTitleLabel")}</Label>
          <Input
            {...register("convertDealTitle")}
            placeholder={t("crm.transitionDialog.convertDealTitlePlaceholder")}
            className="h-8 text-xs border-nx-line bg-nx-surface"
          />
          {errors.convertDealTitle && <p className="text-[11px] text-destructive">{errors.convertDealTitle.message}</p>}
        </div>
      )}

      <CrmWorkflowTransitionDynamicFields
        flags={flags}
        record={record}
        accountFilterId={accountFilterId}
        customFields={customFields}
        currencyCode={recordCurrency}
        control={control}
        register={register}
        errors={errors}
        t={t}
      />
    </div>
  );
}
