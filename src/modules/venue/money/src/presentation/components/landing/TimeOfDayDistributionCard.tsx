"use client";

import { Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import type { MoneyTimeOfDayBucket } from "../../../domain/entities/Money";
import { formatMoney } from "./moneyLandingFormatters";

interface TimeOfDayDistributionCardProps {
  timeOfDayBuckets: MoneyTimeOfDayBucket[];
  loading: boolean;
  error: string | null;
}

/**
 * Hourly demand and commercial revenue distribution card for MoneyLandingView.
 */
export function TimeOfDayDistributionCard({
  timeOfDayBuckets,
  loading,
  error,
}: TimeOfDayDistributionCardProps) {
  const { t, language } = useI18n();
  const maxSlot =
    timeOfDayBuckets.length > 0
      ? Math.max(...timeOfDayBuckets.map((s) => s.commercialValue), 1)
      : 1;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between border-b border-nx-line px-4 py-3">
          <div>
            <CardTitle className="text-xs font-bold text-nx-ink">
              {t("money.landing.byTime.title")}
            </CardTitle>
            <CardDescription className="mt-0.5 text-[11px] text-nx-ink-3">
              {t("money.landing.byTime.subtitle")}
            </CardDescription>
          </div>
          <Clock className="size-3.5 text-nx-ink-3" aria-hidden="true" />
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <LoadingSpinner showText={false} />
            </div>
          ) : error ? (
            <div className="py-6 text-center text-xs text-nx-ink-3">{error}</div>
          ) : timeOfDayBuckets.length === 0 ? (
            <div className="py-8 text-center text-xs italic text-nx-ink-3">
              {t("money.landing.byTime.noData")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {timeOfDayBuckets.slice(0, 8).map((slot) => {
                const pct = Math.round((slot.commercialValue / maxSlot) * 100);
                return (
                  <div
                    key={slot.timeWindow}
                    className="rounded-nx-sm border border-nx-line bg-nx-raised p-2 text-center"
                  >
                    <p className="font-mono text-[11px] font-semibold text-nx-ink">
                      {slot.timeWindow}
                    </p>
                    <p className="mt-1 font-mono text-xs font-bold text-nx-ink">
                      {formatMoney(slot.commercialValue, slot.currencyCode, language)}
                    </p>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-nx-raised-2">
                      <div className="h-1 rounded-full bg-info" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[9px] text-nx-ink-3">
                      {t("money.landing.byTime.bookingsCount", { count: slot.bookingCount })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
