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
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
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
      <Card className="overflow-hidden border border-[color:color-mix(in_srgb,var(--nx-line)_30%,transparent)]">
        <CardHeader className="bg-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)] pb-2">
          <CardTitle className="text-sm font-medium text-nx-ink-3">
            {t("entitlements.analytics.revenue.mrrWaterfall")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {mrrData.movements.length === 0 ? (
            <div className="py-12 text-center text-sm text-nx-ink-3">
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
                      <span className="w-16 shrink-0 font-mono text-xs text-nx-ink-3">
                        {formatMonth(movement.month)}
                      </span>
                      <div className="relative h-9 flex-1 overflow-hidden rounded-nx-md bg-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)]">
                        <div
                          className={`h-full rounded-nx-md transition-[width] duration-nx-standard ease-nx-enter motion-reduce:transition-none ${
                            isGrowth
                              ? "bg-gradient-to-r from-success/70 to-success/50"
                              : "bg-gradient-to-r from-destructive/70 to-destructive/50"
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
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {isGrowth ? "+" : ""}
                            {formatCurrency(movement.netChange)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown on hover */}
                    <div className="ms-[76px] hidden flex-wrap gap-1.5 pb-2 duration-nx-standard ease-nx-enter animate-in fade-in-0 motion-reduce:transition-none group-hover:flex">
                      {movement.mrrNew > 0 && (
                        <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                          +{formatCurrency(movement.mrrNew)}{" "}
                          {t("entitlements.analytics.revenue.new")}
                        </span>
                      )}
                      {movement.mrrExpansion > 0 && (
                        <span className="rounded-full border border-info/20 bg-info/10 px-2 py-0.5 text-[10px] font-medium text-info">
                          +{formatCurrency(movement.mrrExpansion)}{" "}
                          {t("entitlements.analytics.revenue.expansion")}
                        </span>
                      )}
                      {movement.mrrChurn > 0 && (
                        <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                          -{formatCurrency(movement.mrrChurn)}{" "}
                          {t("entitlements.analytics.revenue.churn")}
                        </span>
                      )}
                      {movement.mrrContraction > 0 && (
                        <span className="rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                          -{formatCurrency(movement.mrrContraction)}{" "}
                          {t("entitlements.analytics.revenue.contraction")}
                        </span>
                      )}
                      {movement.mrrReactivation > 0 && (
                        <span className="rounded-full border border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-nx-accent-wash px-2 py-0.5 text-[10px] font-medium text-nx-accent">
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
      className={`rounded-nx-md border p-3 text-center transition-[background-color,border-color,box-shadow] duration-nx-standard ease-nx-enter motion-reduce:transition-none ${
        highlight
          ? "border-[color:color-mix(in_srgb,var(--nx-line)_50%,transparent)] bg-gradient-to-br from-nx-surface to-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)]"
          : "border-[color:color-mix(in_srgb,var(--nx-line)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-surface)_50%,transparent)]"
      }`}
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-nx-ink-3">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1">
        {positive ? (
          <TrendingUp className="h-3.5 w-3.5 text-success" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
        )}
        <span className={`text-sm font-bold ${positive ? "text-success" : "text-destructive"}`}>
          {formatCurrency(Math.abs(value))}
        </span>
      </div>
    </div>
  );
}
