"use client";
/**
 * LtvTab — Premium Lifetime Value by Edition comparison with ranked cards.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Crown, Medal, Award } from "lucide-react";
import type { LtvResponse } from "../../domain/entities/AnalyticsEntities";

interface LtvTabProps {
  ltvData: LtvResponse;
}

function formatCurrency(value: number, currency = "USD"): string {
  if (Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = [
  "from-amber-400 to-yellow-500",
  "from-slate-300 to-slate-400",
  "from-orange-400 to-amber-600",
];

/**
 * React presentation component representing the ltv tab UI element.
 */
export function LtvTab({ ltvData }: LtvTabProps) {
  const { t } = useI18n();
  const maxLtv = Math.max(...ltvData.editions.map((e) => e.averageLtv), 1);
  const sorted = [...ltvData.editions].sort((a, b) => b.averageLtv - a.averageLtv);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("entitlements.analytics.ltv.title")}</h2>
        <Badge variant="outline" className="gap-1 border-border/50 px-3 py-1 text-xs">
          {t("entitlements.analytics.ltv.platformAvg")}:{" "}
          <span className="font-bold">
            {formatCurrency(ltvData.platformAverageLtv, ltvData.currency)}
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sorted.map((edition, idx) => {
          const barWidth = (edition.averageLtv / maxLtv) * 100;
          const RankIcon = idx < 3 ? RANK_ICONS[idx] : null;
          const rankColor = idx < 3 ? RANK_COLORS[idx] : "";

          return (
            <Card
              key={edition.editionId}
              className="group overflow-hidden border border-border/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Top gradient accent */}
              <div
                className={`h-0.5 bg-gradient-to-r ${
                  idx === 0
                    ? "from-amber-400 to-yellow-500"
                    : idx === 1
                      ? "from-slate-300 to-slate-400"
                      : "from-emerald-400 to-teal-500"
                }`}
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    {RankIcon && (
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${rankColor} text-white`}
                      >
                        <RankIcon className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <span>{edition.editionName}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    {t("entitlements.analytics.ltv.subscribers", {
                      count: String(edition.subscriberCount),
                    })}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* LTV Bar */}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground">
                      {t("entitlements.analytics.ltv.avgLtv")}
                    </span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(edition.averageLtv, edition.currency)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-3 border-t border-border/20 pt-1">
                  <div className="py-1.5 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {t("entitlements.analytics.ltv.median")}
                    </p>
                    <p className="mt-0.5 text-xs font-bold">
                      {formatCurrency(edition.medianLtv, edition.currency)}
                    </p>
                  </div>
                  <div className="border-x border-border/20 py-1.5 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {t("entitlements.analytics.ltv.avgLifespan")}
                    </p>
                    <p className="mt-0.5 text-xs font-bold">
                      {edition.avgLifespanMonths.toFixed(1)}mo
                    </p>
                  </div>
                  <div className="py-1.5 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {t("entitlements.analytics.ltv.arpuMonth")}
                    </p>
                    <p className="mt-0.5 text-xs font-bold">
                      {formatCurrency(edition.avgMonthlyRevenue, edition.currency)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {ltvData.editions.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {t("entitlements.analytics.ltv.noData")}
        </div>
      )}
    </div>
  );
}
