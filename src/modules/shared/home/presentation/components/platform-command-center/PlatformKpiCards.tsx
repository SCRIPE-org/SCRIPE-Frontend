/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import { Building2, Users, ShieldAlert, Activity } from "lucide-react";
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
      <div className="relative flex h-[92px] items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-sm before:absolute before:left-0 before:right-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-sky-500/20 before:to-transparent">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11.5px] text-muted-foreground">
              {t("platformCommandCenter.kpis.tenants") || "Total Tenants"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "..." : totalTenants.toLocaleString()}
              </span>
              <span className="truncate text-[10.5px] font-bold text-emerald-500">
                {t("platformCommandCenter.kpis.activeTenantsRatio", {
                  active: activeTenants,
                  total: totalTenants,
                }) || `${activeTenants} active · ${totalTenants} total`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-[32px] w-[84px] shrink-0 text-emerald-500">
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
              className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]"
            />
          </svg>
        </div>
      </div>

      {/* 2. Platform Health */}
      <div className="relative flex h-[92px] items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-sm before:absolute before:left-0 before:right-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border ${
              degradedCount === 0
                ? "border-[#84cc16]/20 bg-[#84cc16]/10 text-[#84cc16]"
                : "border-amber-500/20 bg-amber-500/10 text-amber-500"
            }`}
          >
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11.5px] text-muted-foreground">
              {t("platformCommandCenter.kpis.serviceHealth") || "Platform Health"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "..." : overallHealth}
              </span>
              <span
                className={`truncate text-[10.5px] font-bold ${
                  degradedCount === 0 ? "text-emerald-500" : "text-amber-500"
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
            degradedCount === 0 ? "text-emerald-500" : "text-amber-500"
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
      </div>

      {/* 3. Active Admins */}
      <div className="relative flex h-[92px] items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-sm before:absolute before:left-0 before:right-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11.5px] text-muted-foreground">
              {t("platformCommandCenter.kpis.platformAdmins") || "Active Admins"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {isLoading
                  ? "..."
                  : activeAdmins > 0
                    ? activeAdmins.toLocaleString()
                    : totalAdmins.toLocaleString()}
              </span>
              <span className="truncate text-[10.5px] font-bold text-emerald-500">
                {t("platformCommandCenter.kpis.activeAdminsRatio", {
                  active: activeAdmins,
                  total: totalAdmins,
                }) || `${activeAdmins} active · ${totalAdmins} total`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-[32px] w-[84px] shrink-0 text-emerald-500">
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
              className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]"
            />
          </svg>
        </div>
      </div>

      {/* 4. Live Incidents */}
      <div className="relative flex h-[92px] items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-sm before:absolute before:left-0 before:right-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-rose-500/20 before:to-transparent">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border ${
              securityIncidents > 0 || degradedCount > 0
                ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11.5px] text-muted-foreground">
              {t("platformCommandCenter.kpis.liveIncidents") || "Live Incidents"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "..." : securityIncidents > 0 ? securityIncidents : degradedCount}
              </span>
              <span
                className={`truncate text-[10.5px] font-bold ${
                  securityIncidents > 0 || degradedCount > 0 ? "text-rose-500" : "text-emerald-500"
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
        <div className="h-[32px] w-[84px] shrink-0 text-rose-500">
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
      </div>
    </div>
  );
}
