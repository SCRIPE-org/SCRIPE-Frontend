"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ShieldAlert, CheckCircle } from "lucide-react";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrErasureStateProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
}

/**
 * React presentation component representing the dsr erasure state UI element.
 */
export function DsrErasureState({ dsr, t }: DsrErasureStateProps) {
  if (dsr.requestType !== "Erasure" || dsr.status !== "Completed") return null;

  return (
    <Card className="border-green-500/50 bg-green-500/5 dark:bg-green-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-400">
          <ShieldAlert className="h-4 w-4" />
          {t("compliance.erasureCompleted")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{t("compliance.erasureDescription")}</p>
        <div className="flex items-center gap-2 rounded-md bg-green-100 p-3 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          {t("compliance.dataAnonymized")}
        </div>
      </CardContent>
    </Card>
  );
}
