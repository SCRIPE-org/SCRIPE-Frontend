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

  const currentRangeLabel =
    ranges.find((r) => r.key === timeRangeKey)?.label ?? ranges[0].label;

  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block">
            {t("platformCommandCenter.administration") || "Administration"}
          </span>
          {isPresentationMode && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
              Demo Mode Active
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {t("platformCommandCenter.title") || "Platform command center"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl">
          {t("platformCommandCenter.subtitle") ||
            "Global operations, tenant telemetry, and cross-region activity across the SCRIPE ecosystem."}
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        {/* Presentation / Demo Mode Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={togglePresentationMode}
          title={isPresentationMode ? "Switch to live backend data" : "Switch to presentation showcase mode"}
          className={`h-9 px-3 text-xs font-semibold gap-1.5 transition-colors cursor-pointer border shadow-xs ${
            isPresentationMode
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
              : "bg-card border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className={`h-3.5 w-3.5 ${isPresentationMode ? "text-amber-500 fill-amber-500/30" : "text-muted-foreground"}`} />
          <span>{isPresentationMode ? "Demo Mode" : "Live Data"}</span>
        </Button>

        {/* Timeframe Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-semibold gap-2 border-border bg-card hover:bg-accent text-foreground shadow-xs"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{currentRangeLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-popover border-border shadow-xl">
            {ranges.map((r) => (
              <DropdownMenuItem
                key={r.key}
                onClick={() => onChangeTimeRange?.(r.key)}
                className={`text-xs cursor-pointer ${
                  timeRangeKey === r.key
                    ? "font-semibold text-primary bg-primary/10"
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
          className={`h-9 px-3 text-xs font-semibold gap-2 transition-colors cursor-pointer border shadow-xs ${
            isLive
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20"
              : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {isLive ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.75)]"></span>
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
          )}
          <span>
            {isLive
              ? t("platformCommandCenter.liveStreaming") || "Live · 30s"
              : t("platformCommandCenter.livePaused") || "Paused"}
          </span>
          {isRefreshing && <RotateCw className="h-3 w-3 text-emerald-500 animate-spin ml-0.5" />}
        </Button>

        {/* Customize Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCustomize}
          className="h-9 px-3 text-xs font-semibold gap-2 border-border bg-card hover:bg-accent text-foreground shadow-xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{t("platformCommandCenter.customize") || "Customize"}</span>
        </Button>
      </div>
    </div>
  );
}
