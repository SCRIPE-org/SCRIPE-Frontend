"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { CheckCircle2, Clock, AlertCircle, type LucideIcon } from "lucide-react";
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

  const getModuleStatusMeta = (
    mod: DsrModuleExecution
  ): { label: string; icon: LucideIcon; variant: BadgeProps["variant"] } => {
    if (mod.isCompleted) {
      return {
        label: t("compliance.statusLabels.completed"),
        icon: CheckCircle2,
        variant: "success",
      };
    }
    if (mod.errorMessage) {
      return {
        label: t("compliance.statusLabels.failed"),
        icon: AlertCircle,
        variant: "error",
      };
    }
    return {
      label: t("compliance.statusLabels.pending"),
      icon: Clock,
      variant: "secondary",
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
              <div key={idx} className="flex flex-col rounded-nx-sm border border-nx-line p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-nx-ink">{mod.moduleName}</span>
                  <Badge variant={meta.variant} className="w-fit gap-1 px-2 text-xs">
                    <meta.icon className="h-3 w-3" aria-hidden="true" />
                    {meta.label}
                  </Badge>
                </div>
                <div className="text-xs text-nx-ink-3">
                  <p>
                    {t("compliance.recordsAffected")}:{" "}
                    <span className="font-medium text-nx-ink">{mod.processedCount}</span>
                  </p>
                  {mod.errorMessage && (
                    <p className="mt-1 rounded-nx-sm bg-destructive/10 p-1.5 text-destructive">
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
