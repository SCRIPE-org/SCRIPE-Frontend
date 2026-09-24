"use client";

import React, { useState, useMemo } from "react";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import type { AttentionAlertItem, AlertCategory } from "../../viewmodels/usePlatformCommandCenterViewModel";
import type { DashboardSummary } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

interface PlatformNeedsAttentionProps {
  summary?: DashboardSummary;
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
  isLoading?: boolean;
  alerts?: AttentionAlertItem[];
}

export function PlatformNeedsAttention({
  summary,
  healthVm,
  isLoading = false,
  alerts: propAlerts,
}: PlatformNeedsAttentionProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<AlertCategory>("all");

  // If alerts are passed from ViewModel use them, otherwise empty list
  const alerts: AttentionAlertItem[] = useMemo(() => {
    return propAlerts ?? [];
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
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[520px]">
      {/* 1. Panel Header */}
      <div className="h-[60px] px-4 py-3 flex items-center justify-between border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              {t("platformCommandCenter.needsAttention.title") || "Needs attention"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {t("platformCommandCenter.needsAttention.subtitle") ||
                "Prioritized by operational impact"}
            </p>
          </div>
        </div>

        <Link
          href="/security"
          className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group"
        >
          <span>{t("platformCommandCenter.needsAttention.openQueue") || "Open queue"}</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-4 px-4 pt-2.5 pb-2 border-b border-border bg-muted/20">
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
              className={`relative pb-2 text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
                  isActive
                    ? "bg-primary/20 text-primary font-bold"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(198,255,0,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Alert List */}
      <div className="flex-1 p-3 overflow-y-auto divide-y divide-border/60">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground text-xs">
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
                className="py-2.5 px-2 rounded-lg hover:bg-accent/50 flex items-center gap-3 transition-colors group"
              >
                {/* Severity Dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotStyles}`} />

                {/* Icon Squircle */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconStyles}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {alert.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {alert.subtitle}
                  </div>
                </div>

                {/* Time & Chevron */}
                <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                  <span className="text-[10px] font-mono">{alert.timeAgo}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
