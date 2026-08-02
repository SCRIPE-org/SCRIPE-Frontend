// UI-EXCEPTION: compact studio layout
"use client";

/**
 * KPI Cards Section
 *
 * Displays key performance indicators in a responsive card grid.
 * Wrapped in React.memo since props change infrequently.
 *
 * Every figure renders through the shared StatCard, so the dashboard KPIs
 * carry the same anatomy, skeleton and tones as every other stat surface.
 * The M9 theme props (cardClasses/gridClasses) keep flowing through — the
 * grid stays themable, the card anatomy does not.
 */
import { memo } from "react";
import type { DashboardSummary } from "../../domain/entities/DashboardEntities";
import { useI18n } from "@core/providers/i18n-provider";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import { ErrorMessage } from "@core/ui/error-message";
import {
  Users,
  ShieldCheck,
  Building2,
  KeyRound,
  LogIn,
  ShieldAlert,
  DollarSign,
  CreditCard,
  Clock,
} from "lucide-react";
import { useConvertedAmount } from "@core/hooks/useConvertedAmount";

interface Props {
  data?: DashboardSummary;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  // M9: Theme props
  cardClasses?: string;
  gridClasses?: string;
  chartPalette?: string[];
}

interface KpiItem {
  key: keyof DashboardSummary;
  icon: typeof ShieldCheck;
  tone: StatTone;
  labelKey: string;
  secondaryKey?: keyof DashboardSummary;
  secondaryLabel?: string;
  format?: "currency";
}

const kpiConfig: KpiItem[] = [
  {
    key: "totalAdmins",
    icon: ShieldCheck,
    tone: "info",
    labelKey: "dashboard.kpi.totalAdmins",
    secondaryKey: "activeAdmins",
    secondaryLabel: "dashboard.kpi.active",
  },
  {
    key: "totalUsers",
    icon: Users,
    tone: "success",
    labelKey: "dashboard.kpi.totalUsers",
    secondaryKey: "activeUsers",
    secondaryLabel: "dashboard.kpi.active",
  },
  {
    key: "totalTenants",
    icon: Building2,
    tone: "info",
    labelKey: "dashboard.kpi.totalTenants",
  },
  {
    key: "totalRoles",
    icon: KeyRound,
    tone: "warning",
    labelKey: "dashboard.kpi.totalRoles",
  },
  {
    key: "loginsToday",
    icon: LogIn,
    tone: "success",
    labelKey: "dashboard.kpi.loginsToday",
  },
  {
    key: "failedLogins24h",
    icon: ShieldAlert,
    tone: "danger",
    labelKey: "dashboard.kpi.failedLogins",
  },
  {
    key: "totalMrrUsd",
    icon: DollarSign,
    tone: "success",
    labelKey: "dashboard.kpi.totalMrr",
    format: "currency",
  },
  {
    key: "totalActiveSubscriptions",
    icon: CreditCard,
    tone: "info",
    labelKey: "dashboard.kpi.activeSubscriptions",
  },
  {
    key: "trialSubscriptions",
    icon: Clock,
    tone: "warning",
    labelKey: "dashboard.kpi.trialSubscriptions",
  },
];

/**
 * Exported constant defining parameters and fields for k p i cards section configurations.
 */
export const KPICardsSection = memo(function KPICardsSection({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
  gridClasses,
}: Props) {
  const gridClass =
    gridClasses || "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  const { t } = useI18n();
  const { formatDisplay, getConversionTooltip, isConverting } = useConvertedAmount();

  if (isLoading) {
    return (
      <div className={gridClass} role="status" aria-label={t("common.loading")}>
        {kpiConfig.map((kpi) => (
          <StatCard key={kpi.key} isLoading label="" value="" className={cardClasses} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage size="sm" message={t("common.error")} onRetry={onRetry} />;
  }

  return (
    <div className={gridClass} aria-live="polite">
      {kpiConfig.map((kpi) => {
        const value = data?.[kpi.key] ?? 0;
        const secondary = kpi.secondaryKey ? data?.[kpi.secondaryKey] : undefined;
        // The former inline italic conversion note rides the StatCard tooltip
        // affordance instead of a bespoke text line.
        const conversionTip =
          kpi.format === "currency" && isConverting
            ? getConversionTooltip(Number(value), "USD") || undefined
            : undefined;

        return (
          <StatCard
            key={kpi.key}
            label={t(kpi.labelKey)}
            value={
              kpi.format === "currency"
                ? formatDisplay(Number(value), "USD")
                : Number(value).toLocaleString()
            }
            icon={kpi.icon}
            tone={kpi.tone}
            tooltip={conversionTip}
            subtitle={
              secondary !== undefined && kpi.secondaryLabel
                ? `${Number(secondary).toLocaleString()} ${t(kpi.secondaryLabel)}`
                : undefined
            }
            className={cardClasses}
          />
        );
      })}
    </div>
  );
});
