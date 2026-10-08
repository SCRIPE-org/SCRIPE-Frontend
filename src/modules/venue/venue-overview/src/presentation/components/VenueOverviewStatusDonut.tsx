"use client";

import React from "react";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { Booking360Status } from "@modules/venue";
import type { VenueOverviewAtAGlanceItem } from "../../domain/entities/VenueOverview";

interface Props {
  items: VenueOverviewAtAGlanceItem[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

const STATUS_COLORS: Record<Booking360Status, { stroke: string; bg: string; text: string }> = {
  Confirmed: { stroke: "var(--nx-accent, #3b82f6)", bg: "bg-nx-accent", text: "text-nx-accent" },
  CheckedIn: { stroke: "#10b981", bg: "bg-emerald-500", text: "text-emerald-500" },
  Held: { stroke: "#f59e0b", bg: "bg-amber-500", text: "text-amber-500" },
  Completed: { stroke: "#64748b", bg: "bg-slate-500", text: "text-slate-500" },
  Cancelled: { stroke: "#ef4444", bg: "bg-rose-500", text: "text-rose-500" },
  NoShow: { stroke: "#8b5cf6", bg: "bg-purple-500", text: "text-purple-500" },
  Draft: { stroke: "#94a3b8", bg: "bg-slate-400", text: "text-slate-400" },
  Requested: { stroke: "#38bdf8", bg: "bg-sky-400", text: "text-sky-400" },
  PendingApproval: { stroke: "#f59e0b", bg: "bg-amber-500", text: "text-amber-500" },
  PartiallyFulfilled: { stroke: "#06b6d4", bg: "bg-cyan-500", text: "text-cyan-500" },
  Rejected: { stroke: "#ef4444", bg: "bg-rose-500", text: "text-rose-500" },
  Expired: { stroke: "#94a3b8", bg: "bg-slate-400", text: "text-slate-400" },
};

/** Human-readable labels for booking statuses â€” avoids cross-module i18n dependency */
const STATUS_LABELS: Record<Booking360Status, string> = {
  Confirmed: "Confirmed",
  CheckedIn: "Checked In",
  Held: "Held",
  Completed: "Completed",
  Cancelled: "Cancelled",
  NoShow: "No Show",
  Draft: "Draft",
  Requested: "Requested",
  PendingApproval: "Pending Approval",
  PartiallyFulfilled: "Partially Fulfilled",
  Rejected: "Rejected",
  Expired: "Expired",
};

/**
 * Documentation for module export
 */
export function VenueOverviewStatusDonut({ items, t }: Props) {
  const totalCount = items.reduce((acc, item) => acc + item.count, 0);

  // Calculate donut segments
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const filteredItems = items.filter((item) => item.count > 0);

  const segments = filteredItems.map((item, index) => {
    const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const previousPercentageSum = filteredItems
      .slice(0, index)
      .reduce((sum, prev) => sum + (totalCount > 0 ? (prev.count / totalCount) * 100 : 0), 0);
    const strokeDashoffset = -((previousPercentageSum / 100) * circumference);

    return {
      ...item,
      percentage: Math.round(percentage),
      strokeDasharray,
      strokeDashoffset,
      color: STATUS_COLORS[item.status] || STATUS_COLORS.Confirmed,
    };
  });

  return (
    <Card className="border-nx-line bg-nx-surface" data-testid="today-booking-status-card">
      <CardHeader className="border-b border-nx-line pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-nx-xs bg-nx-surfaceSubtle flex size-7 items-center justify-center border border-nx-line text-nx-accent">
              <PieChart className="size-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("venueOverview.statusDonut.title", { defaultValue: "Todayâ€™s Booking Status" })}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {t("venueOverview.statusDonut.subtitle", {
                  defaultValue: "Lifecycle status distribution of todayâ€™s reservations.",
                })}
              </CardDescription>
            </div>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums text-nx-ink">
            {totalCount} {t("venueOverview.demandChart.totalBookings", { defaultValue: "total" })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {totalCount === 0 ? (
          <div className="bg-nx-surfaceSubtle/50 flex h-52 items-center justify-center rounded-nx-sm border border-dashed border-nx-line p-6 text-center text-xs text-nx-ink-3">
            {t("venueOverview.atAGlance.noBookings", {
              defaultValue: "No booking activity recorded for today.",
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-between gap-6 py-2 sm:flex-row">
            {/* SVG Donut Chart */}
            <div className="relative flex size-36 shrink-0 items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  className="text-nx-line/40"
                  strokeWidth="12"
                />
                {/* Colored Segments */}
                {segments.map((seg) => (
                  <circle
                    key={seg.status}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={seg.color.stroke}
                    strokeWidth="12"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-nx-standard"
                  />
                ))}
              </svg>

              {/* Center Metrics */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold tabular-nums leading-none text-nx-ink">
                  {totalCount}
                </span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-nx-ink-3">
                  {t("venueOverview.statusDonut.bookings", { defaultValue: "Bookings" })}
                </span>
              </div>
            </div>

            {/* Breakdown Legend List */}
            <div className="w-full flex-1 space-y-2">
              {items
                .filter(
                  (item) =>
                    item.count > 0 ||
                    item.status === "Confirmed" ||
                    item.status === "CheckedIn" ||
                    item.status === "Held"
                )
                .map((item) => {
                  const colors = STATUS_COLORS[item.status] || STATUS_COLORS.Confirmed;
                  const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                  const label = STATUS_LABELS[item.status] || item.status;

                  return (
                    <div
                      key={item.status}
                      className="rounded-nx-xs hover:bg-nx-surfaceSubtle flex items-center justify-between p-1.5 text-xs transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`size-2.5 rounded-full ${colors.bg} shrink-0`} />
                        <span className="truncate font-medium text-nx-ink">{label}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 tabular-nums">
                        <span className="font-bold text-nx-ink">{item.count}</span>
                        <span
                          className="w-9 text-right font-mono text-[11px] text-nx-ink-3"
                          dir="ltr"
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
