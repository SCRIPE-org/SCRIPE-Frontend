"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Check, X } from "lucide-react";

interface BooleanIndicatorProps {
  value: boolean;
}

/** Provides both a visual icon and an equivalent localized text alternative. */
export function BooleanIndicator({ value }: BooleanIndicatorProps) {
  const { t } = useI18n();
  const label = value
    ? t("entitlements.editions.comparison.included") || "Included"
    : t("entitlements.editions.comparison.notIncluded") || "Not included";

  return (
    <span title={label}>
      <span className="sr-only">{label}</span>
      {value ? (
        <Check aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X aria-hidden="true" className="h-4 w-4 text-muted-foreground/60" />
      )}
    </span>
  );
}
