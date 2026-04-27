"use client";
/**
 * ForecastTab — Revenue forecast with confidence intervals.
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
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function formatMonth(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function ForecastTab({ forecastData, months, onMonthsChange }: ForecastTabProps) {
  const { t } = useI18n();

  const maxValue = Math.max(...forecastData.forecasts.map((f) => f.upperBound), 1);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t("entitlements.analytics.forecast.title")}</h2>
          <Badge variant="secondary" className="text-[10px]">
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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("entitlements.analytics.forecast.projectedMrr")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecastData.forecasts.map((point) => {
              const projWidth = (point.projectedMrr / maxValue) * 100;
              const lowerWidth = (point.lowerBound / maxValue) * 100;
              const upperWidth = (point.upperBound / maxValue) * 100;

              return (
                <div key={point.month} className="group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">
                      {formatMonth(point.month)}
                    </span>
                    <div className="flex-1 relative h-10 bg-muted/20 rounded overflow-hidden">
                      {/* Confidence interval background */}
                      <div
                        className="absolute h-full bg-blue-500/10 rounded"
                        style={{
                          left: `${lowerWidth}%`,
                          width: `${Math.max(upperWidth - lowerWidth, 1)}%`,
                        }}
                      />
                      {/* Projected MRR bar */}
                      <div
                        className="absolute h-full bg-gradient-to-r from-blue-500/60 to-indigo-500/40 rounded transition-all duration-500"
                        style={{ width: `${Math.max(projWidth, 2)}%` }}
                      />
                      {/* Labels */}
                      <div className="absolute inset-0 flex items-center px-3 justify-between">
                        <span className="text-xs font-semibold">{formatCurrency(point.projectedMrr)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatCurrency(point.lowerBound)} – {formatCurrency(point.upperBound)}
                        </span>
                      </div>
                    </div>
                    {/* Confidence badge */}
                    <span className={`text-[10px] font-medium w-10 text-right ${
                      point.confidence >= 80 ? "text-emerald-600" : point.confidence >= 50 ? "text-amber-600" : "text-rose-600"
                    }`}>
                      {point.confidence.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500/60 to-indigo-500/40" />
          <span>{t("entitlements.analytics.forecast.projected")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500/10 border border-blue-500/20" />
          <span>{t("entitlements.analytics.forecast.confidence")}</span>
        </div>
      </div>
    </div>
  );
}
