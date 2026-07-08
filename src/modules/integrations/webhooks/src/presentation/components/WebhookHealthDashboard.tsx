/**
 * WebhookHealthDashboard
 *
 * System-wide webhook health overview cards.
 * Shows endpoint status, 24h delivery metrics, DLQ/retry counts.
 * Used on the main webhooks list page above the table.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import type { WebhookHealthSummary } from "../../domain/entities/Webhook";
import { Radio, AlertTriangle, TrendingUp, Skull, RefreshCw, Activity } from "lucide-react";

interface WebhookHealthDashboardProps {
  summary: WebhookHealthSummary | null;
  isLoading: boolean;
}

/**
 * Presentation UI component rendering the webhook health dashboard.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function WebhookHealthDashboard({ summary, isLoading }: WebhookHealthDashboardProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      label: t("webhooks.health.endpoints") || "Endpoints",
      value: `${summary.activeEndpoints}`,
      sub: `${summary.disabledEndpoints} disabled`,
      icon: Radio,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: t("webhooks.health.successRate") || "Success Rate",
      value: summary.last24hTotal > 0 ? `${summary.systemSuccessRate.toFixed(1)}%` : "—",
      sub: t("webhooks.health.system") || "System-wide",
      icon: TrendingUp,
      color:
        summary.systemSuccessRate >= 95
          ? "text-emerald-600 dark:text-emerald-400"
          : summary.systemSuccessRate >= 80
            ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400",
      bg:
        summary.systemSuccessRate >= 95
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : summary.systemSuccessRate >= 80
            ? "bg-amber-50 dark:bg-amber-950/30"
            : "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: t("webhooks.health.last24h") || "Last 24h",
      value: summary.last24hTotal.toLocaleString(),
      sub: `${summary.last24hDelivered} ✓ · ${summary.last24hFailed} ✗`,
      icon: Activity,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: t("webhooks.health.deadLettered") || "Dead Letters",
      value: summary.totalDeadLettered.toLocaleString(),
      sub:
        summary.totalDeadLettered > 0
          ? t("webhooks.health.needsAttention") || "Needs attention"
          : t("webhooks.health.allClear") || "All clear",
      icon: Skull,
      color:
        summary.totalDeadLettered > 0
          ? "text-red-600 dark:text-red-400"
          : "text-emerald-600 dark:text-emerald-400",
      bg:
        summary.totalDeadLettered > 0
          ? "bg-red-50 dark:bg-red-950/30"
          : "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: t("webhooks.health.retrying") || "Retrying",
      value: summary.totalRetrying.toLocaleString(),
      sub:
        summary.avgLatencyMs > 0
          ? `~${summary.avgLatencyMs.toFixed(0)}ms avg`
          : t("webhooks.health.idle") || "Idle",
      icon: RefreshCw,
      color:
        summary.totalRetrying > 0
          ? "text-amber-600 dark:text-amber-400"
          : "text-zinc-500 dark:text-zinc-400",
      bg:
        summary.totalRetrying > 0
          ? "bg-amber-50 dark:bg-amber-950/30"
          : "bg-zinc-50 dark:bg-zinc-800/30",
    },
  ];

  return (
    <div className="space-y-2">
      {/* Alert banner for auto-disabled endpoints */}
      {summary.autoDisabledEndpoints > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-medium">{summary.autoDisabledEndpoints}</span>{" "}
            {summary.autoDisabledEndpoints === 1
              ? t("webhooks.health.endpointAutoDisabled") ||
                "endpoint was auto-disabled due to consecutive failures"
              : t("webhooks.health.endpointsAutoDisabled") ||
                "endpoints were auto-disabled due to consecutive failures"}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="overflow-hidden border-border/50">
            <CardContent className="p-3.5">
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${card.bg} shrink-0`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xl font-bold leading-none tracking-tight">{card.value}</p>
                  <p className="truncate text-[11px] leading-tight text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="truncate text-[10px] leading-tight text-muted-foreground/70">
                    {card.sub}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
