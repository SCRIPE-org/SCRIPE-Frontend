"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangeSchemaWarning } from "../../../domain/types";

export interface SchemaWarningsBannerProps {
  warnings?: DataExchangeSchemaWarning[] | null;
  className?: string;
}

/**
 * Shared studio banner rendering structured, localized schema drift and preset warnings
 * with LTR monospace chips for technical field tokens and headers.
 */
export function SchemaWarningsBanner({
  warnings,
  className,
}: SchemaWarningsBannerProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";

  if (!warnings || warnings.length === 0) return null;

  return (
    <Alert
      variant="warning"
      className={cn("border-warning-strong/40 bg-warning/15 text-nx-ink", className)}
      data-testid="schema-warnings-banner"
    >
      <AlertTriangle className="h-4 w-4 text-nx-warning-strong shrink-0" />
      <AlertDescription className="space-y-2 text-xs text-nx-ink">
        <div>
          <div className="font-semibold text-nx-warning-strong">
            {t("dataExchange.schemaWarnings.title")}
          </div>
          <div className="mt-0.5 text-nx-ink-2">
            {t("dataExchange.upload.schemaWarningsDesc")}
          </div>
        </div>
        <ul className="list-inside list-disc space-y-1.5 text-nx-ink">
          {warnings.map((w, idx) => {
            const entity =
              isAr && w.entityDisplayNameAr
                ? w.entityDisplayNameAr
                : w.entityDisplayNameEn || w.entityKey || "";
            const i18nKey = `dataExchange.schemaWarnings.${w.code}`;
            const message = t(i18nKey, {
              entity,
              preset: w.presetName ?? "",
              sheet: w.sheetName ?? "",
            });
            const displayMsg =
              message !== i18nKey
                ? message
                : t("dataExchange.schemaWarnings.UNKNOWN", { entity });

            return (
              <li key={`${w.code}-${idx}`} className="space-y-1">
                <span>{displayMsg}</span>
                {w.items && w.items.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {w.items.map((item, itemIdx) => (
                      <bdi
                        key={itemIdx}
                        dir="ltr"
                        className="inline-flex items-center rounded border border-warning-strong/40 bg-warning/15 px-1.5 py-0.5 font-mono text-[11px] text-nx-ink font-medium"
                      >
                        {item}
                      </bdi>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
