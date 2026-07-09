"use client";

import { Card, CardContent } from "@core/ui/card";
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock, Zap } from "lucide-react";
import type { ApiKeyStats } from "../../domain/entities/ApiKeyStats";
import { useI18n } from "@core/providers/i18n-provider";

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
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className={`rounded-lg p-1.5 ${colorClass ?? "bg-muted"}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function ApiKeyStatsCards({ stats, isLoading }: ApiKeyStatsCardsProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="pt-5 pb-4 px-5 h-24 animate-pulse bg-muted/30" /></Card>
        ))}
      </div>
    );
  }

  const successColor = stats.successRateColor === "green"
    ? "bg-emerald-500/10 text-emerald-600"
    : stats.successRateColor === "yellow"
      ? "bg-amber-500/10 text-amber-600"
      : "bg-red-500/10 text-red-600";

  const quotaColor = stats.quotaStatusColor === "green"
    ? "bg-emerald-500/10 text-emerald-600"
    : stats.quotaStatusColor === "yellow"
      ? "bg-amber-500/10 text-amber-600"
      : "bg-red-500/10 text-red-600";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label={t("apikeys.stats.totalHits") || "Total Hits"}
        value={stats.totalHits.toLocaleString()}
        icon={Zap}
        colorClass="bg-blue-500/10 text-blue-600"
        sub={<span>{stats.currentMinuteHits} {t("apikeys.stats.thisMinute") || "this minute"}</span>}
      />
      <StatCard
        label={t("apikeys.stats.successRate") || "Success Rate"}
        value={`${stats.successRatePercent}%`}
        icon={stats.successRatePercent >= 95 ? CheckCircle2 : AlertTriangle}
        colorClass={successColor}
        sub={
          <span>
            {stats.totalSuccessHits.toLocaleString()} {t("apikeys.stats.successful") || "successful"} /{" "}
            {stats.totalFailureHits.toLocaleString()} {t("apikeys.stats.failed") || "failed"}
          </span>
        }
      />
      <StatCard
        label={t("apikeys.stats.monthlyQuota") || "Monthly Quota"}
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
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.quotaStatusColor === "red" ? "bg-red-500" :
                    stats.quotaStatusColor === "yellow" ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(stats.monthlyQuotaUsedPercent, 100)}%` }}
                />
              </div>
              <span>{stats.monthlyQuotaUsedPercent.toFixed(1)}%</span>
            </div>
          ) : <span>{t("apikeys.stats.noLimit") || "No monthly limit set"}</span>
        }
      />
      <StatCard
        label={t("apikeys.stats.avgResponse") || "Avg Response"}
        value={`${stats.avgResponseTimeMs.toFixed(1)} ms`}
        icon={Clock}
        colorClass="bg-purple-500/10 text-purple-600"
        sub={
          <span>
            {t("apikeys.stats.rateLimit") || "Rate limit"}: {stats.currentMinuteHits}/{stats.effectiveRateLimitPerMinute} {t("apikeys.stats.perMin") || "/min"}
          </span>
        }
      />
    </div>
  );
}
