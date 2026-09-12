"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { VenueOverviewHourlyLoadBucket } from "../../domain/entities/VenueOverview";

interface Props {
  buckets: VenueOverviewHourlyLoadBucket[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewOperationalLoad({ buckets, t }: Props) {
  const maxTotal = Math.max(1, ...buckets.map((b) => b.total));
  const hasData = buckets.some((b) => b.total > 0);

  return (
    <Card className="border-nx-line bg-nx-surface">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("venueOverview.operationalLoad.title")}
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-2">
              {t("venueOverview.operationalLoad.subtitle")}
            </CardDescription>
          </div>

          {/* Accessible Chart Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-nx-xs bg-success" aria-hidden="true" />
              <span className="text-nx-ink-2">{t("venueOverview.operationalLoad.legend.checkedIn")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-nx-xs bg-info" aria-hidden="true" />
              <span className="text-nx-ink-2">{t("venueOverview.operationalLoad.legend.confirmed")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-nx-xs bg-warning-strong" aria-hidden="true" />
              <span className="text-nx-ink-2">{t("venueOverview.operationalLoad.legend.held")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-nx-xs bg-nx-ink-3" aria-hidden="true" />
              <span className="text-nx-ink-2">{t("venueOverview.operationalLoad.legend.completed")}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className="flex h-48 items-center justify-center rounded-nx-sm border border-dashed border-nx-line bg-nx-surfaceSubtle p-6 text-center text-xs text-nx-ink-3">
            {t("venueOverview.operationalLoad.noLoad")}
          </div>
        ) : (
          <div className="space-y-2">
            {/* 24-Hour Stepped Histogram Visualization */}
            <div
              className="grid grid-cols-24 gap-1 items-end h-44 border-b border-nx-line pb-2 pt-4 px-1"
              aria-label={t("venueOverview.operationalLoad.title")}
              role="img"
            >
              {buckets.map((b) => {
                const heightPercent = b.total > 0 ? Math.max(12, Math.round((b.total / maxTotal) * 100)) : 0;
                const checkedInPct = b.total > 0 ? (b.checkedIn / b.total) * 100 : 0;
                const confirmedPct = b.total > 0 ? (b.confirmed / b.total) * 100 : 0;
                const heldPct = b.total > 0 ? (b.held / b.total) * 100 : 0;
                const completedPct = b.total > 0 ? (b.completed / b.total) * 100 : 0;

                return (
                  <div
                    key={b.hour}
                    className="group relative flex flex-col justify-end w-full h-full"
                    title={`${b.label}: ${b.total} booking(s)`}
                  >
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col z-popover pointer-events-none rounded-nx-xs border border-nx-line bg-nx-surface p-1.5 text-[10px] text-nx-ink shadow-nx-md whitespace-nowrap font-mono tabular-nums">
                      <span className="font-bold border-b border-nx-line pb-0.5">{b.label}</span>
                      <span>CheckedIn: {b.checkedIn}</span>
                      <span>Confirmed: {b.confirmed}</span>
                      <span>Held: {b.held}</span>
                      <span>Completed: {b.completed}</span>
                      <span className="font-bold pt-0.5 border-t border-nx-line">Total: {b.total}</span>
                    </div>

                    {/* Bar Container */}
                    {b.total > 0 ? (
                      <div
                        className="w-full rounded-t-nx-xs overflow-hidden flex flex-col justify-end transition-all duration-nx-micro"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {b.checkedIn > 0 && (
                          <div className="bg-success w-full" style={{ height: `${checkedInPct}%` }} />
                        )}
                        {b.confirmed > 0 && (
                          <div className="bg-info w-full" style={{ height: `${confirmedPct}%` }} />
                        )}
                        {b.held > 0 && (
                          <div className="bg-warning-strong w-full" style={{ height: `${heldPct}%` }} />
                        )}
                        {b.completed > 0 && (
                          <div className="bg-nx-ink-3/40 w-full" style={{ height: `${completedPct}%` }} />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-1 bg-nx-line/30 rounded-t-nx-xs" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Axis Labels (Every 3 hours) */}
            <div className="grid grid-cols-24 text-[10px] text-nx-ink-3 font-mono text-center pt-1" dir="ltr">
              {buckets.map((b) => (
                <div key={b.hour} className="truncate">
                  {b.hour % 3 === 0 ? `${b.hour.toString().padStart(2, "0")}` : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
