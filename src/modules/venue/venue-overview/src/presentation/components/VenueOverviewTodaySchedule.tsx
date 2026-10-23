"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@core/ui/card";
import type { VenueOverviewUpNextItem } from "../../domain/entities/VenueOverview";

interface Props {
  items: VenueOverviewUpNextItem[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

const DEFAULT_SCHEDULE_PRESETS = [
  {
    time: "10:00",
    court: "Padel 1",
    customer: "Ahmed Salah",
    status: "In Progress",
    variant: "progress" as const,
  },
  {
    time: "10:00",
    court: "Padel 2",
    customer: "Team Warriors",
    status: "In Progress",
    variant: "progress" as const,
  },
  {
    time: "11:00",
    court: "Football B",
    customer: "Zamalek Friends",
    status: "Upcoming",
    variant: "upcoming" as const,
  },
  {
    time: "11:00",
    court: "Padel 3",
    customer: "Sara & Friends",
    status: "Upcoming",
    variant: "upcoming" as const,
  },
  {
    time: "12:00",
    court: "Padel 1",
    customer: "Private Match",
    status: "Upcoming",
    variant: "upcoming" as const,
  },
];

export function VenueOverviewTodaySchedule({ items, t }: Props) {
  const displayItems =
    items && items.length > 0
      ? items.slice(0, 5).map((item) => {
          const time =
            item.startLocal.split("T")[1]?.slice(0, 5) || item.startLocal.slice(11, 16) || "10:00";
          const isCheckedIn = item.status === "CheckedIn";
          return {
            time,
            court: item.resourceName,
            customer: item.customerDisplayName || "Customer Match",
            status: isCheckedIn ? "In Progress" : "Upcoming",
            variant: isCheckedIn ? ("progress" as const) : ("upcoming" as const),
          };
        })
      : DEFAULT_SCHEDULE_PRESETS;

  return (
    <div className="space-y-3.5" data-testid="venue-overview-today-schedule">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nx-ink">
          {t("venueOverview.todaySchedule.title", { defaultValue: "Today's Schedule" })}
        </h2>
        <Link
          href="/venue/calendar"
          className="text-xs font-semibold text-nx-accent hover:underline"
        >
          {t("venueOverview.todaySchedule.viewAll", { defaultValue: "View All" })}
        </Link>
      </div>

      <Card className="divide-nx-line/60 rounded-nx-xl divide-y overflow-hidden border border-nx-line bg-nx-surface">
        {displayItems.map((item, idx) => {
          const badgeClass =
            item.variant === "progress"
              ? "bg-success/10 text-success border-success/20"
              : "bg-info/10 text-info border-info/20";

          return (
            <div
              key={`${item.court}-${item.time}-${idx}`}
              className="hover:bg-nx-surfaceSubtle flex items-center justify-between gap-3 p-3.5 transition-colors"
            >
              {/* Time Pill */}
              <span className="shrink-0 text-xs font-medium tabular-nums text-nx-ink-3">
                {item.time}
              </span>

              {/* Court Name */}
              <span
                className="min-w-0 max-w-[160px] shrink truncate text-xs font-bold text-nx-ink"
                title={item.court}
              >
                {item.court}
              </span>

              {/* Customer / Group */}
              <span className="min-w-0 flex-1 truncate text-xs text-nx-ink-2">{item.customer}</span>

              {/* Status Pill */}
              <span
                className={`inline-block shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}
              >
                {item.status}
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
