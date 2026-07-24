"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Check, X } from "lucide-react";

interface BooleanIndicatorProps {
  value: boolean;
}

/**
 * Provides both a visual icon and an equivalent localized text alternative.
 *
 * The pair used to hang a `title` off the wrapper, which is not an accessible
 * name and never surfaces on touch — the sr-only span is what actually
 * announces the state, so the tooltip only repeated it for a mouse. The "off"
 * cross sits on `--nx-ink-3`, the measured quiet ink step, instead of opacity
 * math over a foreground colour.
 */
export function BooleanIndicator({ value }: BooleanIndicatorProps) {
  const { t } = useI18n();
  const label = value
    ? t("entitlements.editions.comparison.included")
    : t("entitlements.editions.comparison.notIncluded");

  return (
    <span className="inline-flex items-center justify-center">
      <span className="sr-only">{label}</span>
      {value ? (
        <Check aria-hidden="true" className="h-4 w-4 text-success" />
      ) : (
        <X aria-hidden="true" className="h-4 w-4 text-nx-ink-3" />
      )}
    </span>
  );
}
