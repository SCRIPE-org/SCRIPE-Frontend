"use client";

import * as React from "react";
import { CheckCircle2, Layers } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";

export interface OptionSetBindingCurrentStatusProps {
  boundSet: OptionSet | null;
}

/**
 * Displays the current option set binding status for a select/multiselect field,
 * highlighting whether an active option set is currently linked.
 */
export function OptionSetBindingCurrentStatus({
  boundSet,
}: OptionSetBindingCurrentStatusProps): React.ReactElement {
  const { t, language } = useI18n();

  return (
    <div
      className="rounded-lg border border-nx-line bg-nx-raised p-4 space-y-2.5"
      data-testid="option-set-binding-current-state"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
          {t("customField.optionSetBinding.currentStatusLabel")}
        </span>
        {boundSet ? (
          <Badge variant="success" className="gap-1.5 py-0.5">
            <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
            {t("customField.optionSetBinding.boundBadge")}
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1.5 py-0.5">
            <Layers className="h-3 w-3 shrink-0" aria-hidden="true" />
            {t("customField.optionSetBinding.unboundBadge")}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm font-medium">
        {boundSet ? (
          <>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <span className="text-nx-ink font-semibold">
              {t("customField.optionSetBinding.currentlyBound", {
                set: boundSet.displayLabel(language),
              })}
            </span>
            {boundSet.isPlatformOwned && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                {t("customField.optionSetBinding.platformOwned")}
              </Badge>
            )}
          </>
        ) : (
          <>
            <Layers className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
            <span className="text-nx-ink-2">
              {t("customField.optionSetBinding.currentlyUnbound")}
            </span>
          </>
        )}
      </div>

      <p className="text-xs text-nx-ink-3">
        {boundSet
          ? t("customField.optionSetBinding.boundExplanation")
          : t("customField.optionSetBinding.unboundExplanation")}
      </p>
    </div>
  );
}
