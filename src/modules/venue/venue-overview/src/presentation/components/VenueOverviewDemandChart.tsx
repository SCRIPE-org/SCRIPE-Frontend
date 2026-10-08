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

/**
 * Documentation for module export
 */
export function VenueOverviewDemandChart({ buckets, t }: Props) {
  const maxTotal = Math.max(1, ...buckets.map((b) => b.total));
  const hasData = buckets.some((b) => b.total > 0);
  const totalBookings = buckets.reduce((acc, b) => acc + b.total, 0);

  // Filter or show operating range (e.g., 06:00 to 23:00 or all 24)
  const displayBuckets = buckets.slice(6, 24);

  return (
    <Card className="border-nx-line bg-nx-surface" data-testid="bookings-by-time-chart">
      <CardHeader className="border-b border-nx-line pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-nx-xs bg-nx-surfaceSubtle flex size-7 items-center justify-center border border-nx-line text-nx-accent">
              <BarChart3 className="size-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("venueOverview.operationalLoad.title", { defaultValue: "Bookings by Time" })}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {t("venueOverview.operationalLoad.subtitle", {
                  defaultValue: "Todayâ€™s booking demand distribution across operating hours.",
                })}
              </CardDescription>
            </div>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums text-nx-ink">
            {totalBookings}{" "}
            {t("venueOverview.demandChart.totalBookings", { defaultValue: "total" })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {!hasData ? (
          <div className="bg-nx-surfaceSubtle/50 flex h-52 items-center justify-center rounded-nx-sm border border-dashed border-nx-line p-6 text-center text-xs text-nx-ink-3">
            {t("venueOverview.operationalLoad.noLoad", {
              defaultValue: "No booking demand recorded for today.",
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bar Histogram */}
            <div
              className="flex h-44 items-end gap-1.5 border-b border-nx-line px-1 pt-6"
              role="region"
              aria-label={t("venueOverview.demandChart.title", {
                defaultValue: "Bookings by Time",
              })}
            >
              {displayBuckets.map((b) => {
                const heightPercent =
                  b.total > 0 ? Math.max(15, Math.round((b.total / maxTotal) * 100)) : 4;
                const isPeak = b.total > 0 && b.total === maxTotal;

                return (
                  <div
                    key={b.hour}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none"
                    tabIndex={0}
                    aria-label={`${b.label}: ${b.total} bookings`}
                  >
                    {/* Hover Tooltip */}
                    <div className="rounded-nx-xs shadow-nx-md pointer-events-none absolute bottom-full z-30 mb-1.5 hidden flex-col whitespace-nowrap border border-nx-line bg-nx-surface p-2 font-mono text-[10px] tabular-nums text-nx-ink group-hover:flex group-focus-visible:flex">
                      <div className="border-b border-nx-line pb-1 font-bold text-nx-accent">
                        {b.label}
                      </div>
                      <div className="space-y-0.5 pt-1">
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
                        <div className="flex justify-between gap-3 border-t border-nx-line pt-0.5 font-bold text-nx-ink">
                          <span>Total:</span> <span>{b.total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bar */}
                    <div
                      className={cn(
                        "rounded-t-nx-xs w-full transition-all duration-nx-micro",
                        b.total === 0
                          ? "bg-nx-line/30"
                          : isPeak
                            ? "shadow-nx-xs bg-nx-accent"
                            : "bg-nx-accent/70 hover:bg-nx-accent"
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Time Axis Labels (Every 2 Hours) */}
            <div
              className="flex justify-between px-1 font-mono text-[10px] text-nx-ink-3"
              dir="ltr"
            >
              {displayBuckets.map((b) => (
                <div key={b.hour} className="flex-1 truncate text-center">
                  {b.hour % 2 === 0 ? b.hour.toString().padStart(2, "0") : ""}
                </div>
              ))}
            </div>

            {/* Accessible Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-nx-ink-2">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-nx-accent" />
                <span>
                  {t("venueOverview.demandChart.scheduled", { defaultValue: "Scheduled demand" })}
                </span>
              </div>
              <span className="font-mono text-[10px] text-nx-ink-3">
                {t("venueOverview.demandChart.hoursRange", { defaultValue: "06:00 â€“ 23:00" })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
