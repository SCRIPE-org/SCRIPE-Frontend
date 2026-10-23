"use client";

import React from "react";
import { Download, Radio, RotateCw, ShieldCheck } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import type { SignalRConnectionState } from "@core/hooks/useSignalR";

interface AuditHeaderProps {
  isPlatform: boolean;
  activeTenantName?: string | null;
  connectionState: SignalRConnectionState;
  realtimeEventCount: number;
  isRefetching: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

const connectionStyles: Record<
  SignalRConnectionState,
  { dot: string; pulse: string; text: string }
> = {
  connected: {
    dot: "bg-success",
    pulse: "animate-ping bg-success/80 opacity-75",
    text: "text-success",
  },
  connecting: {
    dot: "bg-warning",
    pulse: "animate-pulse bg-warning/80 opacity-75",
    text: "text-warning",
  },
  reconnecting: {
    dot: "bg-warning",
    pulse: "animate-pulse bg-warning/80 opacity-75",
    text: "text-warning",
  },
  disconnected: {
    dot: "bg-destructive",
    pulse: "",
    text: "text-destructive",
  },
};

/**
 * AuditHeader
 */
export function AuditHeader({
  isPlatform,
  activeTenantName,
  connectionState,
  realtimeEventCount,
  isRefetching,
  onRefresh,
  onExport,
}: AuditHeaderProps) {
  const { t } = useI18n();

  const title = isPlatform
    ? t("audit.header.platformTitle") || "Platform Audit Console"
    : t("audit.header.tenantTitle") || "Audit & Governance Log";

  const subtitle = isPlatform
    ? t("audit.header.platformSubtitle") ||
      "Comprehensive platform event stream, access verification, and cross-tenant compliance records."
    : t("audit.header.tenantSubtitle") ||
      `Recorded administrative mutations, security authentications, and governance records for ${
        activeTenantName || "this organization"
      }.`;

  const conn = connectionStyles[connectionState];

  return (
    <header className="flex flex-col gap-4 border-b border-nx-line pb-5 lg:flex-row lg:items-end lg:justify-between">
      {/* Page Title & Breadcrumb context */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {t("audit.header.eyebrow") || "MONITORING"}
          </p>
          <span className="text-xs text-nx-ink-3/60">•</span>
          <span className="text-xs font-medium text-nx-ink-3">
            {isPlatform ? t("audit.badges.platformScope") || "Global Scope" : activeTenantName}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-nx-ink sm:text-3xl">
            {title}
          </h1>
          <Badge
            variant="outline"
            className="hidden items-center gap-1 border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:inline-flex"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {isPlatform ? "Platform" : "Tenant"}
          </Badge>
        </div>

        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-nx-ink-3 sm:text-sm">
          {subtitle}
        </p>
      </div>

      {/* Action Controls & Realtime Status */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Real-time Connection Badge */}
        <div className="flex items-center gap-2 rounded-md border border-nx-line bg-nx-surface px-2.5 py-1.5 text-xs font-medium text-nx-ink">
          <span className="relative flex h-2 w-2">
            {conn.pulse && (
              <span className={`absolute inline-flex h-full w-full rounded-full ${conn.pulse}`} />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${conn.dot}`} />
          </span>
          <Radio className={`h-3.5 w-3.5 ${conn.text}`} />
          <span className="text-xs">{t(`audit.realtime.${connectionState}`)}</span>
          {realtimeEventCount > 0 && (
            <Badge
              variant="secondary"
              className="h-4.5 bg-nx-raised px-1.5 font-mono text-[10px] tabular-nums text-nx-ink-2"
            >
              +{realtimeEventCount}
            </Badge>
          )}
        </div>

        {/* Refresh Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefetching}
          className="h-8.5 cursor-pointer gap-1.5 border-nx-line bg-nx-surface px-3 text-xs font-semibold text-nx-ink hover:bg-nx-raised"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">
            {isRefetching
              ? t("audit.header.refreshing") || "Syncing..."
              : t("audit.header.refresh") || "Refresh"}
          </span>
        </Button>

        {/* Export Button (Primary Lime Accent with INK ON LIME contrast) */}
        <Button
          type="button"
          size="sm"
          onClick={onExport}
          className="h-8.5 cursor-pointer gap-1.5 bg-primary px-3.5 text-xs font-bold text-nx-on-fill hover:bg-primary/90"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{t("audit.export.button") || "Export"}</span>
        </Button>
      </div>
    </header>
  );
}
