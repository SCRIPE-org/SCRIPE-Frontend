"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Info } from "lucide-react";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrDetailInfoProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
}

export function DsrDetailInfo({ dsr, t }: DsrDetailInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          {t("compliance.details")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">{t("compliance.columns.subjectEmail")}</p>
          <p className="text-sm text-muted-foreground">{dsr.subjectEmail} ({dsr.subjectType})</p>
        </div>
        <div>
          <p className="text-sm font-medium">{t("compliance.submittedAt")}</p>
          <p className="text-sm text-muted-foreground">{new Date(dsr.submittedAt).toLocaleString()}</p>
        </div>
        {dsr.completedAt && (
          <div>
            <p className="text-sm font-medium">{t("compliance.completedAt")}</p>
            <p className="text-sm text-muted-foreground">{new Date(dsr.completedAt).toLocaleString()}</p>
          </div>
        )}
        {dsr.requesterNotes && (
          <div>
            <p className="text-sm font-medium">{t("compliance.requesterNotes")}</p>
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md mt-1">{dsr.requesterNotes}</p>
          </div>
        )}
        {dsr.resolution && (
          <div>
            <p className="text-sm font-medium">{t("compliance.resolution")}</p>
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md mt-1">{dsr.resolution}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
