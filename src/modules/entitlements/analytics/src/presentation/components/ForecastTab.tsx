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
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

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
          <Badge variant="secondary" className="text-[10px] font-mono">
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
        <div className="text-center py-16 text-sm text-muted-foreground">
          {t("entitlements.analytics.forecast.noData")}
        </div>
      ) : (
        <Card className="border border-border/30 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 bg-muted/20">
            <CardTitle className="text-sm font-medium text-muted-foreground">
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
                  <div key={point.month} className="group" style={{ animationDelay: `${idx * 40}ms` }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">
                        {formatMonth(point.month)}
                      </span>
                      <div className="flex-1 relative h-10 bg-muted/15 rounded-lg overflow-hidden">
                        {/* Confidence interval background */}
                        {isProjected && (
                          <div
                            className="absolute h-full bg-blue-500/10 rounded-lg border-l border-r border-blue-500/20"
                            style={{
                              left: `${lowerWidth}%`,
                              width: `${Math.max(upperWidth - lowerWidth, 1)}%`,
                            }}
                          />
                        )}
                        {/* MRR bar */}
                        <div
                          className={`absolute h-full rounded-lg transition-all duration-700 ease-out ${
                            isProjected
                              ? "bg-gradient-to-r from-blue-500/60 to-indigo-500/40"
                              : "bg-gradient-to-r from-emerald-500/60 to-teal-500/40"
                          }`}
                          style={{ width: `${Math.max(projWidth, 3)}%` }}
                        />
                        {/* Labels */}
                        <div className="absolute inset-0 flex items-center px-3 justify-between">
                          <span className="text-xs font-bold">{formatCurrency(point.projectedMrr)}</span>
                          {isProjected && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatCurrency(point.lowerBound)} – {formatCurrency(point.upperBound)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Confidence or type badge */}
                      {isProjected ? (
                        <span className={`text-[10px] font-semibold w-10 text-right ${
                          point.confidence >= 80 ? "text-emerald-600" : point.confidence >= 50 ? "text-amber-600" : "text-rose-600"
                        }`}>
                          {point.confidence.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground w-10 text-right">●</span>
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
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded bg-gradient-to-r from-emerald-500/60 to-teal-500/40" />
          <span className="font-medium">{t("entitlements.analytics.forecast.historical")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded bg-gradient-to-r from-blue-500/60 to-indigo-500/40" />
          <span className="font-medium">{t("entitlements.analytics.forecast.projected")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded bg-blue-500/10 border border-blue-500/20" />
          <span className="font-medium">{t("entitlements.analytics.forecast.confidence")}</span>
        </div>
      </div>
    </div>
  );
}
