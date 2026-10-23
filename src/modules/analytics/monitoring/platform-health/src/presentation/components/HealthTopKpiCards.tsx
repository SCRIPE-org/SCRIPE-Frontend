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
import { Card } from "@core/ui/card";
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
      <Card className="min-w-0 flex min-h-[100px] items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
              isHealthy
                ? "border-success/30 bg-success/10 text-success"
                : isDegraded
                  ? "border-warning/30 bg-warning/10 text-warning"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {isHealthy ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs text-nx-ink-3">
              {t("platformHealth.kpis.overallHealth") || "Overall Health"}
            </span>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-nx-ink">
                {isLoading ? "..." : statusText}
              </span>
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  isHealthy
                    ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                    : isDegraded
                      ? "bg-warning shadow-[0_0_8px_rgba(234,179,8,0.8)]"
                      : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                }`}
              />
            </div>
            <p className="mt-0.5 truncate text-[11px] text-nx-ink-3">
              {isHealthy
                ? t("platformHealth.allSystemsOperational") || "All systems operational"
                : t("platformHealth.systemsDegradedNotice") || "Degraded performance"}
            </p>
          </div>
        </div>

        {/* Status Sparkline / Visual */}
        <div className="hidden h-[30px] w-[72px] shrink-0 text-success sm:block">
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
      </Card>

      {/* 2. Uptime (24h) */}
      <Card className="min-w-0 flex min-h-[100px] items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-info/30 bg-info/10 text-info">
            <Clock className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs text-nx-ink-3">
              {t("platformHealth.kpis.uptime") || "Uptime (24h)"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-nx-ink">
                {isLoading ? "..." : "99.98%"}
              </span>
              <span className="text-[10.5px] font-bold text-success">+0.01%</span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-nx-ink-3">
              {uptime !== "—"
                ? `${uptime} ${t("platformHealth.runtime.uptime") || "uptime"}`
                : t("platformHealth.kpis.targetSla") || "99.9% Target SLA"}
            </p>
          </div>
        </div>

        {/* Mini target gauge */}
        <div className="hidden shrink-0 flex-col items-end justify-center sm:flex">
          <span className="inline-flex items-center rounded border border-info/30 bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info">
            SLA Met
          </span>
        </div>
      </Card>

      {/* 3. Health Score */}
      <Card className="min-w-0 flex min-h-[100px] items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Activity className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs text-nx-ink-3">
              {t("platformHealth.kpis.healthScore") || "Health Score"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-nx-ink">
                {isLoading ? "..." : healthScore}
              </span>
              <span className="font-mono text-xs text-nx-ink-3">/ 100</span>
              {healthScore >= 95 && (
                <span className="ml-1 text-[10.5px] font-bold text-success">+2</span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[11px] text-nx-ink-3">
              {totalChecks > 0
                ? t("platformHealth.kpis.basedOnChecks", { count: totalChecks }) ||
                  `Based on ${totalChecks} health checks`
                : "Active probe matrix"}
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end justify-center sm:flex">
          <span className="font-mono text-[11px] font-semibold text-success">
            {healthyChecks}/{totalChecks || "all"} passed
          </span>
        </div>
      </Card>

      {/* 4. Active Incidents */}
      <Card className="min-w-0 flex min-h-[100px] items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
              activeIncidents.length > 0
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-success/30 bg-success/10 text-success"
            }`}
          >
            {activeIncidents.length > 0 ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs text-nx-ink-3">
              {t("platformHealth.kpis.activeIncidents") || "Active Incidents"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-nx-ink">
                {isLoading ? "..." : activeIncidents.length}
              </span>
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  activeIncidents.length > 0
                    ? "border border-destructive/30 bg-destructive/10 text-destructive"
                    : "border border-success/30 bg-success/10 text-success"
                }`}
              >
                {activeIncidents.length > 0
                  ? t("platformHealth.incidents.statusInvestigating") || "Investigating"
                  : t("platformHealth.kpis.noIncidents") || "All Clear"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-nx-ink-3">
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
      </Card>
    </div>
  );
}
