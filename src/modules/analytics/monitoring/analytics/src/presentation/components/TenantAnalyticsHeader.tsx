"use client";

import React from "react";
import {
  Calendar,
  Download,
  Globe,
  Layers,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import type { TimeRangeOption } from "../viewmodels/useTenantAnalyticsViewModel";

interface TenantAnalyticsHeaderProps {
  timeRange: TimeRangeOption;
  setTimeRange: (range: TimeRangeOption) => void;
  regionFilter: string;
  setRegionFilter: (region: string) => void;
  availableRegions: string[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  availableStatuses: string[];
  editionFilter: string;
  setEditionFilter: (edition: string) => void;
  availableEditions: string[];
  isRefetching: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function TenantAnalyticsHeader({
  timeRange,
  setTimeRange,
  regionFilter,
  setRegionFilter,
  availableRegions,
  statusFilter,
  setStatusFilter,
  availableStatuses,
  editionFilter,
  setEditionFilter,
  availableEditions,
  isRefetching,
  onRefresh,
  onExport,
}: TenantAnalyticsHeaderProps) {
  const { t } = useI18n();

  const timeRanges: Array<{ key: TimeRangeOption; label: string }> = [
    { key: "7d", label: t("tenantAnalytics.header.timeRanges.7d") || "Last 7 days" },
    { key: "30d", label: t("tenantAnalytics.header.timeRanges.30d") || "Last 30 days" },
    { key: "90d", label: t("tenantAnalytics.header.timeRanges.90d") || "Last 90 days" },
    { key: "12m", label: t("tenantAnalytics.header.timeRanges.12m") || "Last 12 months" },
  ];

  const currentRangeLabel =
    timeRanges.find((r) => r.key === timeRange)?.label ?? timeRanges[1].label;

  return (
    <header className="flex flex-col gap-4 border-b border-border/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
      {/* Page Title & Breadcrumb context */}
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
          {t("tenantAnalytics.header.eyebrow") || "MONITORING"}
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {t("tenantAnalytics.header.title") || "Tenant Analytics"}
        </h1>
        <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
          {t("tenantAnalytics.header.subtitle") ||
            "Platform-wide insights into tenant growth, usage, adoption and engagement."}
        </p>
      </div>

      {/* Filter and Action Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Dropdown */}
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
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              {t("tenantAnalytics.header.timeRangeLabel") || "Time Horizon"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {timeRanges.map((range) => (
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

        {/* Region Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8.5 px-3 text-xs font-semibold gap-2 border-border bg-card hover:bg-accent text-foreground shadow-xs cursor-pointer ${
                regionFilter !== "all" ? "border-primary/50 text-primary" : ""
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {regionFilter === "all"
                  ? t("tenantAnalytics.header.allRegions") || "All Regions"
                  : regionFilter}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => setRegionFilter("all")}
              className={`text-xs cursor-pointer ${
                regionFilter === "all" ? "font-semibold text-primary" : ""
              }`}
            >
              {t("tenantAnalytics.header.allRegions") || "All Regions"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {availableRegions.map((region) => (
              <DropdownMenuItem
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`text-xs cursor-pointer ${
                  regionFilter === region ? "font-semibold text-primary" : ""
                }`}
              >
                {region}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8.5 px-3 text-xs font-semibold gap-2 border-border bg-card hover:bg-accent text-foreground shadow-xs cursor-pointer ${
                statusFilter !== "all" ? "border-primary/50 text-primary" : ""
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {statusFilter === "all"
                  ? t("tenantAnalytics.header.allStatuses") || "All Statuses"
                  : statusFilter}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setStatusFilter("all")}
              className={`text-xs cursor-pointer ${
                statusFilter === "all" ? "font-semibold text-primary" : ""
              }`}
            >
              {t("tenantAnalytics.header.allStatuses") || "All Statuses"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {availableStatuses.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs cursor-pointer ${
                  statusFilter === status ? "font-semibold text-primary" : ""
                }`}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edition Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8.5 px-3 text-xs font-semibold gap-2 border-border bg-card hover:bg-accent text-foreground shadow-xs cursor-pointer ${
                editionFilter !== "all" ? "border-primary/50 text-primary" : ""
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {editionFilter === "all"
                  ? t("tenantAnalytics.header.allEditions") || "All Editions"
                  : editionFilter}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setEditionFilter("all")}
              className={`text-xs cursor-pointer ${
                editionFilter === "all" ? "font-semibold text-primary" : ""
              }`}
            >
              {t("tenantAnalytics.header.allEditions") || "All Editions"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {availableEditions.map((edition) => (
              <DropdownMenuItem
                key={edition}
                onClick={() => setEditionFilter(edition)}
                className={`text-xs cursor-pointer ${
                  editionFilter === edition ? "font-semibold text-primary" : ""
                }`}
              >
                {edition}
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
          className="h-8.5 px-3 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-accent text-foreground shadow-xs cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">
            {isRefetching
              ? t("tenantAnalytics.header.refreshing") || "Syncing..."
              : t("tenantAnalytics.header.refresh") || "Refresh"}
          </span>
        </Button>

        {/* Export Button (Primary Lime) */}
        <Button
          type="button"
          size="sm"
          onClick={onExport}
          className="h-8.5 px-3.5 text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{t("tenantAnalytics.header.export") || "Export"}</span>
        </Button>
      </div>
    </header>
  );
}
