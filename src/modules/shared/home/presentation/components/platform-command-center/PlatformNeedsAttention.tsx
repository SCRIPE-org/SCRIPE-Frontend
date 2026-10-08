"use client";

import React, { useState, useMemo } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  AttentionAlertItem,
  AlertCategory,
} from "../../viewmodels/usePlatformCommandCenterViewModel";
import type { DashboardSummary } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

interface PlatformNeedsAttentionProps {
  summary?: DashboardSummary;
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
  isLoading?: boolean;
  alerts?: AttentionAlertItem[];
}

export function PlatformNeedsAttention({ alerts: propAlerts }: PlatformNeedsAttentionProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<AlertCategory>("all");

  const alerts: AttentionAlertItem[] = useMemo(() => {
    return propAlerts && propAlerts.length > 0 ? propAlerts : [];
  }, [propAlerts]);

  const counts = useMemo(() => {
    return {
      all: alerts.length,
      critical: alerts.filter((a) => a.category === "critical").length,
      warning: alerts.filter((a) => a.category === "warning").length,
      info: alerts.filter((a) => a.category === "info").length,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (activeTab === "all") return alerts;
    return alerts.filter((a) => a.category === activeTab);
  }, [activeTab, alerts]);

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* 1. Panel Header */}
      <div className="flex h-[60px] items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="shadow-xs flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
              {t("platformCommandCenter.needsAttention.title") || "Needs Attention"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {t("platformCommandCenter.needsAttention.subtitle") ||
                "Prioritized by operational impact."}
            </p>
          </div>
        </div>

        <Link
          href="/security"
          className="group flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <span>{t("platformCommandCenter.needsAttention.viewAll") || "View All"}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-border bg-muted/20 px-4 pb-2 pt-2.5">
        {(
          [
            {
              key: "all",
              label: t("platformCommandCenter.needsAttention.all") || "All",
              count: counts.all,
            },
            {
              key: "critical",
              label: t("platformCommandCenter.needsAttention.critical") || "Critical",
              count: counts.critical,
            },
            {
              key: "warning",
              label: t("platformCommandCenter.needsAttention.warnings") || "Warnings",
              count: counts.warning,
            },
            {
              key: "info",
              label: t("platformCommandCenter.needsAttention.info") || "Info",
              count: counts.info,
            },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex cursor-pointer items-center gap-1.5 pb-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] leading-none ${
                  isActive
                    ? "bg-primary/20 font-bold text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary shadow-[0_0_8px_rgba(198,255,0,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Alert List */}
      <div className="flex-1 divide-y divide-border/60 overflow-y-auto p-3">
        {filteredAlerts.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
            {t("platformCommandCenter.needsAttention.noAlerts") ||
              "No active alerts in this category"}
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = alert.icon;

            const iconStyles =
              alert.iconTheme === "destructive"
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : alert.iconTheme === "warning"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  : alert.iconTheme === "info"
                    ? "bg-sky-500/10 border-sky-500/20 text-sky-500"
                    : "bg-primary/10 border-primary/20 text-primary";

            const dotStyles =
              alert.iconTheme === "destructive"
                ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                : alert.iconTheme === "warning"
                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  : alert.iconTheme === "info"
                    ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]"
                    : "bg-primary shadow-[0_0_8px_rgba(198,255,0,0.6)]";

            return (
              <Link
                key={alert.id}
                href={alert.href}
                className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
              >
                {/* Severity Dot */}
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotStyles}`} />

                {/* Icon Squircle */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconStyles}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                    {alert.title}
                  </div>
                  <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {alert.subtitle}
                  </div>
                </div>

                {/* Time & Chevron */}
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <span className="font-mono text-[10px]">{alert.timeAgo}</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
