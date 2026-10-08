"use client";

import React from "react";
import {
  Calendar,
  ExternalLink,
  RotateCw,
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

interface HealthHeaderProps {
  timeRange: "1h" | "24h" | "7d";
  setTimeRange: (range: "1h" | "24h" | "7d") => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  isRefetching: boolean;
  refetch: () => void;
  status: string;
}

/**
 * HealthHeader
 */
export function HealthHeader({
  timeRange,
  setTimeRange,
  autoRefresh,
  setAutoRefresh,
  isRefetching,
  refetch,
  status,
}: HealthHeaderProps) {
  const { t } = useI18n();

  const isHealthy = status.toLowerCase() === "healthy";
  const isDegraded = status.toLowerCase() === "degraded";

  const statusLabel = isHealthy
    ? t("platformHealth.allSystemsOperational") || "All Systems Operational"
    : isDegraded
    ? t("platformHealth.systemsDegradedNotice") || "Degraded Performance"
    : t("platformHealth.statusCritical") || "Critical Outage";

  const ranges: Array<{ key: "1h" | "24h" | "7d"; label: string }> = [
    {
      key: "1h",
      label: t("platformHealth.timeRanges.last1Hour") || "Last 1 hour",
    },
    {
      key: "24h",
      label: t("platformHealth.timeRanges.last24Hours") || "Last 24 hours",
    },
    {
      key: "7d",
      label: t("platformHealth.timeRanges.last7Days") || "Last 7 days",
    },
  ];

  const currentRangeLabel =
    ranges.find((r) => r.key === timeRange)?.label ?? ranges[1].label;

  return (
    <header className="flex flex-col gap-4 border-b border-border/80 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {t("platformHealth.eyebrow") || "MONITORING"}
          </p>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {t("platformHealth.title") || "Platform Health"}
        </h1>
        <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
          {t("platformHealth.subtitle") ||
            "Real-time health and performance of the SCRIPE platform, its infrastructure, services and external dependencies."}
        </p>
      </div>

      {/* Header Right Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Operational State Pill */}
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              isHealthy
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                : isDegraded
                ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]"
            }`}
            aria-hidden="true"
          />
          <span className="text-foreground">{statusLabel}</span>
        </span>

        {/* Live Data Toggle Indicator */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          title={autoRefresh ? "Telemetry live stream active (8s)" : "Telemetry stream paused"}
          className={`h-8.5 px-3 text-xs font-semibold gap-1.5 border-border bg-card shadow-xs cursor-pointer transition-colors ${
            autoRefresh
              ? "text-foreground border-primary/40 bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              autoRefresh
                ? "bg-primary animate-pulse shadow-[0_0_6px_rgba(132,204,22,0.8)]"
                : "bg-muted-foreground/60"
            }`}
          />
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>{t("platformHealth.liveData") || "Live"}</span>
        </Button>

        {/* Time Range Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 px-3 text-xs font-semibold gap-2 border-border bg-card hover:bg-accent text-foreground shadow-xs cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{currentRangeLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {ranges.map((range) => (
              <DropdownMenuItem
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`text-xs cursor-pointer ${
                  timeRange === range.key ? "font-semibold text-primary" : ""
                }`}
              >
                {range.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="h-8.5 px-3 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-accent text-foreground shadow-xs cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">
            {isRefetching
              ? t("platformHealth.refreshing") || "Sampling..."
              : t("platformHealth.refresh") || "Refresh"}
          </span>
        </Button>

        {/* Public Status Page Link */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="h-8.5 px-3 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-accent text-foreground shadow-xs"
        >
          <a
            href="/health"
            target="_blank"
            rel="noopener noreferrer"
            title="Open raw health probe endpoint"
          >
            <span>{t("platformHealth.viewStatusPage") || "View Status Page"}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        </Button>
      </div>
    </header>
  );
}
