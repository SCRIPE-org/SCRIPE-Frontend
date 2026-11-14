"use client";

import React from "react";
import { Activity, AlertTriangle, CheckCircle2, Layers } from "lucide-react";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Props for JobsKpiHeader component.
 */
export interface JobsKpiHeaderProps {
  kpis: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
  };
}

/**
 * Renders the 4-metric KPI summary strip for data transfer execution jobs.
 */
export function JobsKpiHeader({ kpis }: JobsKpiHeaderProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <Card className="p-3.5">
        <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
          <Layers className="h-3.5 w-3.5 text-nx-accent" />
          <span>{t("adminDataTransferJobs.kpis.totalJobs")}</span>
        </div>
        <span className="text-xl font-bold text-nx-ink font-mono">{kpis.totalJobs}</span>
      </Card>
      <Card className="p-3.5">
        <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
          <Activity className="h-3.5 w-3.5 text-nx-info" />
          <span>{t("adminDataTransferJobs.kpis.activeJobs")}</span>
        </div>
        <span className="text-xl font-bold text-nx-ink font-mono">{kpis.activeJobs}</span>
      </Card>
      <Card className="p-3.5">
        <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-nx-success" />
          <span>{t("adminDataTransferJobs.kpis.completedJobs")}</span>
        </div>
        <span className="text-xl font-bold text-nx-ink font-mono">{kpis.completedJobs}</span>
      </Card>
      <Card className="p-3.5">
        <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
          <AlertTriangle className="h-3.5 w-3.5 text-nx-destructive" />
          <span>{t("adminDataTransferJobs.kpis.failedJobs")}</span>
        </div>
        <span className="text-xl font-bold text-nx-ink font-mono">{kpis.failedJobs}</span>
      </Card>
    </div>
  );
}
