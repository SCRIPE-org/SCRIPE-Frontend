"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { CustomFieldCurrencyValue } from "../../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { isBlankAmount, getCurrencySuggestions } from "./currencyControlUtils";

export interface CurrencyCustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: CustomFieldCurrencyValue | null) => void;
  /** Mirrors standard field control view-only state. */
  isViewMode?: boolean;
  /**
   * Validation verdict from the host form.
   * Applied to both inputs to visually indicate validation errors.
   */
  invalid?: boolean;
  /** Identifier of the host form's hint/error node. */
  describedBy?: string;
}

/**
 * Specialized edit control for currency custom fields.
 * Manages a composite value consisting of a numeric amount and a 3-letter ISO 4217 currency code.
 * Provides live uppercase transformation, code suggestion datalist, and pair-requirement validation.
 */
export function CurrencyCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
  invalid,
  describedBy,
}: CurrencyCustomFieldControlProps): React.ReactElement {
  const { t, language } = useI18n();

  const current =
    value && typeof value === "object" ? (value as Partial<CustomFieldCurrencyValue>) : undefined;
  const amount = current?.amount ?? "";
  const currencyCode = current?.currencyCode ?? "";

  const fieldName = fc.label ?? fc.name;
  const pairHintId = `${fc.name}-pair-hint`;
  const suggestionsId = `${fc.name}-currency-suggestions`;
  const describedByValue = [describedBy, pairHintId].filter(Boolean).join(" ");
  const suggestions = React.useMemo(() => getCurrencySuggestions(language), [language]);

  // If one component is populated, the counterpart is required to ensure complete currency records.
  const codePopulated = currencyCode.trim() !== "";
  const amountPopulated = !isBlankAmount(amount);
  const amountRequired = Boolean(fc.required) || codePopulated;
  const codeRequired = Boolean(fc.required) || amountPopulated;

  const emit = (nextAmount: unknown, nextCode: string) => {
    if (isBlankAmount(nextAmount) && nextCode.trim() === "") {
      onChange(null);
      return;
    }
    onChange({ amount: nextAmount as number | string, currencyCode: nextCode });
  };

  const handleAmountChange = (raw: string) => emit(raw, currencyCode);

  // Filter input to uppercase ASCII characters with a maximum length of 3 letters.
  const handleCodeChange = (raw: string) =>
    emit(amount, raw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3));

  return (
    <div role="group" aria-label={fieldName} className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={fc.name}
          aria-label={t("customField.currency.amountLabel", { field: fieldName })}
          type="number"
          step="any"
          value={String(amount)}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder={fc.placeholder}
          required={amountRequired}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={describedByValue}
          className="flex-1 text-sm"
        />
        <Input
          id={`${fc.name}-currency-code`}
          aria-label={t("customField.currency.codeLabel", { field: fieldName })}
          type="text"
          value={currencyCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={t("customField.currency.codePlaceholder")}
          maxLength={3}
          pattern="[A-Z]{3}"
          required={codeRequired}
          list={suggestionsId}
          dir="ltr"
          autoComplete="off"
          spellCheck={false}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={describedByValue}
          className="w-24 shrink-0 font-mono text-sm uppercase"
        />
        <datalist id={suggestionsId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion.code} value={suggestion.code} label={suggestion.label} />
          ))}
        </datalist>
      </div>
      <p id={pairHintId} className="text-xs text-nx-ink-3">
        {t("customField.currency.pairHint")}
      </p>
    </div>
  );
}
