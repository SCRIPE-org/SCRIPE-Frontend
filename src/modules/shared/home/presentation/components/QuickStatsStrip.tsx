"use client";

/**
 * Quick Stats Strip
 *
 * Compact row of 4 KPI cards showing key system numbers.
 * Composes the core StatCard so the overview never draws a number itself —
 * loading renders StatCard's built-in skeleton (layout-stable), while
 * SectionState keeps the shared error anatomy and retry affordance.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { SectionState } from "@core/ui/section-state";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import { Users, Building2, Shield, LogIn, type LucideIcon } from "lucide-react";
import type { DashboardSummary } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";

interface Props {
  data?: DashboardSummary;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

interface StatEntry {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: StatTone;
}

export const QuickStatsStrip = memo(function QuickStatsStrip({
  data,
  isLoading,
  error,
  onRetry,
}: Props) {
  const { t } = useI18n();

  const stats: StatEntry[] = [
    {
      label: t("overview.stats.totalAdmins"),
      value: data?.totalAdmins ?? 0,
      icon: Shield,
      tone: "info",
    },
    {
      label: t("overview.stats.activeUsers"),
      value: data?.activeUsers ?? 0,
      icon: Users,
      tone: "success",
    },
    {
      label: t("overview.stats.activeTenants"),
      value: data?.activeTenants ?? 0,
      icon: Building2,
      tone: "neutral",
    },
    {
      label: t("overview.stats.loginsToday"),
      value: data?.loginsToday ?? 0,
      icon: LogIn,
      tone: "warning",
    },
  ];

  return (
    // isLoading stays false here on purpose: loading is drawn by the StatCards
    // themselves so the skeleton matches the rendered anatomy exactly.
    <SectionState isLoading={false} error={error} onRetry={onRetry} height={100}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value.toLocaleString()}
            icon={stat.icon}
            tone={stat.tone}
            isLoading={isLoading}
          />
        ))}
      </div>
    </SectionState>
  );
});
