/**
 * Subscription Type Select
 *
 * Reusable billing cycle selector using the platform's GenericSelect.
 * Filters available options based on edition billing controls.
 */
"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { GenericSelect } from "@core/crud/components/generic-select";

interface SubscriptionTypeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  /** If provided, filters options by edition billing controls */
  edition?: {
    allowLifetime?: boolean;
    allowTrial?: boolean;
    allowMonthly?: boolean;
    allowYearly?: boolean;
  } | null;
  /** Whether to show the Trial option (false for convert-trial dialog) */
  showTrial?: boolean;
  disabled?: boolean;
}

export function SubscriptionTypeSelect({
  value,
  onValueChange,
  edition,
  showTrial = true,
  disabled,
}: SubscriptionTypeSelectProps) {
  const { t } = useI18n();

  const options = useMemo(() => {
    const all = [
      {
        value: "Lifetime",
        label: t("entSubscriptions.lifetime"),
        show: !edition || edition.allowLifetime,
      },
      {
        value: "Trial",
        label: t("entSubscriptions.trial"),
        show: showTrial && (!edition || edition.allowTrial),
      },
      {
        value: "Monthly",
        label: t("entSubscriptions.monthly"),
        show: !edition || edition.allowMonthly,
      },
      {
        value: "Yearly",
        label: t("entSubscriptions.yearly"),
        show: !edition || edition.allowYearly,
      },
    ];

    return all.filter((o) => o.show).map(({ value, label }) => ({ value, label }));
  }, [edition, showTrial, t]);

  return (
    <GenericSelect
      type="single"
      options={options}
      value={value}
      onValueChange={(v: string) => onValueChange(v)}
      disabled={disabled}
    />
  );
}
