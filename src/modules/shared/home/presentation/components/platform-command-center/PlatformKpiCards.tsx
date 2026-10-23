/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import { Building2, Users, ShieldAlert, Activity } from "lucide-react";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { DashboardSummary } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

interface PlatformKpiCardsProps {
  summary?: DashboardSummary;
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
  isLoading?: boolean;
  kpis?: {
    totalTenants: number;
    activeTenants: number;
    totalAdmins: number;
    activeAdmins: number;
    failedLogins24h: number;
    degradedCount: number;
    overallHealthScore: string;
    overallHealthStatus: string;
  };
}

export function PlatformKpiCards({
  summary,
  healthVm,
  isLoading = false,
  kpis: propKpis,
}: PlatformKpiCardsProps) {
  const { t } = useI18n();

  const totalTenants = propKpis?.totalTenants ?? summary?.totalTenants ?? 0;
  const activeTenants = propKpis?.activeTenants ?? summary?.activeTenants ?? 0;
  const totalAdmins = propKpis?.totalAdmins ?? summary?.totalAdmins ?? 0;
  const activeAdmins = propKpis?.activeAdmins ?? summary?.activeAdmins ?? 0;
  const securityIncidents = propKpis?.failedLogins24h ?? summary?.failedLogins24h ?? 0;
  const degradedCount =
    propKpis?.degradedCount ??
    healthVm?.health?.modules?.filter((m) => m.status !== "Healthy" || !m.isActive).length ??
    0;

  const overallHealth =
    propKpis?.overallHealthScore ??
    (healthVm?.health?.isHealthy
      ? "100%"
      : healthVm?.health?.status
        ? `${healthVm.health.status}`
        : "100%");

  const overallStatus =
    propKpis?.overallHealthStatus ??
    (degradedCount === 0 && healthVm?.health?.isHealthy !== false
      ? t("platformCommandCenter.kpis.operational") || "Operational"
      : t("platformCommandCenter.kpis.degraded") || "Degraded");

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Tenants */}
      <Card className="relative flex h-[92px] items-center justify-between gap-3 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink transition-[border-color,background-color] duration-nx-micro hover:border-nx-line-hi">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-nx-md border border-info/30 bg-info/10 text-info">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11.5px] text-nx-ink-3">
              {t("platformCommandCenter.kpis.tenants") || "Total Tenants"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-nx-ink">
                {isLoading ? "..." : totalTenants.toLocaleString()}
              </span>
              <span className="truncate text-[10.5px] font-bold text-success">
                {t("platformCommandCenter.kpis.activeTenantsRatio", {
                  active: activeTenants,
                  total: totalTenants,
                }) || `${activeTenants} active · ${totalTenants} total`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-[32px] w-[84px] shrink-0 text-success">
          <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              points="2,28 22,26 42,20 62,18 82,12 96,8"
            />
            <circle
              cx="96"
              cy="8"
              r="3"
              fill="currentColor"
              className="drop-shadow-[0_0_6px_var(--success)]"
            />
          </svg>
        </div>
      </Card>

      {/* 2. Platform Health */}
      <Card className="relative flex h-[92px] items-center justify-between gap-3 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink transition-[border-color,background-color] duration-nx-micro hover:border-nx-line-hi">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-nx-md border ${
              degradedCount === 0
                ? "border-success/30 bg-success/10 text-success"
                : "border-warning/30 bg-warning/10 text-warning"
            }`}
          >
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11.5px] text-nx-ink-3">
              {t("platformCommandCenter.kpis.serviceHealth") || "Platform Health"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-nx-ink">
                {isLoading ? "..." : overallHealth}
              </span>
              <span
                className={`truncate text-[10.5px] font-bold ${
                  degradedCount === 0 ? "text-success" : "text-warning"
                }`}
              >
                {degradedCount === 0 ? "" : `${degradedCount} degraded`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline Area */}
        <div
          className={`h-[32px] w-[84px] shrink-0 ${
            degradedCount === 0 ? "text-success" : "text-warning"
          }`}
        >
          <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id="kpiHealthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity=".25" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#kpiHealthGrad)"
              points="0,35 25,28 50,22 75,16 100,10 100,40 0,40"
            />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              points="0,35 25,28 50,22 75,16 100,10"
            />
          </svg>
        </div>
      </Card>

      {/* 3. Active Admins */}
      <Card className="relative flex h-[92px] items-center justify-between gap-3 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink transition-[border-color,background-color] duration-nx-micro hover:border-nx-line-hi">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-nx-md border border-primary/20 bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11.5px] text-nx-ink-3">
              {t("platformCommandCenter.kpis.platformAdmins") || "Active Admins"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-nx-ink">
                {isLoading
                  ? "..."
                  : activeAdmins > 0
                    ? activeAdmins.toLocaleString()
                    : totalAdmins.toLocaleString()}
              </span>
              <span className="truncate text-[10.5px] font-bold text-success">
                {t("platformCommandCenter.kpis.activeAdminsRatio", {
                  active: activeAdmins,
                  total: totalAdmins,
                }) || `${activeAdmins} active · ${totalAdmins} total`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-[32px] w-[84px] shrink-0 text-success">
          <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              points="2,30 32,24 62,16 96,10"
            />
            <circle
              cx="96"
              cy="10"
              r="3"
              fill="currentColor"
              className="drop-shadow-[0_0_6px_var(--success)]"
            />
          </svg>
        </div>
      </Card>

      {/* 4. Live Incidents */}
      <Card className="relative flex h-[92px] items-center justify-between gap-3 overflow-hidden border-nx-line bg-nx-surface p-3.5 text-nx-ink transition-[border-color,background-color] duration-nx-micro hover:border-nx-line-hi">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-nx-md border ${
              securityIncidents > 0 || degradedCount > 0
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-success/30 bg-success/10 text-success"
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11.5px] text-nx-ink-3">
              {t("platformCommandCenter.kpis.liveIncidents") || "Live Incidents"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-nx-ink">
                {isLoading ? "..." : securityIncidents > 0 ? securityIncidents : degradedCount}
              </span>
              <span
                className={`truncate text-[10.5px] font-bold ${
                  securityIncidents > 0 || degradedCount > 0 ? "text-destructive" : "text-success"
                }`}
              >
                {securityIncidents > 0
                  ? t("platformCommandCenter.kpis.securityWarning", { count: securityIncidents }) ||
                    `${securityIncidents} failed login attempts`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-[32px] w-[84px] shrink-0 text-destructive">
          <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              points="2,28 32,14 62,22 96,8"
            />
            <circle cx="96" cy="8" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </Card>
    </div>
  );
}
