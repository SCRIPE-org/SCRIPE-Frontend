"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { History, ArrowRight } from "lucide-react";
import { formatDateTimeUtc } from "@core/common/utils";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrDetailTimelineProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
  statusMetaMap: Record<string, { labelKey: string }>;
}

/**
 * Presentation UI component rendering the dsr detail timeline.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DsrDetailTimeline({ dsr, t, statusMetaMap }: DsrDetailTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" aria-hidden="true" />
          {t("compliance.statusHistory")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dsr.statusHistory?.map((history, idx) => {
            const isLast = idx === dsr.statusHistory.length - 1;
            const fromMeta = statusMetaMap[history.fromStatus] ?? {
              labelKey: "compliance.statusLabels.pending",
            };
            const toMeta = statusMetaMap[history.toStatus] ?? {
              labelKey: "compliance.statusLabels.pending",
            };
            return (
              <div key={idx} className="relative ps-6">
                {!isLast && (
                  <div className="absolute top-6 h-full w-[2px] start-[11px] bg-nx-line" aria-hidden="true" />
                )}
                <div
                  className="absolute top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-nx-line bg-nx-surface start-0"
                  aria-hidden="true"
                >
                  <div className="h-2 w-2 rounded-full bg-nx-accent-fill" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-nx-ink">
                    {t(fromMeta.labelKey)}{" "}
                    <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />{" "}
                    {t(toMeta.labelKey)}
                  </p>
                  <p className="text-xs text-nx-ink-3">{formatDateTimeUtc(history.occurredAt)}</p>
                  {history.notes && <p className="mt-1 text-sm text-nx-ink-2">{history.notes}</p>}
                </div>
              </div>
            );
          })}
          {(!dsr.statusHistory || dsr.statusHistory.length === 0) && (
            <p className="text-sm text-nx-ink-2">{t("compliance.noHistory")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
