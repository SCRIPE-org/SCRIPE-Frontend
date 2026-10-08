"use client";

import React from "react";
import { Database, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

interface ServiceHealthRow {
  id: string;
  name: string;
  status: "Healthy" | "Degraded" | "Outage";
  uptime: string;
  latencyMs: number;
  historyBars: number[]; // 1-10 scale for latency bar heights
}

const DEFAULT_PLATFORM_SERVICES: ServiceHealthRow[] = [
  {
    id: "svc-gateway",
    name: "API Gateway",
    status: "Healthy",
    uptime: "99.99%",
    latencyMs: 42,
    historyBars: [4, 5, 4, 6, 5, 4, 5, 6, 4, 5, 4, 5, 6, 5, 4],
  },
  {
    id: "svc-auth",
    name: "Auth Service",
    status: "Healthy",
    uptime: "99.98%",
    latencyMs: 38,
    historyBars: [3, 4, 4, 5, 4, 3, 4, 4, 5, 4, 3, 4, 4, 3, 4],
  },
  {
    id: "svc-tenant",
    name: "Tenant Service",
    status: "Healthy",
    uptime: "100%",
    latencyMs: 51,
    historyBars: [5, 6, 5, 5, 6, 5, 6, 5, 5, 6, 5, 6, 5, 6, 5],
  },
  {
    id: "svc-billing",
    name: "Billing Service",
    status: "Degraded",
    uptime: "99.9%",
    latencyMs: 120,
    historyBars: [6, 7, 8, 9, 8, 9, 10, 8, 9, 8, 9, 10, 9, 8, 9],
  },
  {
    id: "svc-messaging",
    name: "Messaging Service",
    status: "Healthy",
    uptime: "99.97%",
    latencyMs: 67,
    historyBars: [5, 5, 6, 6, 7, 6, 5, 6, 7, 6, 5, 6, 6, 7, 6],
  },
  {
    id: "svc-database",
    name: "Database",
    status: "Healthy",
    uptime: "100%",
    latencyMs: 14,
    historyBars: [2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 2],
  },
  {
    id: "svc-redis",
    name: "Redis Cache",
    status: "Healthy",
    uptime: "99.99%",
    latencyMs: 8,
    historyBars: [1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1],
  },
  {
    id: "svc-storage",
    name: "Storage Service",
    status: "Healthy",
    uptime: "99.98%",
    latencyMs: 32,
    historyBars: [3, 4, 3, 4, 3, 4, 4, 3, 4, 3, 4, 3, 4, 3, 4],
  },
];

interface PlatformServiceHealthProps {
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
}

export function PlatformServiceHealth({ healthVm }: PlatformServiceHealthProps) {
  const { t } = useI18n();

  // If backend health has specific infrastructure signals, adapt latency and status
  const services: ServiceHealthRow[] = React.useMemo(() => {
    const infra = healthVm?.health?.infrastructure;
    return DEFAULT_PLATFORM_SERVICES.map((svc) => {
      if (svc.id === "svc-database" && infra?.database) {
        return {
          ...svc,
          status: infra.database.isConnected ? "Healthy" : "Outage",
          latencyMs: infra.database.latencyMs ?? svc.latencyMs,
        };
      }
      if (svc.id === "svc-redis" && infra?.redis) {
        return {
          ...svc,
          status: infra.redis.isConnected ? "Healthy" : "Degraded",
        };
      }
      return svc;
    });
  }, [healthVm?.health]);

  return (
    <div className="flex h-[400px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="shadow-xs flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#84cc16]/20 bg-[#84cc16]/10 text-[#84cc16]">
            <Database className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
              {t("platformCommandCenter.serviceHealth.title") || "Platform Services Health"}
            </h2>
            <p className="truncate text-[11px] text-muted-foreground">
              {t("platformCommandCenter.serviceHealth.subtitle") ||
                "Status of core platform services and dependencies."}
            </p>
          </div>
        </div>

        <Link
          href="/platform-health"
          className="group flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <span>{t("platformCommandCenter.serviceHealth.viewAll") || "View All"}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Services List */}
      <div className="flex-1 divide-y divide-border/60 overflow-y-auto p-3">
        {services.map((svc) => {
          const isHealthy = svc.status === "Healthy";
          const isDegraded = svc.status === "Degraded";

          const dotColor = isHealthy
            ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
            : isDegraded
              ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]"
              : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]";

          const statusTextColor = isHealthy
            ? "text-emerald-500"
            : isDegraded
              ? "text-amber-500"
              : "text-rose-500";

          const statusLabel = isHealthy
            ? t("platformCommandCenter.serviceHealth.statuses.healthy") || "Healthy"
            : isDegraded
              ? t("platformCommandCenter.serviceHealth.statuses.degraded") || "Degraded"
              : t("platformCommandCenter.serviceHealth.statuses.outage") || "Outage";

          return (
            <div
              key={svc.id}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/20"
            >
              {/* Service Name */}
              <div className="w-[140px] shrink-0 truncate text-xs font-medium text-foreground">
                {svc.name}
              </div>

              {/* Status Badge */}
              <div className="flex w-[90px] shrink-0 items-center gap-1.5 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                <span className={`text-[11px] font-semibold ${statusTextColor}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Uptime % */}
              <div className="w-[60px] shrink-0 text-end font-mono text-[11px] text-muted-foreground">
                {svc.uptime}
              </div>

              {/* Mini Sparkline Bar Chart */}
              <div className="hidden h-4 max-w-[90px] flex-1 items-center justify-center gap-0.5 px-1 sm:flex">
                {svc.historyBars.map((val, idx) => (
                  <span
                    key={`bar-${idx}`}
                    className={`rounded-xs w-1 transition-all ${
                      isDegraded ? "bg-amber-500/80" : "bg-[#84cc16]/75"
                    }`}
                    style={{ height: `${Math.max(2, val * 1.5)}px` }}
                  />
                ))}
              </div>

              {/* Latency ms */}
              <div className="w-[50px] shrink-0 text-end font-mono text-xs font-semibold text-foreground">
                {svc.latencyMs} ms
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
