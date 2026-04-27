"use client";
/**
 * LtvTab — Lifetime Value by Edition comparison.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import type { LtvResponse } from "../../domain/entities/AnalyticsEntities";

interface LtvTabProps {
  ltvData: LtvResponse;
}

function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export function LtvTab({ ltvData }: LtvTabProps) {
  const { t } = useI18n();
  const maxLtv = Math.max(...ltvData.editions.map((e) => e.averageLtv), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("entitlements.analytics.ltv.title")}</h2>
        <Badge variant="outline" className="text-xs">
          {t("entitlements.analytics.ltv.platformAvg")}: {formatCurrency(ltvData.platformAverageLtv, ltvData.currency)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ltvData.editions.map((edition) => {
          const barWidth = (edition.averageLtv / maxLtv) * 100;
          return (
            <Card key={edition.editionId} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>{edition.editionName}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {t("entitlements.analytics.ltv.subscribers", { count: edition.subscriberCount })}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* LTV Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{t("entitlements.analytics.ltv.avgLtv")}</span>
                    <span className="font-semibold">{formatCurrency(edition.averageLtv, edition.currency)}</span>
                  </div>
                  <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{t("entitlements.analytics.ltv.median")}</p>
                    <p className="text-xs font-semibold">{formatCurrency(edition.medianLtv, edition.currency)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{t("entitlements.analytics.ltv.avgLifespan")}</p>
                    <p className="text-xs font-semibold">{edition.avgLifespanMonths.toFixed(1)}mo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{t("entitlements.analytics.ltv.arpuMonth")}</p>
                    <p className="text-xs font-semibold">{formatCurrency(edition.avgMonthlyRevenue, edition.currency)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {ltvData.editions.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          {t("entitlements.analytics.ltv.noData")}
        </div>
      )}
    </div>
  );
}
