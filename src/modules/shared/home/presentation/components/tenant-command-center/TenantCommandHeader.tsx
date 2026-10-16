"use client";

import React from "react";
import { Sparkles, RotateCw, Building2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { usePresentationMode } from "../../viewmodels/usePresentationMode";

interface TenantCommandHeaderProps {
  tenantName: string;
  isImpersonating?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TenantCommandHeader({
  tenantName,
  isImpersonating = false,
  onRefresh,
  isRefreshing = false,
}: TenantCommandHeaderProps) {
  const { t } = useI18n();
  const { isPresentationMode, togglePresentationMode } = usePresentationMode();

  return (
    <div className="flex flex-col gap-3 border-b border-border/60 pb-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t("tenantCommandCenter.administration")}</span>
          <span className="rtl:rotate-180">›</span>
          <b className="text-foreground">{t("tenantCommandCenter.overview")}</b>
        </div>
        <div className="hidden h-3.5 w-px bg-border sm:block" />
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 bg-muted/40 px-2 py-0.5 text-xs font-semibold"
          >
            <Building2 className="h-3 w-3 text-primary" />
            <span>{tenantName}</span>
          </Badge>
          {isImpersonating && (
            <Badge variant="secondary" className="text-[10px]">
              {t("tenantCommandCenter.platformDrillDown")}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={togglePresentationMode}
          title={
            isPresentationMode
              ? t("tenantCommandCenter.switchToLiveTooltip") || "Switch to live backend telemetry"
              : t("tenantCommandCenter.switchToDemoTooltip") ||
                "Switch to presentation showcase mode"
          }
          className={`shadow-xs h-8 cursor-pointer gap-1.5 border px-2.5 text-xs font-semibold transition-colors ${
            isPresentationMode
              ? "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles
            className={`h-3 w-3 ${isPresentationMode ? "fill-amber-500/30 text-amber-500" : "text-muted-foreground"}`}
          />
          <span>
            {isPresentationMode
              ? t("tenantCommandCenter.demoMode")
              : t("tenantCommandCenter.liveData")}
          </span>
        </Button>

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            title={t("tenantCommandCenter.refreshTooltip") || "Refresh organization data"}
            className="h-8 w-8 rounded-lg border-border bg-card p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
