"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { CheckCircle2, Clock, PlayCircle, AlertCircle } from "lucide-react";
import type { DataSubjectRequest, DsrModuleExecution } from "../../domain/entities/DataSubjectRequest";

interface DsrModuleExecutionsProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
}

export function DsrModuleExecutions({ dsr, t }: DsrModuleExecutionsProps) {
  if (dsr.moduleExecutions.length === 0) return null;

  const getModuleStatusMeta = (mod: DsrModuleExecution) => {
    if (mod.isCompleted) {
        return { label: t("compliance.statusLabels.completed"), icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    }
    if (mod.errorMessage) {
        return { label: t("compliance.statusLabels.failed"), icon: <AlertCircle className="w-3 h-3" />, cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    }
    return { label: t("compliance.statusLabels.pending"), icon: <Clock className="w-3 h-3" />, cls: "bg-muted text-muted-foreground" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("compliance.moduleExecutions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dsr.moduleExecutions.map((mod, idx) => {
            const meta = getModuleStatusMeta(mod);
            return (
              <div key={idx} className="flex flex-col border border-border/50 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{mod.moduleName}</span>
                  <Badge variant="outline" className={`w-fit gap-1 ${meta.cls} border-0 px-2 text-xs`}>
                    {meta.icon}
                    {meta.label}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>{t("compliance.recordsAffected")}: <span className="font-medium text-foreground">{mod.processedCount}</span></p>
                  {mod.errorMessage && (
                    <p className="text-destructive mt-1 bg-destructive/10 p-1.5 rounded">{mod.errorMessage}</p>
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
