"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@core/common/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { VenueOverviewHourlyLoadBucket } from "../../domain/entities/VenueOverview";

interface Props {
  buckets: VenueOverviewHourlyLoadBucket[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewDemandChart({ buckets, t }: Props) {
  const maxTotal = Math.max(1, ...buckets.map((b) => b.total));
  const hasData = buckets.some((b) => b.total > 0);
  const totalBookings = buckets.reduce((acc, b) => acc + b.total, 0);

  // Filter or show operating range (e.g., 06:00 to 23:00 or all 24)
  const displayBuckets = buckets.slice(6, 24);

  return (
    <Card className="border-nx-line bg-nx-surface" data-testid="bookings-by-time-chart">
      <CardHeader className="pb-3 border-b border-nx-line">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-nx-xs border border-nx-line bg-nx-surfaceSubtle text-nx-accent">
              <BarChart3 className="size-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("venueOverview.operationalLoad.title", { defaultValue: "Bookings by Time" })}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {t("venueOverview.operationalLoad.subtitle", {
                  defaultValue: "Today’s booking demand distribution across operating hours.",
                })}
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-nx-ink tabular-nums">
            {totalBookings} {t("venueOverview.demandChart.totalBookings", { defaultValue: "total" })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {!hasData ? (
          <div className="flex h-52 items-center justify-center rounded-nx-sm border border-dashed border-nx-line bg-nx-surfaceSubtle/50 p-6 text-center text-xs text-nx-ink-3">
            {t("venueOverview.operationalLoad.noLoad", { defaultValue: "No booking demand recorded for today." })}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bar Histogram */}
            <div
              className="flex items-end gap-1.5 h-44 pt-6 px-1 border-b border-nx-line"
              role="region"
              aria-label={t("venueOverview.demandChart.title", { defaultValue: "Bookings by Time" })}
            >
              {displayBuckets.map((b) => {
                const heightPercent = b.total > 0 ? Math.max(15, Math.round((b.total / maxTotal) * 100)) : 4;
                const isPeak = b.total > 0 && b.total === maxTotal;

                return (
                  <div
                    key={b.hour}
                    className="group relative flex-1 flex flex-col justify-end items-center h-full outline-none"
                    tabIndex={0}
                    aria-label={`${b.label}: ${b.total} bookings`}
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-1.5 hidden group-hover:flex group-focus-visible:flex flex-col z-30 pointer-events-none rounded-nx-xs border border-nx-line bg-nx-surface p-2 text-[10px] text-nx-ink shadow-nx-md whitespace-nowrap font-mono tabular-nums">
                      <div className="font-bold border-b border-nx-line pb-1 text-nx-accent">{b.label}</div>
                      <div className="pt-1 space-y-0.5">
                        <div className="flex justify-between gap-3 text-success">
                          <span>Checked In:</span> <span>{b.checkedIn}</span>
                        </div>
                        <div className="flex justify-between gap-3 text-nx-accent">
                          <span>Confirmed:</span> <span>{b.confirmed}</span>
                        </div>
                        <div className="flex justify-between gap-3 text-amber-500">
                          <span>Held:</span> <span>{b.held}</span>
                        </div>
                        <div className="flex justify-between gap-3 text-nx-ink-3">
                          <span>Completed:</span> <span>{b.completed}</span>
                        </div>
                        <div className="flex justify-between gap-3 font-bold border-t border-nx-line pt-0.5 text-nx-ink">
                          <span>Total:</span> <span>{b.total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bar */}
                    <div
                      className={cn(
                        "w-full rounded-t-nx-xs transition-all duration-nx-micro",
                        b.total === 0
                          ? "bg-nx-line/30"
                          : isPeak
                          ? "bg-nx-accent shadow-nx-xs"
                          : "bg-nx-accent/70 hover:bg-nx-accent"
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Time Axis Labels (Every 2 Hours) */}
            <div className="flex justify-between text-[10px] font-mono text-nx-ink-3 px-1" dir="ltr">
              {displayBuckets.map((b) => (
                <div key={b.hour} className="flex-1 text-center truncate">
                  {b.hour % 2 === 0 ? b.hour.toString().padStart(2, "0") : ""}
                </div>
              ))}
            </div>

            {/* Accessible Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-nx-ink-2">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-nx-accent" />
                <span>{t("venueOverview.demandChart.scheduled", { defaultValue: "Scheduled demand" })}</span>
              </div>
              <span className="text-[10px] text-nx-ink-3 font-mono">
                {t("venueOverview.demandChart.hoursRange", { defaultValue: "06:00 – 23:00" })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
