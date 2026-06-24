"use client";
/**
 * RevenueTab — Premium MRR movement waterfall visualization with summary cards.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MrrMovementResponse } from "../../domain/entities/AnalyticsEntities";

interface RevenueTabProps {
  mrrData: MrrMovementResponse;
  months: number;
  onMonthsChange: (months: number) => void;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function formatMonth(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/**
 * Presentation UI component rendering the revenue tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RevenueTab({ mrrData, months, onMonthsChange }: RevenueTabProps) {
  const { t } = useI18n();
  const maxMrr = Math.max(...mrrData.movements.map((m) => m.mrrEnd), 1);

  // Aggregate summary
  const totalNew = mrrData.movements.reduce((s, m) => s + m.mrrNew, 0);
  const totalExpansion = mrrData.movements.reduce((s, m) => s + m.mrrExpansion, 0);
  const totalChurn = mrrData.movements.reduce((s, m) => s + m.mrrChurn, 0);
  const netChange = mrrData.movements.reduce((s, m) => s + m.netChange, 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("entitlements.analytics.revenue.title")}</h2>
        <Select value={String(months)} onValueChange={(v) => onMonthsChange(Number(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">{t("entitlements.analytics.periods.months6")}</SelectItem>
            <SelectItem value="12">{t("entitlements.analytics.periods.months12")}</SelectItem>
            <SelectItem value="24">{t("entitlements.analytics.periods.months24")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label={t("entitlements.analytics.revenue.totalNew")}
          value={totalNew}
          positive
        />
        <SummaryCard
          label={t("entitlements.analytics.revenue.totalExpansion")}
          value={totalExpansion}
          positive
        />
        <SummaryCard
          label={t("entitlements.analytics.revenue.totalChurn")}
          value={-totalChurn}
          positive={false}
        />
        <SummaryCard
          label={t("entitlements.analytics.revenue.netChange")}
          value={netChange}
          positive={netChange >= 0}
          highlight
        />
      </div>

      {/* Waterfall Chart */}
      <Card className="overflow-hidden border border-border/30 shadow-sm">
        <CardHeader className="bg-muted/20 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("entitlements.analytics.revenue.mrrWaterfall")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {mrrData.movements.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("entitlements.analytics.revenue.noData")}
            </div>
          ) : (
            <div className="space-y-1">
              {mrrData.movements.map((movement, idx) => {
                const barWidth = (movement.mrrEnd / maxMrr) * 100;
                const isGrowth = movement.netChange > 0;
                return (
                  <div
                    key={movement.month}
                    className="group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 py-1.5">
                      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                        {formatMonth(movement.month)}
                      </span>
                      <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-muted/20">
                        <div
                          className={`h-full rounded-lg transition-all duration-700 ease-out ${
                            isGrowth
                              ? "bg-gradient-to-r from-emerald-500/70 to-emerald-400/50"
                              : "bg-gradient-to-r from-rose-500/70 to-rose-400/50"
                          }`}
                          style={{ width: `${Math.max(barWidth, 3)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <span className="text-xs font-bold">
                            {formatCurrency(movement.mrrEnd)}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              isGrowth
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            }`}
                          >
                            {isGrowth ? "+" : ""}
                            {formatCurrency(movement.netChange)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown on hover */}
                    <div className="ml-[76px] hidden flex-wrap gap-1.5 pb-2 duration-200 animate-in fade-in-0 group-hover:flex">
                      {movement.mrrNew > 0 && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                          +{formatCurrency(movement.mrrNew)}{" "}
                          {t("entitlements.analytics.revenue.new")}
                        </span>
                      )}
                      {movement.mrrExpansion > 0 && (
                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                          +{formatCurrency(movement.mrrExpansion)}{" "}
                          {t("entitlements.analytics.revenue.expansion")}
                        </span>
                      )}
                      {movement.mrrChurn > 0 && (
                        <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-600">
                          -{formatCurrency(movement.mrrChurn)}{" "}
                          {t("entitlements.analytics.revenue.churn")}
                        </span>
                      )}
                      {movement.mrrContraction > 0 && (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                          -{formatCurrency(movement.mrrContraction)}{" "}
                          {t("entitlements.analytics.revenue.contraction")}
                        </span>
                      )}
                      {movement.mrrReactivation > 0 && (
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                          +{formatCurrency(movement.mrrReactivation)}{" "}
                          {t("entitlements.analytics.revenue.reactivation")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  positive,
  highlight,
}: {
  label: string;
  value: number;
  positive: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center transition-all ${
        highlight
          ? "border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-sm"
          : "border-border/20 bg-card/50"
      }`}
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1">
        {positive ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
        )}
        <span
          className={`text-sm font-bold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
        >
          {formatCurrency(Math.abs(value))}
        </span>
      </div>
    </div>
  );
}
