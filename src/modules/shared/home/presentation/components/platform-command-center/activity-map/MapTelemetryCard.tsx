"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { fmt } from "./types";
import type {
  DashboardSummary,
  RecentChange,
} from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

interface MapTelemetryCardProps {
  summary?: DashboardSummary;
  recentActivity?: RecentChange[];
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
}

export function MapTelemetryCard({
  summary,
  recentActivity = [],
  healthVm,
}: MapTelemetryCardProps) {
  const { t } = useI18n();

  return (
    <div className="absolute right-3 top-12 z-10 hidden w-[170px] overflow-hidden rounded-lg border border-nx-line bg-nx-surface/95 backdrop-blur-md sm:grid">
      <div className="flex min-h-[44px] items-center justify-between border-b border-nx-line p-2">
        <div>
          <b className="font-mono text-xs font-bold text-nx-ink">
            {fmt(summary?.loginsToday ?? 0)}
          </b>
          <span className="block text-[9.5px] text-nx-ink-3">
            {t("platformCommandCenter.activity.loginsToday") || "Logins today"}
          </span>
        </div>
        <span className="rounded bg-nx-raised px-1.5 py-0.5 font-mono text-[9px] font-medium text-nx-ink-3">
          {t("platformCommandCenter.activity.last24h") || "today"}
        </span>
      </div>
      <div className="flex min-h-[44px] items-center justify-between border-b border-nx-line p-2">
        <div>
          <b
            className={`font-mono text-xs font-bold ${(summary?.failedLogins24h ?? 0) > 0 ? "text-destructive" : "text-nx-ink"}`}
          >
            {fmt(summary?.failedLogins24h ?? 0)}
          </b>
          <span className="block text-[9.5px] text-nx-ink-3">
            {t("platformCommandCenter.activity.failedLogins") || "Failed logins (24h)"}
          </span>
        </div>
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
            (summary?.failedLogins24h ?? 0) > 0
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-success"
          }`}
        >
          {(summary?.failedLogins24h ?? 0) > 0
            ? t("platformCommandCenter.activity.alert") || "Alert"
            : t("platformCommandCenter.activity.normal") || "Normal"}
        </span>
      </div>
      <div className="flex min-h-[44px] items-center justify-between border-b border-nx-line p-2">
        <div>
          <b className="font-mono text-xs font-bold text-nx-ink">
            {fmt(recentActivity.length)}
          </b>
          <span className="block text-[9.5px] text-nx-ink-3">
            {t("platformCommandCenter.activity.systemEvents") || "Audit events"}
          </span>
        </div>
        <span className="rounded bg-nx-raised px-1.5 py-0.5 font-mono text-[9px] font-medium text-nx-ink-3">
          live
        </span>
      </div>
      <div className="flex min-h-[44px] items-center justify-between p-2">
        <div>
          <b className="block max-w-[90px] truncate font-mono text-xs font-bold text-nx-ink">
            {healthVm?.health?.status ??
              (t("platformCommandCenter.kpis.operational") || "Operational")}
          </b>
          <span className="block text-[9.5px] text-nx-ink-3">
            {t("platformCommandCenter.activity.hostStatus") || "Host status"}
          </span>
        </div>
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
            healthVm?.health?.status === "Degraded"
              ? "bg-warning/10 text-warning"
              : healthVm?.health?.status === "Outage"
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
          }`}
        >
          {healthVm?.health?.status === "Degraded" ? "Degraded" : "Nominal"}
        </span>
      </div>
    </div>
  );
}
