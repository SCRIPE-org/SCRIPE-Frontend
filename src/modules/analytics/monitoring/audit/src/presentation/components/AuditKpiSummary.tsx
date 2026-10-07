"use client";

import React from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Database,
  Layers,
  Server,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Badge } from "@core/ui/badge";

interface AuditKpis {
  totalEvents: number;
  todayActionCount: number;
  yesterdayActionCount: number;
  todayTrendPercentage: number;
  todayModuleCount: number;
  failedEventsCount: number;
}

interface AuditKpiSummaryProps {
  kpis: AuditKpis;
  isLoading: boolean;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function AuditKpiSummary({
  kpis,
  isLoading,
  hasActiveFilters,
  activeFilterCount,
}: AuditKpiSummaryProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/80 bg-card p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-7 w-20" />
            <Skeleton className="mt-2 h-3.5 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  const isTrendPositive = kpis.todayTrendPercentage >= 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Audit Events */}
      <Card className="border-border/80 bg-card/90 hover:border-border transition-colors shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("audit.kpis.totalEvents") || "Total Events"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
              {kpis.totalEvents.toLocaleString()}
            </span>
            {hasActiveFilters && (
              <Badge
                variant="outline"
                className="text-[10px] font-medium border-primary/40 text-primary bg-primary/5 px-1.5 py-0"
              >
                {activeFilterCount}{" "}
                {t("audit.kpis.activeFilters") || (activeFilterCount === 1 ? "filter" : "filters")}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasActiveFilters
              ? t("audit.kpis.matchedEvents") || "Matching active filter criteria"
              : t("audit.kpis.allAuditTrail") || "Total indexed platform trail"}
          </p>
        </CardContent>
      </Card>

      {/* 2. Today's Activity & Velocity */}
      <Card className="border-border/80 bg-card/90 hover:border-border transition-colors shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("audit.kpis.todayActivity") || "Today's Activity"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
              {kpis.todayActionCount.toLocaleString()}
            </span>
            {kpis.yesterdayActionCount > 0 && (
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  isTrendPositive ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {isTrendPositive ? (
                  <ArrowUpRight className="h-3 w-3 me-0.5" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 me-0.5" />
                )}
                {Math.abs(kpis.todayTrendPercentage)}%
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {kpis.yesterdayActionCount > 0
              ? `${kpis.yesterdayActionCount.toLocaleString()} ${t("audit.kpis.yesterday") || "yesterday"}`
              : t("audit.kpis.eventsLoggedToday") || "Audit events recorded today"}
          </p>
        </CardContent>
      </Card>

      {/* 3. Intercepted / Failed Actions */}
      <Card className="border-border/80 bg-card/90 hover:border-border transition-colors shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("audit.kpis.failedActions") || "Failed / Intercepted"}
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                kpis.failedEventsCount > 0
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {kpis.failedEventsCount > 0 ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold tracking-tight tabular-nums ${
                kpis.failedEventsCount > 0 ? "text-rose-500" : "text-foreground"
              }`}
            >
              {kpis.failedEventsCount.toLocaleString()}
            </span>
            <Badge
              variant={kpis.failedEventsCount > 0 ? "destructive" : "secondary"}
              className="text-[10px] font-medium px-1.5 py-0"
            >
              {kpis.failedEventsCount > 0
                ? t("audit.kpis.attentionNeeded") || "Failed"
                : t("audit.kpis.clean") || "0 Errors"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("audit.kpis.failedSubtext") || "Security blocks, 4xx/5xx responses"}
          </p>
        </CardContent>
      </Card>

      {/* 4. Active Subsystems / Modules */}
      <Card className="border-border/80 bg-card/90 hover:border-border transition-colors shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("audit.kpis.activeServices") || "Active Services"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
              {kpis.todayModuleCount}
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              {t("audit.kpis.reporting") || "Reporting"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("audit.kpis.subsystemsLogged") || "Subsystems generating audit telemetry"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
