/**
 * WebhookStatsCards
 *
 * KPI cards showing Total / Successful / Failed deliveries + Success Rate.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import type { WebhookSubscription } from "../../domain/entities/Webhook";
import { Send, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface WebhookStatsCardsProps {
  webhook: WebhookSubscription;
}

/**
 * Presentation UI component rendering the webhook stats cards.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function WebhookStatsCards({ webhook }: WebhookStatsCardsProps) {
  const { t } = useI18n();

  const stats = [
    {
      label: t("webhooks.stats.total") || "Total Deliveries",
      value: webhook.totalDeliveries.toLocaleString(),
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: t("webhooks.stats.successful") || "Successful",
      value: webhook.successfulDeliveries.toLocaleString(),
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: t("webhooks.stats.failed") || "Failed",
      value: webhook.failedDeliveries.toLocaleString(),
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: t("webhooks.stats.successRate") || "Success Rate",
      value: webhook.totalDeliveries > 0 ? `${webhook.successRate.toFixed(1)}%` : "—",
      icon: TrendingUp,
      color:
        webhook.successRate >= 95
          ? "text-emerald-600 dark:text-emerald-400"
          : webhook.successRate >= 80
            ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400",
      bg:
        webhook.successRate >= 95
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : webhook.successRate >= 80
            ? "bg-amber-50 dark:bg-amber-950/30"
            : "bg-red-50 dark:bg-red-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
