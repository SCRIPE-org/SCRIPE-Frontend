"use client";

/**
 * Threat Summary Cards
 *
 * Displays KPI-style cards for security threat categories.
 * Each figure renders through the shared StatCard; the error and empty
 * branches ride the shared ErrorMessage/EmptyState anatomies.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { ShieldAlert, Lock, Ban, KeyRound } from "lucide-react";

interface ThreatCard {
  type: string;
  count: number;
}

interface Props {
  data: ThreatCard[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  cardClasses?: string;
}

const THREAT_ICONS: Record<
  string,
  { icon: typeof ShieldAlert; tone: StatTone; labelKey: string }
> = {
  LoginFailed: {
    icon: ShieldAlert,
    tone: "danger",
    labelKey: "security.threats.failedLogins",
  },
  AccountLocked: {
    icon: Lock,
    tone: "warning",
    labelKey: "security.threats.accountLockouts",
  },
  AccessDenied: {
    icon: Ban,
    tone: "warning",
    labelKey: "security.threats.accessDenied",
  },
  PrivilegeEscalation: {
    icon: KeyRound,
    tone: "info",
    labelKey: "security.threats.privilegeEscalation",
  },
};

/**
 * Exported constant defining parameters and fields for threat summary cards configurations.
 */
export const ThreatSummaryCards = memo(function ThreatSummaryCards({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
}: Props) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
        role="status"
        aria-label={t("common.loading")}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} isLoading label="" value="" className={cardClasses} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage size="sm" message={t("common.error")} onRetry={onRetry} />;
  }

  if (data.length === 0) {
    return <EmptyState size="sm" icon={ShieldAlert} title={t("security.noEvents")} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-live="polite">
      {data.map((threat) => {
        const config = THREAT_ICONS[threat.type] ?? {
          icon: ShieldAlert,
          tone: "neutral" as StatTone,
          labelKey: threat.type,
        };

        return (
          <StatCard
            key={threat.type}
            label={t(config.labelKey)}
            value={threat.count.toLocaleString()}
            icon={config.icon}
            tone={config.tone}
            className={cardClasses}
          />
        );
      })}
    </div>
  );
});
