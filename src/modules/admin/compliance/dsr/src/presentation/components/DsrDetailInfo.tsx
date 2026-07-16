"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
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
          <Info className="h-4 w-4" />
          {t("compliance.details")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">{t("compliance.columns.subjectEmail")}</p>
          <p className="text-sm text-muted-foreground">
            {dsr.subjectEmail} ({dsr.subjectType})
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">{t("compliance.submittedAt")}</p>
          <p className="text-sm text-muted-foreground">
            {formatDateTimeUtc(dsr.submittedAt)}
          </p>
        </div>
        {dsr.completedAt && (
          <div>
            <p className="text-sm font-medium">{t("compliance.completedAt")}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateTimeUtc(dsr.completedAt)}
            </p>
          </div>
        )}
        {dsr.requesterNotes && (
          <div>
            <p className="text-sm font-medium">{t("compliance.requesterNotes")}</p>
            <p className="mt-1 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
              {dsr.requesterNotes}
            </p>
          </div>
        )}
        {dsr.resolution && (
          <div>
            <p className="text-sm font-medium">{t("compliance.resolution")}</p>
            <p className="mt-1 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
              {dsr.resolution}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
