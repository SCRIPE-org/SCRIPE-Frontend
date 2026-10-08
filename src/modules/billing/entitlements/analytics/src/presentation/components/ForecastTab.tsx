"use client";
/**
 * ForecastTab — Premium revenue forecast with confidence intervals and projection cards.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { RevenueForecastResponse } from "../../domain/entities/AnalyticsEntities";

interface ForecastTabProps {
  forecastData: RevenueForecastResponse;
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
 * Presentation UI component rendering the forecast tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ForecastTab({ forecastData, months, onMonthsChange }: ForecastTabProps) {
  const { t } = useI18n();

  const allPoints = forecastData.forecasts;
  const maxValue = Math.max(...allPoints.map((f) => f.upperBound), 1);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t("entitlements.analytics.forecast.title")}</h2>
          <Badge variant="secondary" className="font-mono text-[10px]">
            R² = {forecastData.rSquared.toFixed(3)}
          </Badge>
        </div>
        <Select value={String(months)} onValueChange={(v) => onMonthsChange(Number(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">{t("entitlements.analytics.periods.months3")}</SelectItem>
            <SelectItem value="6">{t("entitlements.analytics.periods.months6")}</SelectItem>
            <SelectItem value="12">{t("entitlements.analytics.periods.months12")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Forecast Chart */}
      {allPoints.length === 0 ? (
        <div className="py-16 text-center text-sm text-nx-ink-3">
          {t("entitlements.analytics.forecast.noData")}
        </div>
      ) : (
        <Card className="overflow-hidden border border-[color:color-mix(in_srgb,var(--nx-line)_30%,transparent)]">
          <CardHeader className="bg-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)] pb-2">
            <CardTitle className="text-sm font-medium text-nx-ink-3">
              {t("entitlements.analytics.forecast.projectedMrr")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {allPoints.map((point, idx) => {
                const projWidth = (point.projectedMrr / maxValue) * 100;
                const lowerWidth = (point.lowerBound / maxValue) * 100;
                const upperWidth = (point.upperBound / maxValue) * 100;
                const isProjected = point.confidence > 0;

                return (
                  <div
                    key={point.month}
                    className="group"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono text-xs text-nx-ink-3">
                        {formatMonth(point.month)}
                      </span>
                      <div className="relative h-10 flex-1 overflow-hidden rounded-nx-md bg-[color:color-mix(in_srgb,var(--nx-raised)_15%,transparent)]">
                        {/* Confidence interval background */}
                        {isProjected && (
                          <div
                            className="absolute h-full rounded-nx-md border-e border-s border-info/20 bg-info/10"
                            style={{
                              left: `${lowerWidth}%`,
                              width: `${Math.max(upperWidth - lowerWidth, 1)}%`,
                            }}
                          />
                        )}
                        {/* MRR bar */}
                        <div
                          className={`absolute h-full rounded-nx-md transition-[width] duration-nx-standard ease-nx-enter motion-reduce:transition-none ${
                            isProjected
                              ? "bg-gradient-to-r from-info/60 to-info/40"
                              : "bg-gradient-to-r from-success/60 to-success/40"
                          }`}
                          style={{ width: `${Math.max(projWidth, 3)}%` }}
                        />
                        {/* Labels */}
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <span className="text-xs font-bold">
                            {formatCurrency(point.projectedMrr)}
                          </span>
                          {isProjected && (
                            <span className="font-mono text-[10px] text-nx-ink-3">
                              {formatCurrency(point.lowerBound)} –{" "}
                              {formatCurrency(point.upperBound)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Confidence or type badge */}
                      {isProjected ? (
                        <span
                          className={`w-10 text-end text-[10px] font-semibold ${
                            point.confidence >= 80
                              ? "text-success"
                              : point.confidence >= 50
                                ? "text-warning"
                                : "text-destructive"
                          }`}
                        >
                          {point.confidence.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="w-10 text-end text-[10px] text-nx-ink-3">●</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-nx-ink-3">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-4 rounded bg-gradient-to-r from-success/60 to-success/40" />
          <span className="font-medium">{t("entitlements.analytics.forecast.historical")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-4 rounded bg-gradient-to-r from-info/60 to-info/40" />
          <span className="font-medium">{t("entitlements.analytics.forecast.projected")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-4 rounded border border-info/20 bg-info/10" />
          <span className="font-medium">{t("entitlements.analytics.forecast.confidence")}</span>
        </div>
      </div>
    </div>
  );
}
