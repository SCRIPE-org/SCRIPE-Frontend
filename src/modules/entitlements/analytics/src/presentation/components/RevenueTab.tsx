"use client";
/**
 * RevenueTab — MRR movement waterfall visualization.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { MrrMovementResponse } from "../../domain/entities/AnalyticsEntities";

interface RevenueTabProps {
  mrrData: MrrMovementResponse;
  months: number;
  onMonthsChange: (months: number) => void;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function formatMonth(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function RevenueTab({ mrrData, months, onMonthsChange }: RevenueTabProps) {
  const { t } = useI18n();

  const maxMrr = Math.max(...mrrData.movements.map((m) => m.mrrEnd), 1);

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

      {/* Waterfall Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("entitlements.analytics.revenue.mrrWaterfall")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {mrrData.movements.map((movement) => {
              const barWidth = (movement.mrrEnd / maxMrr) * 100;
              const isGrowth = movement.netChange > 0;
              return (
                <div key={movement.month} className="group">
                  <div className="flex items-center gap-3 py-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">
                      {formatMonth(movement.month)}
                    </span>
                    <div className="flex-1 relative h-8 bg-muted/30 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-500 ${
                          isGrowth
                            ? "bg-gradient-to-r from-emerald-500/80 to-emerald-400/60"
                            : "bg-gradient-to-r from-rose-500/80 to-rose-400/60"
                        }`}
                        style={{ width: `${Math.max(barWidth, 2)}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3 justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          {formatCurrency(movement.mrrEnd)}
                        </span>
                        <span className={`text-[10px] font-medium ${isGrowth ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                          {isGrowth ? "+" : ""}{formatCurrency(movement.netChange)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown on hover */}
                  <div className="hidden group-hover:flex gap-2 ml-[76px] pb-2 flex-wrap">
                    {movement.mrrNew > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                        +{formatCurrency(movement.mrrNew)} {t("entitlements.analytics.revenue.new")}
                      </span>
                    )}
                    {movement.mrrExpansion > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                        +{formatCurrency(movement.mrrExpansion)} {t("entitlements.analytics.revenue.expansion")}
                      </span>
                    )}
                    {movement.mrrChurn > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-medium">
                        -{formatCurrency(movement.mrrChurn)} {t("entitlements.analytics.revenue.churn")}
                      </span>
                    )}
                    {movement.mrrContraction > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                        -{formatCurrency(movement.mrrContraction)} {t("entitlements.analytics.revenue.contraction")}
                      </span>
                    )}
                    {movement.mrrReactivation > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 font-medium">
                        +{formatCurrency(movement.mrrReactivation)} {t("entitlements.analytics.revenue.reactivation")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
