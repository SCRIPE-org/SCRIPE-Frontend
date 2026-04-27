"use client";
/**
 * RetentionTab — Cohort retention heatmap.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import type { CohortAnalysisResponse } from "../../domain/entities/AnalyticsEntities";

interface RetentionTabProps {
  cohortData: CohortAnalysisResponse;
}

function formatMonth(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function getHeatmapColor(rate: number): string {
  if (rate >= 90) return "bg-emerald-500 text-white";
  if (rate >= 70) return "bg-emerald-400 text-white";
  if (rate >= 50) return "bg-emerald-300 text-emerald-900";
  if (rate >= 30) return "bg-amber-300 text-amber-900";
  if (rate >= 10) return "bg-rose-300 text-rose-900";
  return "bg-rose-400 text-white";
}

export function RetentionTab({ cohortData }: RetentionTabProps) {
  const { t } = useI18n();

  const maxColumns = Math.max(...cohortData.cohorts.map((c) => c.buckets.length), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("entitlements.analytics.retention.title")}</h2>

      <Card className="border-0 shadow-sm overflow-x-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("entitlements.analytics.retention.heatmap")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="flex border-b bg-muted/30">
              <div className="w-24 shrink-0 px-3 py-2 text-xs font-semibold text-muted-foreground">
                {t("entitlements.analytics.retention.cohort")}
              </div>
              <div className="w-16 shrink-0 px-2 py-2 text-xs font-semibold text-muted-foreground text-center">
                #
              </div>
              {Array.from({ length: maxColumns }, (_, i) => (
                <div key={i} className="w-14 shrink-0 px-1 py-2 text-xs font-semibold text-muted-foreground text-center">
                  M{i}
                </div>
              ))}
            </div>

            {/* Cohort rows */}
            {cohortData.cohorts.map((row) => (
              <div key={row.cohortMonth} className="flex border-b last:border-0 hover:bg-muted/10 transition-colors">
                <div className="w-24 shrink-0 px-3 py-2 text-xs font-medium font-mono">
                  {formatMonth(row.cohortMonth)}
                </div>
                <div className="w-16 shrink-0 px-2 py-2 text-xs text-center text-muted-foreground">
                  {row.initialCount}
                </div>
                {row.buckets.map((bucket) => (
                  <div
                    key={bucket.monthOffset}
                    className={`w-14 shrink-0 px-1 py-2 text-center text-[10px] font-semibold rounded-sm m-0.5 transition-all hover:scale-110 cursor-default ${getHeatmapColor(bucket.retentionRate)}`}
                    title={`${bucket.retainedCount} retained (${bucket.retentionRate.toFixed(1)}%)`}
                  >
                    {bucket.retentionRate.toFixed(0)}%
                  </div>
                ))}
                {/* Fill empty cells */}
                {Array.from({ length: maxColumns - row.buckets.length }, (_, i) => (
                  <div key={`empty-${i}`} className="w-14 shrink-0" />
                ))}
              </div>
            ))}

            {cohortData.cohorts.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                {t("entitlements.analytics.retention.noData")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{t("entitlements.analytics.retention.legend")}:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-rose-400" /> <span>0-10%</span>
          <div className="w-4 h-4 rounded bg-amber-300 ml-2" /> <span>30-50%</span>
          <div className="w-4 h-4 rounded bg-emerald-400 ml-2" /> <span>70-90%</span>
          <div className="w-4 h-4 rounded bg-emerald-500 ml-2" /> <span>90%+</span>
        </div>
      </div>
    </div>
  );
}
