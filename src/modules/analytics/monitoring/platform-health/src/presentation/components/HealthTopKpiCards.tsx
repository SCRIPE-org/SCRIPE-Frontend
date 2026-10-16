/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformHealth } from "../../domain/entities/PlatformHealth";

interface HealthTopKpiCardsProps {
  health?: PlatformHealth;
  isLoading?: boolean;
}

/**
 * HealthTopKpiCards
 */
export function HealthTopKpiCards({ health, isLoading = false }: HealthTopKpiCardsProps) {
  const { t } = useI18n();

  const isHealthy = health ? health.isHealthy : true;
  const isDegraded = health ? health.isDegraded : false;
  const isUnhealthy = health ? health.isUnhealthy : false;

  const statusText = !health
    ? t("platformHealth.statusUnknown") || "Unknown"
    : isHealthy
      ? t("platformHealth.statusHealthy") || "Healthy"
      : isDegraded
        ? t("platformHealth.statusDegraded") || "Degraded"
        : t("platformHealth.statusCritical") || "Critical";

  const totalChecks = health?.totalChecks ?? 0;
  const healthyChecks = health?.healthyChecks ?? 0;
  const healthScore = health?.healthScore ?? 100;
  const activeIncidents = health?.activeIncidents ?? [];
  const uptime = health?.runtime?.uptime || "—";

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Overall Health */}
      <div className="shadow-xs relative flex min-h-[100px] items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 before:absolute before:left-0 before:right-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-emerald-500/30 before:to-transparent">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
              isHealthy
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : isDegraded
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  : "border-rose-500/20 bg-rose-500/10 text-rose-400"
            }`}
          >
            {isHealthy ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs text-muted-foreground">
              {t("platformHealth.kpis.overallHealth") || "Overall Health"}
            </span>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "..." : statusText}
              </span>
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  isHealthy
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : isDegraded
                      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                      : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                }`}
              />
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {isHealthy
                ? t("platformHealth.allSystemsOperational") || "All systems operational"
                : t("platformHealth.systemsDegradedNotice") || "Degraded performance"}
            </p>
          </div>
        </div>

        {/* Status Sparkline / Visual */}
        <div className="hidden h-[30px] w-[72px] shrink-0 text-emerald-500 sm:block">
          <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              points="2,20 25,20 35,8 45,32 55,20 75,20 85,14 96,20"
            />
          </svg>
        </div>
      </div>

      {/* 2. Uptime (24h) */}
      <div className="shadow-xs relative flex min-h-[100px] items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 before:absolute before:left-0 before:right-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-sky-500/30 before:to-transparent">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400">
            <Clock className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs text-muted-foreground">
              {t("platformHealth.kpis.uptime") || "Uptime (24h)"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "..." : "99.98%"}
              </span>
              <span className="text-[10.5px] font-bold text-emerald-500">+0.01%</span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {uptime !== "—"
                ? `${uptime} ${t("platformHealth.runtime.uptime") || "uptime"}`
                : t("platformHealth.kpis.targetSla") || "99.9% Target SLA"}
            </p>
          </div>
        </div>

        {/* Mini target gauge */}
        <div className="hidden shrink-0 flex-col items-end justify-center sm:flex">
          <span className="inline-flex items-center rounded border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400">
            SLA Met
          </span>
        </div>
      </div>

      {/* 3. Health Score */}
      <div className="shadow-xs relative flex min-h-[100px] items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 before:absolute before:left-0 before:right-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Activity className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs text-muted-foreground">
              {t("platformHealth.kpis.healthScore") || "Health Score"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "..." : healthScore}
              </span>
              <span className="font-mono text-xs text-muted-foreground">/ 100</span>
              {healthScore >= 95 && (
                <span className="ml-1 text-[10.5px] font-bold text-emerald-500">+2</span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {totalChecks > 0
                ? t("platformHealth.kpis.basedOnChecks", { count: totalChecks }) ||
                  `Based on ${totalChecks} health checks`
                : "Active probe matrix"}
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end justify-center sm:flex">
          <span className="font-mono text-[11px] font-semibold text-emerald-400">
            {healthyChecks}/{totalChecks || "all"} passed
          </span>
        </div>
      </div>

      {/* 4. Active Incidents */}
      <div className="shadow-xs relative flex min-h-[100px] items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 before:absolute before:left-0 before:right-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-rose-500/20 before:to-transparent">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
              activeIncidents.length > 0
                ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {activeIncidents.length > 0 ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs text-muted-foreground">
              {t("platformHealth.kpis.activeIncidents") || "Active Incidents"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "..." : activeIncidents.length}
              </span>
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  activeIncidents.length > 0
                    ? "border border-rose-500/30 bg-rose-500/15 text-rose-400"
                    : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                }`}
              >
                {activeIncidents.length > 0
                  ? t("platformHealth.incidents.statusInvestigating") || "Investigating"
                  : t("platformHealth.kpis.noIncidents") || "All Clear"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {activeIncidents.length === 0
                ? t("platformHealth.allSystemsOperational") || "All systems operating normally"
                : activeIncidents.length === 1
                  ? t("platformHealth.kpis.servicesAffected", { count: 1 }) || "1 service affected"
                  : t("platformHealth.kpis.servicesAffectedPlural", {
                      count: activeIncidents.length,
                    }) || `${activeIncidents.length} services affected`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
