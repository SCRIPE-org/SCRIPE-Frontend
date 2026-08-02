"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { DetailRow } from "@core/ui/detail-row";
import { Calendar, CheckCircle2, Hash } from "lucide-react";
import { ComplianceReport } from "../../domain/entities/ComplianceReport";
import { formatUtc } from "@core/common/utils";

interface ReportMetadataGridProps {
  report: ComplianceReport;
}

const DATE_PATTERN = "MMM d, yyyy";

// A date the report does not carry, rather than a zero the reader would trust.
const NO_VALUE = "—";

/**
 * ReportMetadataGrid Component
 *
 * Renders the report's identity and reporting window as label/value rows: the
 * id, the period bounds and the generation timestamp. It was three separate
 * cards of unlabelled figures, which read as three unrelated statistics rather
 * than one record's metadata.
 */
export function ReportMetadataGrid({ report }: ReportMetadataGridProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("compliance.reportMetadata")}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-nx-line">
        <DetailRow
          className="pb-3"
          icon={Hash}
          label={t("compliance.reportId")}
          value={report.id}
          mono
          copyable={report.id}
        />
        <DetailRow
          className="py-3"
          icon={Calendar}
          label={t("compliance.periodStart")}
          value={formatUtc(report.periodStart, DATE_PATTERN) || NO_VALUE}
        />
        <DetailRow
          className="py-3"
          icon={Calendar}
          label={t("compliance.periodEnd")}
          value={formatUtc(report.periodEnd, DATE_PATTERN) || NO_VALUE}
        />
        <DetailRow
          className="pt-3"
          icon={CheckCircle2}
          label={t("compliance.generatedAt")}
          value={formatUtc(report.generatedAt, DATE_PATTERN) || NO_VALUE}
        />
      </CardContent>
    </Card>
  );
}
