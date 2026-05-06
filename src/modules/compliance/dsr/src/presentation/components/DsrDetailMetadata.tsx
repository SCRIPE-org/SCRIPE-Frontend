"use client";

import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrDetailMetadataProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
  statusMeta: { labelKey: string; icon: React.ReactNode; cls: string };
  typeMeta: { labelKey: string; color: string };
}

export function DsrDetailMetadata({ dsr, t, statusMeta, typeMeta }: DsrDetailMetadataProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card className="border-border/50">
        <CardContent className="p-4 flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">{t("compliance.columns.requestType")}</p>
          <div className={`font-medium ${typeMeta.color}`}>
            {t(typeMeta.labelKey)}
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-4 flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">{t("compliance.columns.status")}</p>
          <Badge variant="outline" className={`w-fit gap-1 ${statusMeta.cls} border-0 px-2`}>
            {statusMeta.icon}
            {t(statusMeta.labelKey)}
          </Badge>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-4 flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">{t("compliance.columns.deadline")}</p>
          <p className="font-medium text-sm">
            {dsr.deadline.toLocaleDateString()}
            {dsr.daysRemaining > 0 && <span className="ms-2 text-xs text-muted-foreground">({dsr.daysRemaining} {t("compliance.remaining")})</span>}
            {dsr.isOverdue && <span className="ms-2 text-xs text-destructive">({t("compliance.overdue")})</span>}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-4 flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">{t("compliance.columns.regulation")}</p>
          <p className="font-mono text-sm font-medium">{dsr.regulationCode}</p>
        </CardContent>
      </Card>
    </div>
  );
}
