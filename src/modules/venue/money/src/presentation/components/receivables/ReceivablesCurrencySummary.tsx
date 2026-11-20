"use client";

import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { cn } from "@core/common/utils";
import {
  formatReceivableMoney,
  type CurrencySummaryTotals,
} from "./receivablesFormatters";

interface ReceivablesCurrencySummaryProps {
  currencyTotals: Record<string, CurrencySummaryTotals>;
  filteredCount: number;
  totalCount: number;
  isPartial: boolean;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Multi-currency isolated KPI balance cards for the currently loaded receivables page.
 * Never sums amounts across different currencies.
 */
export function ReceivablesCurrencySummary({
  currencyTotals,
  filteredCount,
  totalCount,
  isPartial,
  language,
  t,
}: ReceivablesCurrencySummaryProps) {
  const currencyKeys = Object.keys(currencyTotals);
  if (currencyKeys.length === 0) return null;

  return (
    <section className="space-y-2" aria-label={t("money.receivables.pageSummaryTitle")}>
      <div className="flex items-center justify-between px-1 text-xs text-nx-ink-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {t("money.receivables.pageSummaryTitle")}
        </span>
        <span className="font-mono text-[11px] tabular-nums">
          {isPartial
            ? t("money.receivables.partialBadge", {
                filtered: filteredCount,
                total: totalCount,
              })
            : t("money.receivables.completeBadge", {
                total: totalCount,
              })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
        {currencyKeys.map((curr) => {
          const stats = currencyTotals[curr];
          if (!stats) return null;
          const isUnspecified = curr === "UNSPECIFIED";
          return (
            <Card
              key={curr}
              className={cn(
                "space-y-2.5 border-nx-line bg-nx-surface p-4 text-nx-ink hover:border-nx-line-hi",
                isUnspecified && "border-warning/30 bg-warning/10"
              )}
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant={isUnspecified ? "destructive" : "outline"}
                  className="px-2 py-0.5 font-mono text-xs font-bold"
                >
                  {isUnspecified ? t("money.receivables.unspecifiedCurrency") : curr}
                </Badge>
                <span className="text-[11px] tabular-nums text-nx-ink-3">
                  {stats.count} {t("money.receivables.invoicesCount")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-nx-line pt-2 text-center">
                <div>
                  <span className="block text-[10px] font-semibold uppercase text-nx-ink-3">
                    {t("money.receivables.total")}
                  </span>
                  <span className="font-mono text-xs font-bold tabular-nums text-nx-ink sm:text-sm">
                    {formatReceivableMoney(stats.total, curr, language)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase text-nx-ink-3">
                    {t("money.receivables.paid")}
                  </span>
                  <span className="font-mono text-xs font-bold tabular-nums text-success sm:text-sm">
                    {formatReceivableMoney(stats.paid, curr, language)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase text-nx-ink-3">
                    {t("money.receivables.outstanding")}
                  </span>
                  <span className="font-mono text-xs font-bold tabular-nums text-warning sm:text-sm">
                    {formatReceivableMoney(stats.outstanding, curr, language)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
