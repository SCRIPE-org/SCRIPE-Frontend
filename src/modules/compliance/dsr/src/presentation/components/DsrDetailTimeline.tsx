"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { History, ArrowRight } from "lucide-react";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrDetailTimelineProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
  statusMetaMap: Record<string, { labelKey: string }>;
}

/**
 * React presentation component representing the dsr detail timeline UI element.
 */
export function DsrDetailTimeline({ dsr, t, statusMetaMap }: DsrDetailTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
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
              <div key={idx} className="relative pl-6">
                {!isLast && <div className="absolute left-[11px] top-6 h-full w-[2px] bg-border" />}
                <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {t(fromMeta.labelKey)} <ArrowRight className="h-3 w-3" /> {t(toMeta.labelKey)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(history.occurredAt).toLocaleString()}
                  </p>
                  {history.notes && (
                    <p className="mt-1 text-sm text-muted-foreground">{history.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
          {(!dsr.statusHistory || dsr.statusHistory.length === 0) && (
            <p className="text-sm text-muted-foreground">{t("compliance.noHistory")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
