"use client";

import { BarChart3 } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import type { MoneyTrendBucket } from "../../../domain/entities/Money";
import { formatMoney, formatTrendBucketLabel } from "./moneyLandingFormatters";

interface RevenueTrendCardProps {
  trendBuckets: MoneyTrendBucket[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Commercial Value vs Collected time-series bar chart card.
 */
export function RevenueTrendCard({
  trendBuckets,
  loading,
  error,
  onRetry,
}: RevenueTrendCardProps) {
  const { t, language } = useI18n();
  const maxVal =
    trendBuckets.length > 0
      ? Math.max(...trendBuckets.map((b) => Math.max(b.commercialValue, b.collected, 1)))
      : 1;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-nx-line bg-nx-raised px-5 py-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-nx-ink">
            <BarChart3 className="size-4 text-nx-accent" aria-hidden="true" />
            <span>{t("money.landing.chart.title")}</span>
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-nx-ink-2">
            {t("money.landing.chart.subtitle")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-info" aria-hidden="true" />
            <span className="font-medium text-nx-ink-2">
              {t("money.landing.chart.commercialLegend")}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-success" aria-hidden="true" />
            <span className="font-medium text-nx-ink-2">
              {t("money.landing.chart.collectedLegend")}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <LoadingSpinner showText={false} />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-xs text-nx-ink-3">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry} className="h-7 text-xs">
              {t("money.retry")}
            </Button>
          </div>
        ) : trendBuckets.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-xs italic text-nx-ink-3">
            {t("money.landing.chart.noData")}
          </div>
        ) : (
          <div className="space-y-4">
            <figure
              aria-label={t("money.landing.chart.title")}
              className="m-0 flex h-52 w-full items-end gap-1.5 border-b border-nx-line px-2 pb-2 pt-6"
            >
              {trendBuckets.map((bucket, i) => {
                const commHeight = Math.max((bucket.commercialValue / maxVal) * 100, 2);
                const collHeight = Math.max((bucket.collected / maxVal) * 100, 2);
                const showLabel =
                  trendBuckets.length <= 10 || i % Math.ceil(trendBuckets.length / 8) === 0;

                return (
                  <div
                    key={`${bucket.bucketLabel}-${i}`}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="pointer-events-none absolute bottom-full z-popover mb-2 hidden flex-col whitespace-nowrap rounded-nx-sm border border-nx-line bg-nx-surface p-2 text-[10px] shadow-nx-popover group-hover:flex">
                      <span className="font-bold text-nx-ink">{bucket.bucketLabel}</span>
                      <span className="font-mono text-info">
                        {t("money.landing.chart.commercialLegend")}:{" "}
                        {formatMoney(bucket.commercialValue, bucket.currencyCode, language)}
                      </span>
                      <span className="font-mono text-success">
                        {t("money.landing.chart.collectedLegend")}:{" "}
                        {formatMoney(bucket.collected, bucket.currencyCode, language)}
                      </span>
                      {bucket.refunds > 0 && (
                        <span className="font-mono text-nx-ink-3">
                          {t("money.landing.chart.refundsLegend")}:{" "}
                          {formatMoney(bucket.refunds, bucket.currencyCode, language)}
                        </span>
                      )}
                    </div>

                    <div className="flex h-full w-full items-end justify-center gap-0.5">
                      <div
                        className="w-1/2 max-w-[12px] rounded-t-sm bg-info/80 transition-colors hover:bg-info"
                        style={{ height: `${commHeight}%` }}
                      />
                      <div
                        className="w-1/2 max-w-[12px] rounded-t-sm bg-success/80 transition-colors hover:bg-success"
                        style={{ height: `${collHeight}%` }}
                      />
                    </div>

                    {showLabel && (
                      <span className="mt-1 max-w-full truncate font-mono text-[9px] text-nx-ink-3">
                        {formatTrendBucketLabel(bucket.bucketLabel)}
                      </span>
                    )}
                  </div>
                );
              })}
            </figure>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
