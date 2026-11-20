"use client";

import { Card, CardContent, CardDescription, CardHeader } from "@core/ui/card";

/**
 * Server-computed API rate-limit & quota telemetry shape for the integrations strip.
 */
export interface IntegrationsRateLimitTelemetryItem {
  rateLimitingEnabled: boolean;
  requestsPerMinuteLimit: number | null;
  configuredRequestsPerMinuteLimit: number | null;
  hourlyLimit: number | null;
  hourlyRequestsUsed: number;
  hourlyRemaining: number | null;
  dailyRequestsUsed: number;
  remainingQuotaPercentage: number | null;
}

/**
 * Plan-resolved Personal Access Token quota summary from backend telemetry.
 */
export interface IntegrationsPatQuotaItem {
  activeCount: number;
  maxLimit: number;
  isUnlimited: boolean;
  remaining: number | null;
  isEnabled: boolean;
}

/**
 * Props for IntegrationsTelemetryStrip.
 */
export interface IntegrationsTelemetryStripProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  rateLimitTelemetry?: IntegrationsRateLimitTelemetryItem | null;
  patQuota?: IntegrationsPatQuotaItem | null;
  activeTokensCount: number;
  cidrEnforcedCount: number;
  trustedCidrsCount?: number;
  currentClientIp: string | null | undefined;
}

/**
 * Displays live API request rate limits (only when enabled), active PAT counts/quotas,
 * and caller IP perimeter telemetry.
 */
export function IntegrationsTelemetryStrip({
  t,
  rateLimitTelemetry,
  patQuota,
  activeTokensCount,
  cidrEnforcedCount,
  trustedCidrsCount,
  currentClientIp,
}: IntegrationsTelemetryStripProps) {
  const showRateLimitCard = rateLimitTelemetry?.rateLimitingEnabled === true;
  const showPatCard = !patQuota || patQuota.isEnabled !== false;
  const isHourlyLimited = Boolean(
    showRateLimitCard &&
      rateLimitTelemetry?.hourlyLimit != null &&
      rateLimitTelemetry?.hourlyRemaining != null
  );

  const remainingPct =
    rateLimitTelemetry?.remainingQuotaPercentage ??
    (rateLimitTelemetry?.hourlyLimit &&
    rateLimitTelemetry.hourlyLimit > 0 &&
    rateLimitTelemetry.hourlyRemaining != null
      ? Math.round((rateLimitTelemetry.hourlyRemaining / rateLimitTelemetry.hourlyLimit) * 1000) / 10
      : null);

  const patQuotaRemaining =
    patQuota && !patQuota.isUnlimited
      ? (patQuota.remaining ?? Math.max(0, patQuota.maxLimit - patQuota.activeCount))
      : null;

  const patQuotaHint = (() => {
    if (patQuota && !patQuota.isUnlimited) {
      if ((patQuotaRemaining ?? 0) <= 0) {
        return t("profile.integrations.patQuotaExhaustedSummary", {
          max: patQuota.maxLimit,
          cidrCount: cidrEnforcedCount,
        });
      }
      return t("profile.integrations.patQuotaRemainingSummary", {
        remaining: patQuotaRemaining ?? 0,
        max: patQuota.maxLimit,
        cidrCount: cidrEnforcedCount,
      });
    }
    if (patQuota?.isUnlimited) {
      return t("profile.integrations.patQuotaUnlimitedSummary", { cidrCount: cidrEnforcedCount });
    }
    return t("profile.integrations.cidrRestrictedSummary", { count: cidrEnforcedCount });
  })();

  const visibleCount = (showRateLimitCard ? 1 : 0) + (showPatCard ? 1 : 0) + 1;
  const gridClass =
    visibleCount >= 3
      ? "grid grid-cols-1 md:grid-cols-3 gap-4"
      : visibleCount === 2
        ? "grid grid-cols-1 md:grid-cols-2 gap-4"
        : "grid grid-cols-1 gap-4";

  return (
    <div className={gridClass}>
      {showRateLimitCard && rateLimitTelemetry && (
        <Card
          data-testid="integrations-rate-limit-card"
          className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("profile.integrations.rateLimitWindowLabel")}
            </CardDescription>
            <p
              data-testid="integrations-rate-limit-value"
              className="text-2xl font-bold font-mono text-nx-ink"
            >
              {isHourlyLimited ? (
                <bdi dir="ltr">
                  {`${(rateLimitTelemetry.hourlyRemaining ?? 0).toLocaleString()} / ${(rateLimitTelemetry.hourlyLimit ?? 0).toLocaleString()}`}
                </bdi>
              ) : (
                t("profile.integrations.rateLimitHourlyUsedValue", {
                  count: rateLimitTelemetry.hourlyRequestsUsed,
                })
              )}
            </p>
          </CardHeader>
          <CardContent
            data-testid="integrations-rate-limit-hint"
            className="text-xs text-nx-ink-2"
          >
            {t("profile.integrations.rateLimitActiveSummary", {
              pct: remainingPct ?? 100,
              rpm: rateLimitTelemetry.requestsPerMinuteLimit ?? 0,
              dailyUsed: rateLimitTelemetry.dailyRequestsUsed,
            })}
          </CardContent>
        </Card>
      )}

      {showPatCard && (
        <Card
          data-testid="integrations-active-pats-card"
          className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("profile.integrations.activePatsCountLabel")}
            </CardDescription>
            <p
              data-testid="integrations-active-pats-value"
              className="text-2xl font-bold font-mono text-nx-accent"
            >
              {patQuota && !patQuota.isUnlimited ? (
                <bdi dir="ltr">{`${patQuota.activeCount} / ${patQuota.maxLimit}`}</bdi>
              ) : (
                (patQuota?.activeCount ?? activeTokensCount)
              )}
            </p>
          </CardHeader>
          <CardContent data-testid="integrations-pat-quota-hint" className="text-xs text-nx-ink-2">
            {patQuotaHint}
          </CardContent>
        </Card>
      )}

      <Card
        data-testid="integrations-cidr-perimeter-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-2">
          <CardDescription className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("profile.integrations.lastCallerIpLabel")}
          </CardDescription>
          <p className="text-lg font-bold font-mono text-nx-ink break-all">
            {currentClientIp || "—"}
          </p>
        </CardHeader>
        <CardContent
          data-testid="integrations-cidr-perimeter-hint"
          className="text-xs text-nx-ink-3"
        >
          {(trustedCidrsCount ?? 0) > 0 || cidrEnforcedCount > 0
            ? t("profile.integrations.cidrPerimeterActiveSummary", {
                trustedCount: trustedCidrsCount ?? 0,
                patCount: cidrEnforcedCount,
              })
            : t("profile.integrations.cidrPerimeterInactive")}
        </CardContent>
      </Card>
    </div>
  );
}
