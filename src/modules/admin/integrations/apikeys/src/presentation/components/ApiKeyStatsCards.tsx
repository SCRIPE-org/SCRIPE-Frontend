"use client";

import { Card, CardContent } from "@core/ui/card";
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock, Zap } from "lucide-react";
import type { ApiKeyStats } from "../../domain/entities/ApiKeyStats";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";

interface ApiKeyStatsCardsProps {
  stats: ApiKeyStats;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="px-5 pb-4 pt-5">
        <div className="mb-3 flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-nx-ink-3">
            {label}
          </p>
          <div className={`rounded-nx-sm p-1.5 ${colorClass ?? "bg-nx-raised"}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && <div className="mt-1 text-xs text-nx-ink-3">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function ApiKeyStatsCards({ stats, isLoading }: ApiKeyStatsCardsProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="px-5 pb-4 pt-5">
              <Skeleton shape="block" className="h-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const successColor =
    stats.successRateColor === "green"
      ? "bg-success/10 text-success"
      : stats.successRateColor === "yellow"
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";

  const quotaColor =
    stats.quotaStatusColor === "green"
      ? "bg-success/10 text-success"
      : stats.quotaStatusColor === "yellow"
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label={t("apikeys.stats.totalHits")}
        value={stats.totalHits.toLocaleString()}
        icon={Zap}
        colorClass="bg-info/10 text-info"
        sub={
          <span>
            {stats.currentMinuteHits} {t("apikeys.stats.thisMinute")}
          </span>
        }
      />
      <StatCard
        label={t("apikeys.stats.successRate")}
        value={`${stats.successRatePercent}%`}
        icon={stats.successRatePercent >= 95 ? CheckCircle2 : AlertTriangle}
        colorClass={successColor}
        sub={
          <span>
            {stats.totalSuccessHits.toLocaleString()} {t("apikeys.stats.successful")} /{" "}
            {stats.totalFailureHits.toLocaleString()} {t("apikeys.stats.failed")}
            {stats.blockedHits > 0 && (
              <span className="mt-0.5 block font-medium text-destructive sm:mt-0 sm:inline">
                {" "}
                ({stats.blockedHits.toLocaleString()} {t("apikeys.stats.blocked")})
              </span>
            )}
          </span>
        }
      />
      <StatCard
        label={t("apikeys.stats.monthlyQuota")}
        value={
          stats.monthlyQuota
            ? `${stats.currentMonthHits.toLocaleString()} / ${stats.monthlyQuota.toLocaleString()}`
            : "∞ Unlimited"
        }
        icon={stats.monthlyQuotaUsedPercent >= 80 ? TrendingUp : TrendingDown}
        colorClass={quotaColor}
        sub={
          stats.monthlyQuota ? (
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-nx-raised">
                <div
                  className={`h-full rounded-full transition-[width] duration-nx-standard ease-nx-enter motion-reduce:transition-none ${
                    stats.quotaStatusColor === "red"
                      ? "bg-destructive"
                      : stats.quotaStatusColor === "yellow"
                        ? "bg-warning"
                        : "bg-success"
                  }`}
                  style={{ width: `${Math.min(stats.monthlyQuotaUsedPercent, 100)}%` }}
                />
              </div>
              <span>{stats.monthlyQuotaUsedPercent.toFixed(1)}%</span>
            </div>
          ) : (
            <span>{t("apikeys.stats.noLimit")}</span>
          )
        }
      />
      <StatCard
        label={t("apikeys.stats.avgResponse")}
        value={`${stats.avgResponseTimeMs.toFixed(1)} ms`}
        icon={Clock}
        colorClass="bg-nx-accent-wash text-nx-accent"
        sub={
          <span>
            {t("apikeys.stats.rateLimit")}: {stats.currentMinuteHits}/
            {stats.effectiveRateLimitPerMinute} {t("apikeys.stats.perMin")}
          </span>
        }
      />
    </div>
  );
}
