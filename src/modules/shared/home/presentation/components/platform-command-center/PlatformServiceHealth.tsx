"use client";

import React from "react";
import { Activity } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import type { ServiceHealthItem } from "../../viewmodels/usePlatformCommandCenterViewModel";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

interface PlatformServiceHealthProps {
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
  services?: ServiceHealthItem[];
  overallScore?: string;
}

export function PlatformServiceHealth({
  healthVm,
  services: propServices,
  overallScore: propOverallScore,
}: PlatformServiceHealthProps) {
  const { t } = useI18n();

  const services: ServiceHealthItem[] = propServices ?? [
    {
      id: "s1",
      name: "Core API",
      metric: "Ready",
      status: "Healthy",
    },
    {
      id: "s2",
      name: "Identity & Access",
      metric: "Ready",
      status: "Healthy",
    },
    {
      id: "s3",
      name: "Relational Persistence",
      metric: "Connected",
      status: "Healthy",
    },
    {
      id: "s4",
      name: "Distributed Cache",
      metric: "Active",
      status: "Healthy",
    },
  ];

  const overallScore =
    propOverallScore ??
    (healthVm?.health?.isHealthy
      ? "100%"
      : healthVm?.health?.status
      ? `${healthVm.health.status}`
      : "Operational");

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[280px]">
      {/* Header */}
      <div className="h-[58px] px-4 py-3 flex items-center justify-between border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              {t("platformCommandCenter.serviceHealth.title") || "Service health"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("platformCommandCenter.serviceHealth.subtitle") ||
                "Current platform service status"}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="text-xs font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border-primary/20 shadow-xs"
        >
          {overallScore}
        </Badge>
      </div>

      {/* Services List */}
      <div className="flex-1 p-3 divide-y divide-border/60 overflow-y-auto">
        {services.map((svc) => {
          const isHealthy = svc.status === "Healthy";
          const isDegraded = svc.status === "Degraded";

          const dotClass = isHealthy
            ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
            : isDegraded
            ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
            : "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.6)]";

          const badgeClass = isHealthy
            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            : isDegraded
            ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
            : "text-destructive bg-destructive/10 border-destructive/20";

          const statusLabel = isHealthy
            ? t("platformCommandCenter.serviceHealth.statuses.healthy") || t("platformCommandCenter.kpis.operational") || "Operational"
            : isDegraded
            ? t("platformCommandCenter.serviceHealth.statuses.degraded") || t("platformCommandCenter.kpis.degraded") || "Degraded"
            : t("platformCommandCenter.serviceHealth.statuses.outage") || t("platformCommandCenter.kpis.outage") || "Outage";

          return (
            <div key={svc.id} className="py-2.5 px-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                <div className="min-w-0">
                  <b className="text-xs font-semibold text-foreground block truncate">
                    {svc.name}
                  </b>
                  <small className="text-[10px] text-muted-foreground block mt-0.5">
                    {svc.metric}
                  </small>
                </div>
              </div>

              <span
                className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}
              >
                {statusLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
