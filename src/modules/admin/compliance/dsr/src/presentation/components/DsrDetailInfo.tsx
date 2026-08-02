"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { DetailRow } from "@core/ui/detail-row";
import { Info } from "lucide-react";
import { formatDateTimeUtc } from "@core/common/utils";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrDetailInfoProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the dsr detail info.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DsrDetailInfo({ dsr, t }: DsrDetailInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="h-4 w-4" aria-hidden="true" />
          {t("compliance.details")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailRow
          label={t("compliance.columns.subjectEmail")}
          value={`${dsr.subjectEmail} (${dsr.subjectType})`}
        />
        <DetailRow label={t("compliance.submittedAt")} value={formatDateTimeUtc(dsr.submittedAt)} />
        {dsr.completedAt && (
          <DetailRow
            label={t("compliance.completedAt")}
            value={formatDateTimeUtc(dsr.completedAt)}
          />
        )}
        {dsr.requesterNotes && (
          <DetailRow
            layout="stacked"
            wrap
            label={t("compliance.requesterNotes")}
            value={dsr.requesterNotes}
            valueClassName="rounded-nx-sm bg-nx-raised p-2 font-normal text-nx-ink-2"
          />
        )}
        {dsr.resolution && (
          <DetailRow
            layout="stacked"
            wrap
            label={t("compliance.resolution")}
            value={dsr.resolution}
            valueClassName="rounded-nx-sm bg-nx-raised p-2 font-normal text-nx-ink-2"
          />
        )}
      </CardContent>
    </Card>
  );
}
