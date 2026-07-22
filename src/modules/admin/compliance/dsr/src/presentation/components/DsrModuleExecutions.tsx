"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type {
  DataSubjectRequest,
  DsrModuleExecution,
} from "../../domain/entities/DataSubjectRequest";

interface DsrModuleExecutionsProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the dsr module executions.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DsrModuleExecutions({ dsr, t }: DsrModuleExecutionsProps) {
  if (dsr.moduleExecutions.length === 0) return null;

  const getModuleStatusMeta = (mod: DsrModuleExecution) => {
    if (mod.isCompleted) {
      return {
        label: t("compliance.statusLabels.completed"),
        icon: <CheckCircle2 className="h-3 w-3" />,
        cls: "bg-success/10 text-success",
      };
    }
    if (mod.errorMessage) {
      return {
        label: t("compliance.statusLabels.failed"),
        icon: <AlertCircle className="h-3 w-3" />,
        cls: "bg-destructive/10 text-destructive",
      };
    }
    return {
      label: t("compliance.statusLabels.pending"),
      icon: <Clock className="h-3 w-3" />,
      cls: "bg-muted text-muted-foreground",
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("compliance.moduleExecutions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {dsr.moduleExecutions.map((mod, idx) => {
            const meta = getModuleStatusMeta(mod);
            return (
              <div key={idx} className="flex flex-col rounded-md border border-border/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{mod.moduleName}</span>
                  <Badge
                    variant="outline"
                    className={`w-fit gap-1 ${meta.cls} border-0 px-2 text-xs`}
                  >
                    {meta.icon}
                    {meta.label}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>
                    {t("compliance.recordsAffected")}:{" "}
                    <span className="font-medium text-foreground">{mod.processedCount}</span>
                  </p>
                  {mod.errorMessage && (
                    <p className="mt-1 rounded bg-destructive/10 p-1.5 text-destructive">
                      {mod.errorMessage}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
