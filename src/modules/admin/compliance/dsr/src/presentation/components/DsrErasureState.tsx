"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ShieldAlert, CheckCircle } from "lucide-react";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrErasureStateProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the dsr erasure state.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DsrErasureState({ dsr, t }: DsrErasureStateProps) {
  if (dsr.requestType !== "Erasure" || dsr.status !== "Completed") return null;

  return (
    <Card className="border-success/50 bg-success/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-success">
          <ShieldAlert className="h-4 w-4" />
          {t("compliance.erasureCompleted")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{t("compliance.erasureDescription")}</p>
        <div className="flex items-center gap-2 rounded-md bg-success/10 p-3 text-sm font-medium text-success">
          <CheckCircle className="h-4 w-4" />
          {t("compliance.dataAnonymized")}
        </div>
      </CardContent>
    </Card>
  );
}
