"use client";
/**
 * RetentionTab — Premium cohort retention heatmap with smooth gradients.
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

function getHeatmapStyle(rate: number): { bg: string; text: string } {
  if (rate >= 90) return { bg: "bg-emerald-500", text: "text-white" };
  if (rate >= 75) return { bg: "bg-emerald-400", text: "text-white" };
  if (rate >= 60) return { bg: "bg-emerald-300", text: "text-emerald-900" };
  if (rate >= 45) return { bg: "bg-teal-200", text: "text-teal-900" };
  if (rate >= 30) return { bg: "bg-amber-200", text: "text-amber-900" };
  if (rate >= 15) return { bg: "bg-orange-300", text: "text-orange-900" };
  if (rate > 0) return { bg: "bg-rose-300", text: "text-rose-900" };
  return { bg: "bg-rose-400", text: "text-white" };
}

/**
 * React presentation component representing the retention tab UI element.
 */
export function RetentionTab({ cohortData }: RetentionTabProps) {
  const { t } = useI18n();
  const maxColumns = Math.max(...cohortData.cohorts.map((c) => c.buckets.length), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("entitlements.analytics.retention.title")}</h2>

      <Card className="overflow-hidden border border-border/30 shadow-sm">
        <CardHeader className="bg-muted/20 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("entitlements.analytics.retention.heatmap")}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="flex border-b bg-muted/30">
              <div className="w-24 shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("entitlements.analytics.retention.cohort")}
              </div>
              <div className="w-16 shrink-0 px-2 py-2.5 text-center text-xs font-bold text-muted-foreground">
                #
              </div>
              {Array.from({ length: maxColumns }, (_, i) => (
                <div
                  key={i}
                  className="w-14 shrink-0 px-1 py-2.5 text-center text-xs font-bold text-muted-foreground"
                >
                  M{i}
                </div>
              ))}
            </div>

            {/* Cohort rows */}
            {cohortData.cohorts.map((row, rowIdx) => (
              <div
                key={row.cohortMonth}
                className="flex border-b transition-colors last:border-0 hover:bg-muted/10"
                style={{ animationDelay: `${rowIdx * 30}ms` }}
              >
                <div className="w-24 shrink-0 px-3 py-2.5 font-mono text-xs font-medium text-foreground/80">
                  {formatMonth(row.cohortMonth)}
                </div>
                <div className="w-16 shrink-0 px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                  {row.initialCount}
                </div>
                {row.buckets.map((bucket, colIdx) => {
                  const style = getHeatmapStyle(bucket.retentionRate);
                  return (
                    <div
                      key={bucket.monthOffset}
                      className={`m-0.5 flex w-14 shrink-0 cursor-default items-center justify-center rounded py-2 text-center text-[10px] font-bold transition-all duration-200 hover:scale-110 hover:shadow-md ${style.bg} ${style.text}`}
                      title={`${bucket.retainedCount} retained (${bucket.retentionRate.toFixed(1)}%)`}
                      style={{ animationDelay: `${(rowIdx * maxColumns + colIdx) * 15}ms` }}
                    >
                      {bucket.retentionRate.toFixed(0)}%
                    </div>
                  );
                })}
                {/* Fill empty cells */}
                {Array.from({ length: maxColumns - row.buckets.length }, (_, i) => (
                  <div key={`empty-${i}`} className="w-14 shrink-0" />
                ))}
              </div>
            ))}

            {cohortData.cohorts.length === 0 && (
              <div className="py-16 text-center text-sm text-muted-foreground">
                {t("entitlements.analytics.retention.noData")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="font-semibold">{t("entitlements.analytics.retention.legend")}:</span>
        <div className="flex items-center gap-2">
          {[
            { label: "0%", bg: "bg-rose-400" },
            { label: "15%", bg: "bg-orange-300" },
            { label: "30%", bg: "bg-amber-200" },
            { label: "45%", bg: "bg-teal-200" },
            { label: "60%", bg: "bg-emerald-300" },
            { label: "75%", bg: "bg-emerald-400" },
            { label: "90%+", bg: "bg-emerald-500" },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-1">
              <div className={`h-3 w-4 rounded ${step.bg}`} />
              <span className="text-[10px]">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
