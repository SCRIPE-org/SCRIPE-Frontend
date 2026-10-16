"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  Calendar,
  ChevronRight,
  RotateCw,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@core/ui/dropdown-menu";
import type { usePlatformCommandCenterViewModel } from "../viewmodels/usePlatformCommandCenterViewModel";
import { PlatformKpiCards } from "./platform-command-center/PlatformKpiCards";
import { PlatformActivityMap } from "./platform-command-center/PlatformActivityMap";
import { PlatformNeedsAttention } from "./platform-command-center/PlatformNeedsAttention";
import { PlatformRecentActivity } from "./platform-command-center/PlatformRecentActivity";
import { PlatformServiceHealth } from "./platform-command-center/PlatformServiceHealth";

type CommandCenter = ReturnType<typeof usePlatformCommandCenterViewModel>;

export function MonitoringOverview({ vm }: { vm: CommandCenter }) {
  const { t } = useI18n();
  const summary = vm.summary;
  const health = vm.health;

  const degraded =
    (health?.isDegraded ?? false) ||
    vm.kpis.degradedCount > 0 ||
    health?.infrastructure?.database?.isConnected === false;

  const statusLabel = !health
    ? t("platformCommandCenter.monitoringOverview.unknown") || "Status unavailable"
    : degraded
      ? t("platformCommandCenter.monitoringOverview.degraded") || "Platform needs attention"
      : t("platformCommandCenter.monitoringOverview.operational") || "All Systems Operational";

  const ranges = [
    {
      key: "last24Hours",
      label: t("platformCommandCenter.timeRanges.last24Hours") || "Last 24 hours",
    },
    {
      key: "last7Days",
      label: t("platformCommandCenter.timeRanges.last7Days") || "Last 7 days",
    },
    {
      key: "last30Days",
      label: t("platformCommandCenter.timeRanges.last30Days") || "Last 30 days",
    },
  ];

  const currentRangeLabel = ranges.find((r) => r.key === vm.timeRangeKey)?.label ?? ranges[0].label;

  return (
    <div className="w-full select-none space-y-4 pb-8">
      {/* ── 1. Page Header matching Command Center ────────────────────────── */}
      <header className="flex flex-col gap-4 border-b border-border/80 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {t("platformCommandCenter.monitoringOverview.eyebrow") || "MONITORING"}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
            {t("platformCommandCenter.monitoringOverview.title") || "Platform Overview"}
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
            {t("platformCommandCenter.monitoringOverview.subtitle") ||
              "Real-time visibility into platform operations, tenant activity, and system signals across SCRIPE."}
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Operational State Pill */}
          <span className="shadow-xs inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <span
              className={`h-2 w-2 rounded-full ${
                degraded
                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                  : health
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    : "bg-muted-foreground"
              }`}
              aria-hidden="true"
            />
            <span className="text-foreground">{statusLabel}</span>
          </span>

          {/* Live Data Indicator */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={vm.toggleLive}
            title={vm.isLive ? "Telemetry live stream active" : "Telemetry stream paused"}
            className="h-8.5 shadow-xs cursor-pointer gap-1.5 border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{t("platformCommandCenter.liveData") || "Live Data"}</span>
          </Button>

          {/* Time Range Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 shadow-xs cursor-pointer gap-2 border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{currentRangeLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border-border bg-popover shadow-xl">
              {ranges.map((r) => (
                <DropdownMenuItem
                  key={r.key}
                  onClick={() => vm.setTimeRangeKey(r.key)}
                  className={`cursor-pointer text-xs ${
                    vm.timeRangeKey === r.key
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-popover-foreground"
                  }`}
                >
                  {r.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live Status Pill */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={vm.toggleLive}
            className={`h-8.5 shadow-xs cursor-pointer gap-2 border px-3 text-xs font-semibold transition-colors ${
              vm.isLive
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {vm.isLive ? (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.75)]" />
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            )}
            <span>
              {vm.isLive
                ? t("platformCommandCenter.monitoringOverview.live") || "Live"
                : t("platformCommandCenter.monitoringOverview.paused") || "Paused"}
            </span>
          </Button>

          {/* Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => vm.refetchAll()}
            disabled={vm.isRefreshing}
            className="h-8.5 shadow-xs cursor-pointer gap-1.5 border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-accent"
          >
            <RotateCw
              className={`h-3.5 w-3.5 text-muted-foreground ${vm.isRefreshing ? "animate-spin text-primary" : ""}`}
            />
            <span>{t("platformCommandCenter.monitoringOverview.refresh") || "Refresh"}</span>
          </Button>
        </div>
      </header>

      {/* ── 2. Top KPI Strip (4 cards matching image.png) ───────────────────── */}
      <section>
        <PlatformKpiCards
          summary={summary}
          healthVm={vm.healthVm}
          isLoading={vm.isLoading}
          kpis={vm.kpis}
        />
      </section>

      {/* ── 3. Middle Section: Global Tenant Activity + Needs Attention ─────── */}
      <section className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-12">
        {/* Global Tenant Activity (World Map + Regional Metrics) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <PlatformActivityMap
            summary={summary}
            recentActivity={vm.recentChanges}
            loginActivity={vm.loginActivity}
            healthVm={vm.healthVm}
            regionNodes={vm.regionNodes}
            isLoading={vm.isLoading}
          />
        </div>

        {/* Needs Attention Alert Queue */}
        <div className="lg:col-span-5 xl:col-span-4">
          <PlatformNeedsAttention
            summary={summary}
            healthVm={vm.healthVm}
            isLoading={vm.isLoading}
            alerts={vm.attentionAlerts}
          />
        </div>
      </section>

      {/* ── 4. Lower Section: Recent Platform Activity + Platform Services Health ─ */}
      <section className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-2">
        {/* Recent Platform Activity Table */}
        <PlatformRecentActivity activityData={vm.recentChanges} isLoading={vm.isLoading} />

        {/* Platform Services Health List */}
        <PlatformServiceHealth healthVm={vm.healthVm} />
      </section>

      {/* ── 5. Bottom Section: Explore Monitoring Specialized Surfaces ────── */}
      <section className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            {t("platformCommandCenter.monitoringOverview.exploreTitle") || "Explore Monitoring"}
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Specialized platforms & investigation surfaces
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ExploreDestination
            href="/platform-health"
            title={t("platformCommandCenter.monitoringOverview.healthTitle") || "Health"}
            body={
              t("platformCommandCenter.monitoringOverview.healthBody") ||
              "System health, dependencies and operational checks"
            }
            icon={Activity}
          />
          <ExploreDestination
            href="/analytics"
            title={
              t("platformCommandCenter.monitoringOverview.analyticsTitle") || "Tenant Analytics"
            }
            body={
              t("platformCommandCenter.monitoringOverview.analyticsBody") ||
              "Tenant-level usage and activity analysis"
            }
            icon={Building2}
          />
          <ExploreDestination
            href="/audit"
            title={t("platformCommandCenter.monitoringOverview.auditTitle") || "Audit Log"}
            body={
              t("platformCommandCenter.monitoringOverview.auditBody") ||
              "Searchable operational and administrative activity history"
            }
            icon={ScrollText}
          />
          <ExploreDestination
            href="/security"
            title={t("platformCommandCenter.monitoringOverview.securityTitle") || "Security"}
            body={
              t("platformCommandCenter.monitoringOverview.securityBody") ||
              "Security events, access activity and security signals"
            }
            icon={ShieldCheck}
          />
        </div>
      </section>
    </div>
  );
}

function ExploreDestination({
  href,
  title,
  body,
  icon: Icon,
}: {
  href: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="shadow-xs group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-105">
          <Icon className="h-4 w-4" />
        </div>
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
          <span>Open</span>
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{body}</p>
      </div>
    </Link>
  );
}
