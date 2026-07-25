/**
 * WebhookHealthDashboard
 *
 * System-wide webhook health overview cards.
 * Shows endpoint status, 24h delivery metrics, DLQ/retry counts.
 * Used on the main webhooks list page above the table.
 *
 * Every figure here is a single point-in-time count, not a series — there is
 * no time-series data on WebhookHealthSummary to plot, so the KPI row
 * composes StatCard (the single KPI surface, `@core/ui/stat-card`) exactly
 * like WebhookStatsCards does, rather than standing up a chart with nothing
 * to chart.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import type { WebhookHealthSummary } from "../../domain/entities/Webhook";
import { Radio, AlertTriangle, TrendingUp, Skull, RefreshCw, Activity } from "lucide-react";

interface WebhookHealthDashboardProps {
  summary: WebhookHealthSummary | null;
  isLoading: boolean;
}

const GRID_CLASS = "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5";

/**
 * Presentation UI component rendering the webhook health dashboard.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function WebhookHealthDashboard({ summary, isLoading }: WebhookHealthDashboardProps) {
  const { t } = useI18n();

  if (isLoading) {
    const loadingLabels = [
      t("webhooks.health.endpoints"),
      t("webhooks.health.successRate"),
      t("webhooks.health.last24h"),
      t("webhooks.health.deadLettered"),
      t("webhooks.health.retrying"),
    ];

    return (
      <div className={GRID_CLASS}>
        {/* Same grid, same count, loading StatCards — the layout never
            resettles when the real figures land. */}
        {loadingLabels.map((label) => (
          <StatCard key={label} isLoading label={label} value="" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const successTone: StatTone =
    summary.systemSuccessRate >= 95
      ? "success"
      : summary.systemSuccessRate >= 80
        ? "warning"
        : "danger";

  return (
    <div className="space-y-2">
      {/* Alert banner for auto-disabled endpoints */}
      {summary.autoDisabledEndpoints > 0 && (
        <Alert variant="warning">
          <AlertTriangle aria-hidden="true" />
          <AlertDescription>
            <span className="font-medium text-nx-ink">{summary.autoDisabledEndpoints}</span>{" "}
            {summary.autoDisabledEndpoints === 1
              ? t("webhooks.health.endpointAutoDisabled")
              : t("webhooks.health.endpointsAutoDisabled")}
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className={GRID_CLASS}>
        <StatCard
          label={t("webhooks.health.endpoints")}
          value={`${summary.activeEndpoints}`}
          subtitle={t("webhooks.health.disabledCount", { count: summary.disabledEndpoints })}
          icon={Radio}
          tone="info"
        />
        <StatCard
          label={t("webhooks.health.successRate")}
          value={summary.last24hTotal > 0 ? `${summary.systemSuccessRate.toFixed(1)}%` : "—"}
          subtitle={t("webhooks.health.system")}
          icon={TrendingUp}
          tone={successTone}
        />
        <StatCard
          label={t("webhooks.health.last24h")}
          value={summary.last24hTotal.toLocaleString()}
          subtitle={t("webhooks.health.deliveredFailedBreakdown", {
            delivered: summary.last24hDelivered,
            failed: summary.last24hFailed,
          })}
          icon={Activity}
          tone="info"
        />
        <StatCard
          label={t("webhooks.health.deadLettered")}
          value={summary.totalDeadLettered.toLocaleString()}
          subtitle={
            summary.totalDeadLettered > 0
              ? t("webhooks.health.needsAttention")
              : t("webhooks.health.allClear")
          }
          icon={Skull}
          tone={summary.totalDeadLettered > 0 ? "danger" : "success"}
        />
        <StatCard
          label={t("webhooks.health.retrying")}
          value={summary.totalRetrying.toLocaleString()}
          subtitle={
            summary.avgLatencyMs > 0
              ? t("webhooks.health.avgLatency", { ms: summary.avgLatencyMs.toFixed(0) })
              : t("webhooks.health.idle")
          }
          icon={RefreshCw}
          tone={summary.totalRetrying > 0 ? "warning" : "neutral"}
        />
      </div>
    </div>
  );
}
