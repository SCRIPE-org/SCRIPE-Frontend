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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Tenants */}
      <div className="relative rounded-xl border border-border bg-card p-3.5 h-[92px] flex items-center justify-between gap-3 shadow-sm overflow-hidden before:absolute before:left-0 before:top-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[42px] h-[42px] rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] text-muted-foreground block truncate">
              {t("platformCommandCenter.kpis.tenants") || "Total tenants"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isLoading ? "..." : totalTenants.toLocaleString()}
              </span>
              <span
                className={`text-[10.5px] font-bold truncate ${
                  totalTenants > 0 ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {totalTenants === 0
                  ? t("platformCommandCenter.kpis.noTenants") || "No tenants provisioned"
                  : t("platformCommandCenter.kpis.activeTenantsRatio", {
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
            {totalTenants > 0 ? (
              <>
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  points="2,28 22,26 42,20 62,18 82,12 96,8"
                />
                <circle cx="96" cy="8" r="3" fill="currentColor" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              </>
            ) : (
              <line x1="2" y1="20" x2="98" y2="20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" opacity=".35" />
            )}
          </svg>
        </div>
      </div>

      {/* 2. Platform Administrators */}
      <div className="relative rounded-xl border border-border bg-card p-3.5 h-[92px] flex items-center justify-between gap-3 shadow-sm overflow-hidden before:absolute before:left-0 before:top-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[42px] h-[42px] rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] text-muted-foreground block truncate">
              {t("platformCommandCenter.kpis.platformAdmins") || "Platform administrators"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isLoading ? "..." : totalAdmins.toLocaleString()}
              </span>
              <span
                className={`text-[10.5px] font-bold truncate ${
                  activeAdmins > 0 ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {totalAdmins === 0
                  ? t("platformCommandCenter.kpis.noAdmins") || "No administrators"
                  : t("platformCommandCenter.kpis.activeAdminsRatio", {
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
            {totalAdmins > 0 ? (
              <>
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  points="2,30 32,24 62,16 96,10"
                />
                <circle cx="96" cy="10" r="3" fill="currentColor" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              </>
            ) : (
              <line x1="2" y1="20" x2="98" y2="20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" opacity=".35" />
            )}
          </svg>
        </div>
      </div>

      {/* 3. Security Incidents */}
      <div className="relative rounded-xl border border-border bg-card p-3.5 h-[92px] flex items-center justify-between gap-3 shadow-sm overflow-hidden before:absolute before:left-0 before:top-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-[42px] h-[42px] rounded-lg border flex items-center justify-center shrink-0 ${
              securityIncidents > 0
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] text-muted-foreground block truncate">
              {t("platformCommandCenter.kpis.securityIncidents") || "Failed logins (24h)"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isLoading ? "..." : securityIncidents.toLocaleString()}
              </span>
              <span
                className={`text-[10.5px] font-bold truncate ${
                  securityIncidents === 0 ? "text-emerald-500" : "text-destructive"
                }`}
              >
                {securityIncidents === 0
                  ? t("platformCommandCenter.kpis.securityNormal") || "Normal · 0 failed attempts"
                  : t("platformCommandCenter.kpis.securityWarning", { count: securityIncidents }) ||
                    `${securityIncidents} failed login attempts`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div
          className={`w-[84px] h-[32px] shrink-0 ${
            securityIncidents > 0 ? "text-destructive" : "text-emerald-500"
          }`}
        >
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            {securityIncidents > 0 ? (
              <>
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  points="2,28 32,14 62,22 96,8"
                />
                <circle cx="96" cy="8" r="2.5" fill="currentColor" />
              </>
            ) : (
              <line x1="2" y1="20" x2="98" y2="20" stroke="currentColor" strokeWidth="1.2" opacity=".4" />
            )}
          </svg>
        </div>
      </div>

      {/* 4. Service Health */}
      <div className="relative rounded-xl border border-border bg-card p-3.5 h-[92px] flex items-center justify-between gap-3 shadow-sm overflow-hidden before:absolute before:left-0 before:top-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-[42px] h-[42px] rounded-lg border flex items-center justify-center shrink-0 ${
              degradedCount === 0
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
            }`}
          >
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] text-muted-foreground block truncate">
              {t("platformCommandCenter.kpis.serviceHealth") || "Platform service health"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isLoading ? "..." : overallHealth}
              </span>
              <span
                className={`text-[10.5px] font-bold truncate ${
                  degradedCount === 0 ? "text-primary" : "text-amber-500"
                }`}
              >
                {degradedCount === 0
                  ? t("platformCommandCenter.kpis.allModulesOperational") || "All modules operational"
                  : t("platformCommandCenter.kpis.modulesDegradedSubtitle", {
                      count: degradedCount,
                    }) || `${degradedCount} modules degraded`}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline Area */}
        <div
          className={`w-[84px] h-[32px] shrink-0 ${
            degradedCount === 0 ? "text-primary" : "text-amber-500"
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
            <polyline fill="none" stroke="currentColor" strokeWidth="1.2" points="0,35 25,28 50,22 75,16 100,10" />
          </svg>
        </div>
      </div>
    </div>
  );
}
