"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Calendar, CheckCircle2 } from "lucide-react";
import { ComplianceReport } from "../../domain/entities/ComplianceReport";
import { formatUtc } from "@core/common/utils";

interface ReportMetadataGridProps {
  report: ComplianceReport;
}

/**
 * ReportMetadataGrid Component
 *
 * Renders the grid display showing metadata fields for the compliance report,
 * specifically the period start, period end, and generation timestamp.
 */
export function ReportMetadataGrid({ report }: ReportMetadataGridProps) {
  const { t } = useI18n();

  const items = [
    {
      label: t("compliance.periodStart"),
      value: formatUtc(report.periodStart, "MMM d, yyyy") || "—",
      icon: <Calendar className="h-3.5 w-3.5" />,
    },
    {
      label: t("compliance.periodEnd"),
      value: formatUtc(report.periodEnd, "MMM d, yyyy") || "—",
      icon: <Calendar className="h-3.5 w-3.5" />,
    },
    {
      label: t("compliance.period"),
      value: formatUtc(report.generatedAt, "MMM d, yyyy") || "—",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {item.icon}
              {item.label}
            </div>
            <p className="mt-1 font-semibold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
