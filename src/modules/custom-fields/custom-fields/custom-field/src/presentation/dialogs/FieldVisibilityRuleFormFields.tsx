"use client";

import * as React from "react";
import { Input } from "@core/ui/input";
import { Skeleton } from "@core/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../domain/entities/CustomField";
import {
  FIELD_VISIBILITY_OPERATORS,
  type FieldVisibilityOperator,
} from "../../../../custom-field-value/src/domain/fieldVisibility";

/**
 * Documentation for module export
 */
export interface FieldVisibilityRuleFormFieldsProps {
  isAdvancedJson: boolean;
  rawJsonInput: string;
  onRawJsonChange: (val: string) => void;
  isBusy: boolean;
  isSiblingFieldsLoading: boolean;
  siblingFields: readonly CustomField[];
  selectedOperandKey: string;
  onOperandChange: (val: string) => void;
  selectedOperator: FieldVisibilityOperator;
  onOperatorChange: (val: FieldVisibilityOperator) => void;
  getOperatorLabel: (operator: string | null | undefined) => string;
  valueInput: string;
  onValueChange: (val: string) => void;
  priorityInput: number;
  onPriorityChange: (val: number) => void;
}

/**
 * Form inputs for visibility rule criteria, switching between raw JSON and structured operand/operator inputs.
 */
export function FieldVisibilityRuleFormFields({
  isAdvancedJson,
  rawJsonInput,
  onRawJsonChange,
  isBusy,
  isSiblingFieldsLoading,
  siblingFields,
  selectedOperandKey,
  onOperandChange,
  selectedOperator,
  onOperatorChange,
  getOperatorLabel,
  valueInput,
  onValueChange,
  priorityInput,
  onPriorityChange,
}: FieldVisibilityRuleFormFieldsProps): React.ReactElement {
  const { t, language } = useI18n();

  if (isAdvancedJson) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-nx-ink-2">
          {t("customField.visibilityRules.rawJsonPayload")}
        </label>
        <textarea
          className="h-32 w-full rounded-md border border-nx-line bg-background p-2 font-mono text-xs text-nx-ink focus:outline-none focus:ring-1 focus:ring-primary"
          value={rawJsonInput}
          onChange={(e) => onRawJsonChange(e.target.value)}
          placeholder='{ "version": 1, "visibleWhen": { ... } }'
          disabled={isBusy}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-nx-ink-2">
          {t("customField.visibilityRules.operandFieldLabel")}
        </label>
        {isSiblingFieldsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : siblingFields.length === 0 ? (
          <p className="text-xs text-nx-ink-4">
            {t("customField.visibilityRules.noSiblingFields")}
          </p>
        ) : (
          <Select
            value={selectedOperandKey}
            onValueChange={onOperandChange}
            disabled={isBusy}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={t("customField.visibilityRules.selectOperandPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {siblingFields.map((field) => (
                <SelectItem key={field.id} value={field.key}>
                  {language === "ar" && field.labelAr
                    ? `${field.labelAr} (${field.key})`
                    : `${field.labelEn || field.key} (${field.key})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-nx-ink-2">
          {t("customField.visibilityRules.operatorLabel")}
        </label>
        <Select
          value={selectedOperator}
          onValueChange={onOperatorChange}
          disabled={isBusy}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_VISIBILITY_OPERATORS.map((op) => (
              <SelectItem key={op} value={op}>
                {getOperatorLabel(op)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOperator !== "isEmpty" && selectedOperator !== "isNotEmpty" ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-nx-ink-2">
            {t("customField.visibilityRules.valueLabel")}
          </label>
          <Input
            type="text"
            className="h-9 text-xs"
            value={valueInput}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={
              selectedOperator === "in" || selectedOperator === "notIn"
                ? t("customField.visibilityRules.listValuePlaceholder")
                : t("customField.visibilityRules.valuePlaceholder")
            }
            disabled={isBusy}
          />
          {(selectedOperator === "in" || selectedOperator === "notIn") && (
            <p className="text-[11px] text-nx-ink-4">
              {t("customField.visibilityRules.listValueHelp")}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center pt-6 text-xs text-nx-ink-3">
          {t("customField.visibilityRules.noValueNeeded")}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-nx-ink-2">
          {t("customField.visibilityRules.priorityLabel")}
        </label>
        <Input
          type="number"
          className="h-9 text-xs"
          value={priorityInput}
          onChange={(e) => onPriorityChange(parseInt(e.target.value, 10) || 0)}
          disabled={isBusy}
        />
      </div>
    </div>
  );
}
