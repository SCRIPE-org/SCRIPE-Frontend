/**
 * Currency Select
 *
 * Reusable currency selection using the platform's GenericSelect.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Label } from "@core/ui/label";
import { BILLING_CURRENCIES } from "../constants";

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CurrencySelect({ value, onValueChange }: CurrencySelectProps) {
  const { t } = useI18n();

  const options = BILLING_CURRENCIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="space-y-2">
      <Label>{t("entitlements.promotions.currency") || "Currency"}</Label>
      <GenericSelect
        type="single"
        options={options}
        value={value}
        onValueChange={(v: string) => onValueChange(v)}
      />
    </div>
  );
}
