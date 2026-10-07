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
    (healthVm?.health?.modules?.filter((m) => m.status !== "Healthy" || !m.isActive).length ?? 0);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Tenants */}
      <div className="relative rounded-xl border border-border bg-card p-3.5 h-[92px] flex items-center justify-between gap-3 shadow-sm overflow-hidden before:absolute before:left-0 before:top-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-sky-500/20 before:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[42px] h-[42px] rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] text-muted-foreground block truncate">
              {t("platformCommandCenter.kpis.tenants") || "Total Tenants"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isLoading ? "..." : totalTenants.toLocaleString()}
              </span>
              <span className="text-[10.5px] font-bold truncate text-emerald-500">
                {t("platformCommandCenter.kpis.activeTenantsRatio", {
                  active: activeTenants,
                  total: totalTenants,
                }) || `${activeTenants} active · ${totalTenants} total`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="w-[84px] h-[32px] shrink-0 text-emerald-500">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              points="2,28 22,26 42,20 62,18 82,12 96,8"
            />
            <circle cx="96" cy="8" r="3" fill="currentColor" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
          </svg>
        </div>
      </div>

      {/* 2. Platform Health */}
      <div className="relative rounded-xl border border-border bg-card p-3.5 h-[92px] flex items-center justify-between gap-3 shadow-sm overflow-hidden before:absolute before:left-0 before:top-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-[42px] h-[42px] rounded-lg border flex items-center justify-center shrink-0 ${
              degradedCount === 0
                ? "bg-[#84cc16]/10 border-[#84cc16]/20 text-[#84cc16]"
                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
            }`}
          >
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] text-muted-foreground block truncate">
              {t("platformCommandCenter.kpis.serviceHealth") || "Platform Health"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isLoading ? "..." : overallHealth}
              </span>
              <span
                className={`text-[10.5px] font-bold truncate ${
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
          className={`w-[84px] h-[32px] shrink-0 ${
            degradedCount === 0 ? "text-emerald-500" : "text-amber-500"
          }`}
        >
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="kpiHealthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity=".25" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon fill="url(#kpiHealthGrad)" points="0,35 25,28 50,22 75,16 100,10 100,40 0,40" />
            <polyline fill="none" stroke="currentColor" strokeWidth="1.4" points="0,35 25,28 50,22 75,16 100,10" />
          </svg>
        </div>
      </div>

      {/* 3. Active Admins */}
      <div className="relative rounded-xl border border-border bg-card p-3.5 h-[92px] flex items-center justify-between gap-3 shadow-sm overflow-hidden before:absolute before:left-0 before:top-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[42px] h-[42px] rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] text-muted-foreground block truncate">
              {t("platformCommandCenter.kpis.platformAdmins") || "Active Admins"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isLoading ? "..." : (activeAdmins > 0 ? activeAdmins.toLocaleString() : totalAdmins.toLocaleString())}
              </span>
              <span className="text-[10.5px] font-bold truncate text-emerald-500">
                {t("platformCommandCenter.kpis.activeAdminsRatio", {
                  active: activeAdmins,
                  total: totalAdmins,
                }) || `${activeAdmins} active · ${totalAdmins} total`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="w-[84px] h-[32px] shrink-0 text-emerald-500">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              points="2,30 32,24 62,16 96,10"
            />
            <circle cx="96" cy="10" r="3" fill="currentColor" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
          </svg>
        </div>
      </div>

      {/* 4. Live Incidents */}
      <div className="relative rounded-xl border border-border bg-card p-3.5 h-[92px] flex items-center justify-between gap-3 shadow-sm overflow-hidden before:absolute before:left-0 before:top-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-rose-500/20 before:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-[42px] h-[42px] rounded-lg border flex items-center justify-center shrink-0 ${
              securityIncidents > 0 || degradedCount > 0
                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] text-muted-foreground block truncate">
              {t("platformCommandCenter.kpis.liveIncidents") || "Live Incidents"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isLoading ? "..." : (securityIncidents > 0 ? securityIncidents : degradedCount)}
              </span>
              <span
                className={`text-[10.5px] font-bold truncate ${
                  securityIncidents > 0 || degradedCount > 0 ? "text-rose-500" : "text-emerald-500"
                }`}
              >
                {securityIncidents > 0
                  ? t("platformCommandCenter.kpis.securityWarning", { count: securityIncidents }) || `${securityIncidents} failed login attempts`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="w-[84px] h-[32px] shrink-0 text-rose-500">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
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
