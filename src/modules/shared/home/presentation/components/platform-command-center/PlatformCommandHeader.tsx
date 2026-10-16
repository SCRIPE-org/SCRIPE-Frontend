"use client";

import React from "react";
import { Calendar, SlidersHorizontal, RotateCw, Sparkles } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@core/ui/dropdown-menu";
import { usePresentationMode } from "../../viewmodels/usePresentationMode";

interface PlatformCommandHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenCustomize?: () => void;
  isLive?: boolean;
  onToggleLive?: () => void;
  timeRangeKey?: string;
  onChangeTimeRange?: (key: string) => void;
}

export function PlatformCommandHeader({
  onRefresh,
  isRefreshing = false,
  onOpenCustomize,
  isLive = true,
  onToggleLive,
  timeRangeKey = "last24Hours",
  onChangeTimeRange,
}: PlatformCommandHeaderProps) {
  const { t } = useI18n();
  const { isPresentationMode, togglePresentationMode } = usePresentationMode();

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

  const currentRangeLabel = ranges.find((r) => r.key === timeRangeKey)?.label ?? ranges[0].label;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      {/* Title & Subtitle */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="block text-xs font-bold uppercase tracking-wider text-primary">
            {t("platformCommandCenter.administration") || "Administration"}
          </span>
          {isPresentationMode && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500">
              Demo Mode Active
            </span>
          )}
        </div>
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
          {t("platformCommandCenter.title") || "Platform command center"}
        </h1>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground sm:text-sm">
          {t("platformCommandCenter.subtitle") ||
            "Global operations, tenant telemetry, and cross-region activity across the SCRIPE ecosystem."}
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        {/* Presentation / Demo Mode Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={togglePresentationMode}
          title={
            isPresentationMode
              ? "Switch to live backend data"
              : "Switch to presentation showcase mode"
          }
          className={`shadow-xs h-9 cursor-pointer gap-1.5 border px-3 text-xs font-semibold transition-colors ${
            isPresentationMode
              ? "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles
            className={`h-3.5 w-3.5 ${isPresentationMode ? "fill-amber-500/30 text-amber-500" : "text-muted-foreground"}`}
          />
          <span>{isPresentationMode ? "Demo Mode" : "Live Data"}</span>
        </Button>

        {/* Timeframe Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shadow-xs h-9 gap-2 border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-accent"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{currentRangeLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 border-border bg-popover shadow-xl">
            {ranges.map((r) => (
              <DropdownMenuItem
                key={r.key}
                onClick={() => onChangeTimeRange?.(r.key)}
                className={`cursor-pointer text-xs ${
                  timeRangeKey === r.key
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-popover-foreground"
                }`}
              >
                {r.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Live Status Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (onToggleLive) onToggleLive();
            else if (onRefresh) onRefresh();
          }}
          title={
            isLive
              ? t("platformCommandCenter.pauseTelemetry") || "Click to pause telemetry"
              : t("platformCommandCenter.resumeTelemetry") || "Click to resume live stream"
          }
          className={`shadow-xs h-9 cursor-pointer gap-2 border px-3 text-xs font-semibold transition-colors ${
            isLive
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          {isLive ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.75)]"></span>
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
          )}
          <span>
            {isLive
              ? t("platformCommandCenter.liveStreaming") || "Live · 30s"
              : t("platformCommandCenter.livePaused") || "Paused"}
          </span>
          {isRefreshing && <RotateCw className="ml-0.5 h-3 w-3 animate-spin text-emerald-500" />}
        </Button>

        {/* Customize Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCustomize}
          className="shadow-xs h-9 gap-2 border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-accent"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{t("platformCommandCenter.customize") || "Customize"}</span>
        </Button>
      </div>
    </div>
  );
}
