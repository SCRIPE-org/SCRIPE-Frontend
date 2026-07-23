/**
 * WebhookStatsCards
 *
 * KPI cards showing Total / Successful / Failed deliveries + Success Rate.
 * Composes the core StatCard — the single KPI surface — so tone maps to
 * semantic tokens and reads correctly in both themes and any tenant palette.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { StatCard, type StatTone } from "@core/ui/stat-card";
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

  const rateTone: StatTone =
    webhook.successRate >= 95 ? "success" : webhook.successRate >= 80 ? "warning" : "danger";

  const stats: { label: string; value: string; icon: typeof Send; tone: StatTone }[] = [
    {
      label: t("webhooks.stats.total") || "Total Deliveries",
      value: webhook.totalDeliveries.toLocaleString(),
      icon: Send,
      tone: "info",
    },
    {
      label: t("webhooks.stats.successful") || "Successful",
      value: webhook.successfulDeliveries.toLocaleString(),
      icon: CheckCircle2,
      tone: "success",
    },
    {
      label: t("webhooks.stats.failed") || "Failed",
      value: webhook.failedDeliveries.toLocaleString(),
      icon: XCircle,
      tone: "danger",
    },
    {
      label: t("webhooks.stats.successRate") || "Success Rate",
      value: webhook.totalDeliveries > 0 ? `${webhook.successRate.toFixed(1)}%` : "—",
      icon: TrendingUp,
      tone: rateTone,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          tone={stat.tone}
        />
      ))}
    </div>
  );
}
