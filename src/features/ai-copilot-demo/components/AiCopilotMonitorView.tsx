"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import {
  INITIAL_MONITOR_ALERTS,
  MONITOR_TELEMETRY,
} from "../mock-data/mode-views.data";
import type {
  MonitorAlertItem,
  MonitorSeverity,
  MonitorSeverityFilter,
} from "../types";

interface AiCopilotMonitorViewProps {
  severityFilter: MonitorSeverityFilter;
  onSeverityFilterChange: (filter: MonitorSeverityFilter) => void;
  acknowledgedAlertIds: string[];
  onToggleAcknowledge: (alertId: string) => void;
  onInvestigateAlert: (alert: MonitorAlertItem) => void;
  isMaxLayout?: boolean;
}

export function AiCopilotMonitorView({
  severityFilter,
  onSeverityFilterChange,
  acknowledgedAlertIds,
  onToggleAcknowledge,
  onInvestigateAlert,
  isMaxLayout = false,
}: AiCopilotMonitorViewProps) {
  const { tc } = useCopilotI18n();

  const enrichedAlerts = INITIAL_MONITOR_ALERTS.map((alert) => {
    const isAcked = acknowledgedAlertIds.includes(alert.id);
    const effectiveSeverity: MonitorSeverity = isAcked
      ? "resolved"
      : alert.baseSeverity;
    return {
      ...alert,
      isAcked,
      effectiveSeverity,
    };
  });

  const counts = {
    all: enrichedAlerts.length,
    critical: enrichedAlerts.filter((a) => a.effectiveSeverity === "critical").length,
    warning: enrichedAlerts.filter((a) => a.effectiveSeverity === "warning").length,
    resolved: enrichedAlerts.filter((a) => a.effectiveSeverity === "resolved").length,
  };

  const filteredAlerts =
    severityFilter === "all"
      ? enrichedAlerts
      : enrichedAlerts.filter((a) => a.effectiveSeverity === severityFilter);

  const filterPills: Array<{
    id: MonitorSeverityFilter;
    labelKey: string;
    count: number;
  }> = [
    { id: "all", labelKey: "monitorView.filterAll", count: counts.all },
    { id: "critical", labelKey: "monitorView.filterCritical", count: counts.critical },
    { id: "warning", labelKey: "monitorView.filterWarning", count: counts.warning },
    { id: "resolved", labelKey: "monitorView.filterResolved", count: counts.resolved },
  ];

  return (
    <div data-testid="copilot-monitor-view" className="space-y-4">
      {/* Radar Header */}
      <div className="rounded-nx-lg border border-nx-line bg-nx-raised p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-fill text-nx-on-fill">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-nx-ink">
                {tc("monitorView.radarTitle")}
              </h3>
              <p className="mt-0.5 text-xs text-nx-ink-2">
                {tc("monitorView.radarSubtitle")}
              </p>
            </div>
          </div>
          <Badge variant="accent" className="shrink-0 text-[10px]">
            {tc("modes.monitor.label")}
          </Badge>
        </div>

        {/* Live Telemetry Metrics */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {MONITOR_TELEMETRY.map((metric) => (
            <div
              key={metric.id}
              className="rounded-nx-md border border-nx-line bg-nx-surface p-2.5"
            >
              <p className="truncate text-[10px] font-medium text-nx-ink-3">
                {tc(metric.labelKey)}
              </p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-nx-ink">
                {metric.value}
              </p>
              <p className="truncate text-[10px] text-nx-ink-2">
                {tc(metric.subKey)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Severity Filter Pills */}
      <fieldset
        aria-label={tc("monitorView.radarTitle")}
        className="m-0 flex flex-wrap items-center gap-1.5 border-0 p-0"
      >
        {filterPills.map((pill) => {
          const isActive = severityFilter === pill.id;
          return (
            <Button
              key={pill.id}
              type="button"
              variant={isActive ? "secondary" : "outline"}
              size="sm"
              onClick={() => onSeverityFilterChange(pill.id)}
              data-testid={`monitor-filter-${pill.id}`}
              className={cn(
                "h-7 cursor-pointer gap-1.5 rounded-full px-2.5 text-[11px]",
                isActive && "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
              )}
            >
              <span>{tc(pill.labelKey)}</span>
              <span className="tabular-nums text-[10px] opacity-80">
                ({pill.count})
              </span>
            </Button>
          );
        })}
      </fieldset>

      {/* Interactive Alert Cards */}
      {filteredAlerts.length === 0 ? (
        <Card className="border-nx-line bg-nx-surface">
          <CardContent className="p-4 text-center text-xs text-nx-ink-3">
            {tc("monitorView.emptyFilter")}
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            "grid gap-2.5",
            isMaxLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}
        >
          {filteredAlerts.map((alert) => {
            const isCritical = alert.effectiveSeverity === "critical";
            const isResolved = alert.effectiveSeverity === "resolved";

            return (
              <Card
                key={alert.id}
                data-testid={`monitor-alert-card-${alert.id}`}
                className={cn(
                  "border-nx-line bg-nx-surface hover:border-nx-line-hi",
                  isCritical && "border-destructive/40 bg-destructive/5",
                  !isCritical && !isResolved && "border-warning-strong/30 bg-warning/5"
                )}
              >
                <CardContent className="space-y-2.5 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      {isResolved ? (
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-success"
                          aria-hidden="true"
                        />
                      ) : isCritical ? (
                        <ShieldAlert
                          className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                          aria-hidden="true"
                        />
                      ) : (
                        <AlertTriangle
                          className="mt-0.5 h-4 w-4 shrink-0 text-nx-warning-strong"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-nx-ink">
                          {tc(alert.titleKey)}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-nx-ink-2">
                          {tc(alert.descKey)}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        isResolved
                          ? "success"
                          : isCritical
                            ? "destructive"
                            : "warning"
                      }
                      className="shrink-0 text-[10px]"
                    >
                      {isResolved
                        ? tc("monitorView.filterResolved")
                        : isCritical
                          ? tc("monitorView.filterCritical")
                          : tc("monitorView.filterWarning")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-nx-ink-3">
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                        {tc(alert.moduleKey)}
                      </Badge>
                      <span className="tabular-nums">{alert.timestampLabel}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant={alert.isAcked ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onToggleAcknowledge(alert.id)}
                        data-testid={`monitor-ack-${alert.id}`}
                        className="h-7 cursor-pointer gap-1 px-2 text-[11px]"
                      >
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        <span>
                          {alert.isAcked
                            ? tc("monitorView.ackedBtn")
                            : tc("monitorView.ackBtn")}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onInvestigateAlert(alert)}
                        data-testid={`monitor-investigate-${alert.id}`}
                        className="h-7 cursor-pointer gap-1 px-2 text-[11px]"
                      >
                        <span>{tc("monitorView.investigateBtn")}</span>
                        <ArrowUpRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
