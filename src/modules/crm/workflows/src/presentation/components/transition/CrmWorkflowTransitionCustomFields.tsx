"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { useI18n } from "@core/providers/i18n-provider";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { CrmEntitySearchSelect } from "@modules/crm/shared";
import type {
  CrmWorkflowTransitionCustomFieldSpec,
  CrmWorkflowTransitionFormData,
} from "./crmTransitionTypes";

/** Props for `CrmWorkflowTransitionCustomFields`. */
export interface CrmWorkflowTransitionCustomFieldsProps {
  customFields: CrmWorkflowTransitionCustomFieldSpec[];
  control: Control<CrmWorkflowTransitionFormData>;
  errors: FieldErrors<CrmWorkflowTransitionFormData>;
  currencyCode?: string;
}

/**
 * Renders tenant-defined custom fields bound to stage exit gates or transition rules.
 */
export function CrmWorkflowTransitionCustomFields({
  customFields,
  control,
  errors,
  currencyCode = "SAR",
}: CrmWorkflowTransitionCustomFieldsProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const customErrors = errors.customFields as Record<string, { message?: string } | undefined> | undefined;

  if (customFields.length === 0) return null;

  return (
    <div className="space-y-2.5 pt-1 border-t border-nx-line/70">
      <p className="text-[11px] font-bold uppercase tracking-wider text-nx-ink-2">
        {t("crm.transitionDialog.customFieldsSectionTitle")}
      </p>

      {customFields.map((cf) => {
        const label = (isRtl && cf.labelAr ? cf.labelAr : cf.labelEn) || cf.key;
        const fieldError = customErrors?.[cf.key]?.message;
        const fieldPath = `customFields.${cf.key}` as const;

        return (
          <div key={cf.key} className="space-y-1">
            {cf.valueType !== "Boolean" && (
              <Label className="text-xs font-semibold text-nx-ink flex items-center justify-between">
                <span>
                  {label} {cf.isRequired && <span className="text-destructive">*</span>}
                </span>
                {cf.valueType === "Currency" && (
                  <span className="text-[10px] font-mono text-nx-ink-3">{currencyCode}</span>
                )}
              </Label>
            )}

            <Controller
              control={control}
              name={fieldPath as keyof CrmWorkflowTransitionFormData & string}
              render={({ field }) => {
                if (cf.valueType === "Boolean") {
                  return (
                    <div className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-surface px-2.5 py-2">
                      <Checkbox
                        id={`cf-${cf.key}`}
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      />
                      <Label htmlFor={`cf-${cf.key}`} className="text-xs font-semibold text-nx-ink cursor-pointer">
                        {label} {cf.isRequired && <span className="text-destructive">*</span>}
                      </Label>
                    </div>
                  );
                }

                if (cf.valueType === "Select") {
                  return (
                    <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
                      <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-surface">
                        <SelectValue placeholder={t("crm.transitionDialog.selectOptionPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(cf.options ?? []).map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }

                if (cf.valueType === "EntityReference" || cf.valueType === "UserReference") {
                  return (
                    <CrmEntitySearchSelect
                      entityKind={cf.valueType === "UserReference" ? "user" : cf.referenceEntityKind ?? "party"}
                      value={field.value ? String(field.value) : ""}
                      onChange={(val: string) => field.onChange(val)}
                      required={cf.isRequired}
                      invalid={Boolean(fieldError)}
                      data-testid={`crm-transition-cf-${cf.key}`}
                    />
                  );
                }

                const inputType =
                  cf.valueType === "Number" || cf.valueType === "Currency"
                    ? "number"
                    : cf.valueType === "Date"
                      ? "date"
                      : "text";

                return (
                  <Input
                    type={inputType}
                    step={inputType === "number" ? "any" : undefined}
                    value={field.value === undefined || field.value === null ? "" : String(field.value)}
                    onChange={(e) =>
                      field.onChange(
                        inputType === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value
                      )
                    }
                    className="h-8 text-xs border-nx-line bg-nx-surface"
                    data-testid={`crm-transition-cf-${cf.key}`}
                  />
                );
              }}
            />

            {fieldError && <p className="text-[11px] text-destructive">{fieldError}</p>}
          </div>
        );
      })}
    </div>
  );
}
