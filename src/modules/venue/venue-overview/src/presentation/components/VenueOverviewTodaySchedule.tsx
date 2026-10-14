"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@core/ui/card";
import type { VenueOverviewUpNextItem } from "../../domain/entities/VenueOverview";

interface Props {
  items: VenueOverviewUpNextItem[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewTodaySchedule({ items, t }: Props) {
  const displayItems = items.slice(0, 5);

  return (
    <div className="space-y-3" data-testid="venue-overview-today-schedule">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-nx-ink">
          {t("venueOverview.todaySchedule.title", { defaultValue: "Today's Schedule" })}
        </h2>
        <Link
          href="/venue/calendar"
          className="text-xs font-semibold text-nx-accent hover:underline"
        >
          {t("venueOverview.todaySchedule.viewAll", { defaultValue: "View All" })}
        </Link>
      </div>

      <Card className="divide-y divide-nx-line border border-nx-line bg-nx-surface rounded-nx-xl overflow-hidden shadow-xs">
        {displayItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-nx-ink-2">
            {t("venueOverview.todaySchedule.empty", { defaultValue: "No scheduled matches today" })}
          </div>
        ) : (
          displayItems.map((item, idx) => {
            const timePart =
              item.startLocal.split("T")[1]?.slice(0, 5) ||
              item.startLocal.slice(11, 16) ||
              "10:00";
            const isCheckedIn = item.status === "CheckedIn";
            const statusLabel = isCheckedIn ? "In Progress" : "Upcoming";
            const badgeClass = isCheckedIn
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
              : "bg-nx-accent/10 text-nx-accent border-nx-accent/20";

            return (
              <div
                key={item.reservationId || idx}
                className="flex items-center justify-between gap-3 p-3 hover:bg-nx-surfaceSubtle transition-colors"
              >
                {/* Time Pill */}
                <div className="shrink-0 px-2.5 py-1 rounded-md bg-nx-surfaceSubtle text-[11px] font-bold text-nx-ink-2">
                  {timePart}
                </div>

                {/* Court Name */}
                <div className="w-24 shrink-0 text-xs font-semibold text-nx-ink truncate">
                  {item.resourceName}
                </div>

                {/* Customer / Team */}
                <div className="min-w-0 flex-1 text-xs text-nx-ink-2 truncate">
                  {item.customerDisplayName
                    ? `${item.customerDisplayName} (${item.reservationNumber})`
                    : "Team Match"}
                </div>

                {/* Status Pill */}
                <div className="shrink-0">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
