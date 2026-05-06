"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ShieldAlert, CheckCircle } from "lucide-react";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrErasureStateProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
}

export function DsrErasureState({ dsr, t }: DsrErasureStateProps) {
  if (dsr.requestType !== "Erasure" || dsr.status !== "Completed") return null;

  return (
    <Card className="border-green-500/50 bg-green-500/5 dark:bg-green-500/10">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
          <ShieldAlert className="h-4 w-4" />
          {t("compliance.erasureCompleted")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t("compliance.erasureDescription")}
        </p>
        <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-md">
          <CheckCircle className="h-4 w-4" />
          {t("compliance.dataAnonymized")}
        </div>
      </CardContent>
    </Card>
  );
}
