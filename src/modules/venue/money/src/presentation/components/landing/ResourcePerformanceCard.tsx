"use client";

import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import type { MoneyResourcePerformance } from "../../../domain/entities/Money";
import { formatMoney } from "./moneyLandingFormatters";

interface ResourcePerformanceCardProps {
  resourcePerformance: MoneyResourcePerformance[];
  loading: boolean;
  error: string | null;
}

/**
 * Court / Space commercial ranking card for MoneyLandingView.
 */
export function ResourcePerformanceCard({
  resourcePerformance,
  loading,
  error,
}: ResourcePerformanceCardProps) {
  const { t, language } = useI18n();

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between border-b border-nx-line px-4 py-3">
          <div>
            <CardTitle className="text-xs font-bold text-nx-ink">
              {t("money.landing.byCourt.title")}
            </CardTitle>
            <CardDescription className="mt-0.5 text-[11px] text-nx-ink-3">
              {t("money.landing.byCourt.subtitle")}
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {t("money.landing.byCourt.courtsCount", { count: resourcePerformance.length })}
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <LoadingSpinner showText={false} />
            </div>
          ) : error ? (
            <div className="py-6 text-center text-xs text-nx-ink-3">{error}</div>
          ) : resourcePerformance.length === 0 ? (
            <div className="py-8 text-center text-xs italic text-nx-ink-3">
              {t("money.landing.byCourt.noData")}
            </div>
          ) : (
            <div className="space-y-2">
              {resourcePerformance.slice(0, 5).map((r, i) => (
                <div
                  key={r.resourceId}
                  className="flex items-center justify-between rounded-nx-sm border border-nx-line bg-nx-raised p-2.5 text-xs transition-colors hover:border-nx-line-hi"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-nx-ink-3">#{i + 1}</span>
                    <div>
                      <p className="max-w-[140px] truncate font-semibold text-nx-ink">
                        {t("money.landing.byCourt.courtLabel", { id: r.resourceId.slice(0, 8) })}
                      </p>
                      <p className="text-[10px] text-nx-ink-3">
                        {t("money.landing.byCourt.activitySummary", {
                          invoices: r.invoiceCount,
                          payments: r.paymentCount,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="font-mono font-bold text-nx-ink">
                      {formatMoney(r.commercialValue, r.currencyCode, language)}
                    </p>
                    <p className="font-mono text-[10px] text-success">
                      {t("money.landing.byCourt.collectedValue", {
                        amount: formatMoney(r.collected, r.currencyCode, language),
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
