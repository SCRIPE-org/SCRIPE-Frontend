"use client";

import React from "react";
import Link from "next/link";
import { Calendar, FileDown, RotateCw, ScrollText, Settings2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@core/ui/dropdown-menu";
import type { SecurityTimeRange } from "../viewmodels/useSecurityDashboardViewModel";

interface SecurityHeaderProps {
  timeRange: SecurityTimeRange;
  setTimeRange: (range: SecurityTimeRange) => void;
  isRefetching: boolean;
  onRefresh: () => void;
  status: "healthy" | "warning" | "critical";
  statusLabel: string;
  onOpenExport: () => void;
  onOpenStudio?: () => void;
}

/**
 * SecurityHeader
 */
export function SecurityHeader({
  timeRange,
  setTimeRange,
  isRefetching,
  onRefresh,
  status,
  statusLabel,
  onOpenExport,
  onOpenStudio,
}: SecurityHeaderProps) {
  const { t } = useI18n();

  const ranges: Array<{ key: SecurityTimeRange; label: string }> = [
    {
      key: "24h",
      label: t("security.timeRanges.last24Hours") || "Last 24 hours",
    },
    {
      key: "7d",
      label: t("security.timeRanges.last7Days") || "Last 7 days",
    },
    {
      key: "30d",
      label: t("security.timeRanges.last30Days") || "Last 30 days",
    },
  ];

  const currentRangeLabel = ranges.find((r) => r.key === timeRange)?.label ?? ranges[1].label;

  const isHealthy = status === "healthy";
  const isWarning = status === "warning";

  return (
    <header className="flex flex-col gap-4 border-b border-nx-line pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {t("security.eyebrow") || "MONITORING"}
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-nx-ink sm:text-3xl">
          {t("security.title") || "Security"}
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-nx-ink-3 sm:text-sm">
          {t("security.subtitle") ||
            "Monitor authentication posture, active access, and security activity across the SCRIPE platform."}
        </p>
      </div>

      {/* Header Right Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Operational State Pill */}
        <span className="inline-flex items-center gap-2 rounded-lg border border-nx-line bg-nx-surface px-3 py-1.5 text-xs font-medium">
          <span
            className={`h-2 w-2 rounded-full ${
              isHealthy
                ? "bg-success shadow-[0_0_6px_rgba(34,197,94,0.7)]"
                : isWarning
                  ? "bg-warning shadow-[0_0_6px_rgba(234,179,8,0.7)]"
                  : "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.7)]"
            }`}
            aria-hidden="true"
          />
          <span className="text-nx-ink">{statusLabel}</span>
        </span>

        {/* Time Range Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 cursor-pointer gap-2 border-nx-line bg-nx-surface px-3 text-xs font-semibold text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
            >
              <Calendar className="h-3.5 w-3.5 text-nx-ink-3" />
              <span>{currentRangeLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 border-nx-line bg-nx-surface text-nx-ink">
            {ranges.map((range) => (
              <DropdownMenuItem
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`cursor-pointer text-xs ${
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
          onClick={onRefresh}
          disabled={isRefetching}
          className="h-8.5 cursor-pointer gap-1.5 border-nx-line bg-nx-surface px-3 text-xs font-semibold text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">
            {isRefetching
              ? t("security.refreshing") || "Refreshing..."
              : t("security.refresh") || "Refresh"}
          </span>
        </Button>

        {/* View in Audit Log Deep Link */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="h-8.5 gap-1.5 border-nx-line bg-nx-surface px-3 text-xs font-semibold text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
        >
          <Link href="/audit" title="Open authoritative Audit Log console">
            <ScrollText className="h-3.5 w-3.5 text-nx-ink-3" />
            <span className="hidden sm:inline">{t("security.viewInAudit") || "Audit Log"}</span>
          </Link>
        </Button>

        {/* Export Security Report */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenExport}
          className="h-8.5 cursor-pointer gap-1.5 border-nx-line bg-nx-surface px-3 text-xs font-semibold text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
        >
          <FileDown className="h-3.5 w-3.5 text-nx-ink-3" />
          <span className="hidden sm:inline">{t("security.export") || "Export"}</span>
        </Button>

        {/* Dashboard Studio Panel Trigger */}
        {onOpenStudio && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenStudio}
            className="h-8.5 cursor-pointer border-nx-line bg-nx-surface px-2.5 text-xs text-nx-ink-3 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink"
            title="Dashboard Studio"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </header>
  );
}
