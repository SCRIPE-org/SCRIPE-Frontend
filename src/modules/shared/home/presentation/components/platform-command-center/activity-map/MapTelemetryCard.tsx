"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { fmt } from "./types";
import type { DashboardSummary, RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

interface MapTelemetryCardProps {
  summary?: DashboardSummary;
  recentActivity?: RecentChange[];
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
}

export function MapTelemetryCard({ summary, recentActivity = [], healthVm }: MapTelemetryCardProps) {
  const { t } = useI18n();

  return (
    <div className="absolute right-3 top-12 z-10 w-[170px] rounded-lg border border-border bg-card/90 backdrop-blur-md shadow-lg overflow-hidden hidden sm:grid">
      <div className="min-h-[44px] p-2 border-b border-border/60 flex items-center justify-between">
        <div>
          <b className="text-xs font-bold text-foreground font-mono">{fmt(summary?.loginsToday ?? 0)}</b>
          <span className="block text-[9.5px] text-muted-foreground">
            {t("platformCommandCenter.activity.loginsToday") || "Logins today"}
          </span>
        </div>
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
          {t("platformCommandCenter.activity.last24h") || "today"}
        </span>
      </div>
      <div className="min-h-[44px] p-2 border-b border-border/60 flex items-center justify-between">
        <div>
          <b className={`text-xs font-bold font-mono ${(summary?.failedLogins24h ?? 0) > 0 ? "text-destructive" : "text-foreground"}`}>
            {fmt(summary?.failedLogins24h ?? 0)}
          </b>
          <span className="block text-[9.5px] text-muted-foreground">
            {t("platformCommandCenter.activity.failedLogins") || "Failed logins (24h)"}
          </span>
        </div>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
          (summary?.failedLogins24h ?? 0) > 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"
        }`}>
          {(summary?.failedLogins24h ?? 0) > 0 ? (t("platformCommandCenter.activity.alert") || "Alert") : (t("platformCommandCenter.activity.normal") || "Normal")}
        </span>
      </div>
      <div className="min-h-[44px] p-2 border-b border-border/60 flex items-center justify-between">
        <div>
          <b className="text-xs font-bold text-foreground font-mono">{fmt(recentActivity.length)}</b>
          <span className="block text-[9.5px] text-muted-foreground">
            {t("platformCommandCenter.activity.systemEvents") || "Audit events"}
          </span>
        </div>
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
          live
        </span>
      </div>
      <div className="min-h-[44px] p-2 flex items-center justify-between">
        <div>
          <b className="text-xs font-bold text-foreground font-mono truncate max-w-[90px] block">
            {healthVm?.health?.status ?? (t("platformCommandCenter.kpis.operational") || "Operational")}
          </b>
          <span className="block text-[9.5px] text-muted-foreground">
            {t("platformCommandCenter.activity.hostStatus") || "Host status"}
          </span>
        </div>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
          healthVm?.health?.status === "Degraded"
            ? "bg-amber-500/10 text-amber-500"
            : healthVm?.health?.status === "Outage"
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        }`}>
          {healthVm?.health?.status === "Degraded" ? "Degraded" : "Nominal"}
        </span>
      </div>
    </div>
  );
}
