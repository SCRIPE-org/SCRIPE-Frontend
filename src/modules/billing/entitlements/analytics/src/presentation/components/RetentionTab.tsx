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
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function getHeatmapStyle(rate: number): { bg: string; text: string } {
  if (rate >= 90) return { bg: "bg-success", text: "text-success-foreground" };
  if (rate >= 75) return { bg: "bg-success/80", text: "text-success-foreground" };
  if (rate >= 60) return { bg: "bg-success/60", text: "text-nx-ink" };
  if (rate >= 45) return { bg: "bg-success/35", text: "text-nx-ink" };
  if (rate >= 30) return { bg: "bg-warning/40", text: "text-nx-ink" };
  if (rate >= 15) return { bg: "bg-warning-strong/45", text: "text-nx-ink" };
  if (rate > 0) return { bg: "bg-destructive/40", text: "text-nx-ink" };
  return { bg: "bg-destructive/60", text: "text-destructive-foreground" };
}

/**
 * Presentation UI component rendering the retention tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RetentionTab({ cohortData }: RetentionTabProps) {
  const { t } = useI18n();
  const maxColumns = Math.max(...cohortData.cohorts.map((c) => c.buckets.length), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("entitlements.analytics.retention.title")}</h2>

      <Card className="overflow-hidden border border-[color:color-mix(in_srgb,var(--nx-line)_30%,transparent)] shadow-sm">
        <CardHeader className="bg-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)] pb-2">
          <CardTitle className="text-sm font-medium text-nx-ink-3">
            {t("entitlements.analytics.retention.heatmap")}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="flex border-b bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)]">
              <div className="w-24 shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-nx-ink-3">
                {t("entitlements.analytics.retention.cohort")}
              </div>
              <div className="w-16 shrink-0 px-2 py-2.5 text-center text-xs font-bold text-nx-ink-3">
                #
              </div>
              {Array.from({ length: maxColumns }, (_, i) => (
                <div
                  key={i}
                  className="w-14 shrink-0 px-1 py-2.5 text-center text-xs font-bold text-nx-ink-3"
                >
                  M{i}
                </div>
              ))}
            </div>

            {/* Cohort rows */}
            {cohortData.cohorts.map((row, rowIdx) => (
              <div
                key={row.cohortMonth}
                className="flex border-b transition-colors duration-nx-micro ease-nx-enter last:border-0 hover:bg-nx-hover motion-reduce:transition-none"
                style={{ animationDelay: `${rowIdx * 30}ms` }}
              >
                <div className="w-24 shrink-0 px-3 py-2.5 font-mono text-xs font-medium text-[color:color-mix(in_srgb,var(--nx-ink)_80%,transparent)]">
                  {formatMonth(row.cohortMonth)}
                </div>
                <div className="w-16 shrink-0 px-2 py-2.5 text-center text-xs font-semibold text-nx-ink-3">
                  {row.initialCount}
                </div>
                {row.buckets.map((bucket, colIdx) => {
                  const style = getHeatmapStyle(bucket.retentionRate);
                  return (
                    <div
                      key={bucket.monthOffset}
                      className={`m-0.5 flex w-14 shrink-0 cursor-default items-center justify-center rounded py-2 text-center text-[10px] font-bold transition-[background-color,color] duration-nx-standard ease-nx-enter motion-reduce:transition-none ${style.bg} ${style.text}`}
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
              <div className="py-16 text-center text-sm text-nx-ink-3">
                {t("entitlements.analytics.retention.noData")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-nx-ink-3">
        <span className="font-semibold">{t("entitlements.analytics.retention.legend")}:</span>
        <div className="flex items-center gap-2">
          {[
            { label: "0%", bg: "bg-destructive/60" },
            { label: "15%", bg: "bg-warning-strong/45" },
            { label: "30%", bg: "bg-warning/40" },
            { label: "45%", bg: "bg-success/35" },
            { label: "60%", bg: "bg-success/60" },
            { label: "75%", bg: "bg-success/80" },
            { label: "90%+", bg: "bg-success" },
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
