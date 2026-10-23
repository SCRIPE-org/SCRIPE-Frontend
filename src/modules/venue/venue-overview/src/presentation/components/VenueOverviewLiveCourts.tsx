"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { User, MoreHorizontal, Calendar, CalendarPlus, Sliders } from "lucide-react";
import type {
  VenueOverviewResourceActivityItem,
  VenueOverviewState,
} from "../../domain/entities/VenueOverview";

interface VenueOverviewLiveCourtsProps {
  items?: VenueOverviewResourceActivityItem[];
  overview?: VenueOverviewState | null;
  t: (key: string, options?: any) => string;
}

// Visual motif background colors for sports courts
const COURT_BG_GRADIENTS = [
  "linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)", // Padel Court Blue
  "linear-gradient(135deg, #065f46 0%, #059669 100%)", // Football Turf Green
  "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)", // Clay Court Orange
  "linear-gradient(135deg, #312e81 0%, #6366f1 100%)", // Indoor Wood/Navy
  "linear-gradient(135deg, #1e293b 0%, #475569 100%)", // Slate Multi-court
];

function getCourtBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COURT_BG_GRADIENTS[Math.abs(hash) % COURT_BG_GRADIENTS.length];
}

export function VenueOverviewLiveCourts({ items, overview, t }: VenueOverviewLiveCourtsProps) {
  const courts = items || overview?.resourceActivity || [];
  // Take up to 5 courts to show in the live strip
  const displayCourts = courts.slice(0, 5);

  return (
    <div className="space-y-3" data-testid="venue-overview-live-courts">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-nx-ink">
          {t("venueOverview.liveCourts.title", { defaultValue: "Live Courts" })}
        </h2>
        <Link
          href="/venue/resources"
          className="text-xs font-semibold text-nx-accent hover:underline"
        >
          {t("venueOverview.liveCourts.viewAll", { defaultValue: "View All" })}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayCourts.length === 0 ? (
          <div className="rounded-nx-xl col-span-full border border-nx-line bg-nx-surface py-8 text-center text-xs text-nx-ink-2">
            {t("venueOverview.liveCourts.noCourts", {
              defaultValue: "No active courts configured",
            })}
          </div>
        ) : (
          displayCourts.map((court: VenueOverviewResourceActivityItem, idx: number) => {
            const isCheckedIn = court.statusLabel === "checkedIn";
            const isNext = court.statusLabel === "nextBooking";
            const isMaintenance = court.statusLabel === ("maintenance" as string);

            let statusText = t("venueOverview.liveCourts.idle", {
              defaultValue: "No Current Booking",
            });
            let statusBadge = "bg-nx-surfaceSubtle text-nx-ink-2 border-nx-line";
            let timeText = t("venueOverview.resourceActivity.status.noActiveBooking", {
              defaultValue: "No Active Booking",
            });

            if (isCheckedIn && court.currentOrNextEndUtc) {
              statusText = t("venueOverview.liveCourts.inUse", { defaultValue: "In Use" });
              statusBadge =
                "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
              const time = court.currentOrNextEndUtc.slice(11, 16);
              timeText = t("venueOverview.liveCourts.until", {
                time,
                defaultValue: `Until ${time}`,
              });
            } else if (isNext && court.currentOrNextStartUtc) {
              statusText = t("venueOverview.liveCourts.booked", { defaultValue: "Booked" });
              statusBadge =
                "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
              const time = court.currentOrNextStartUtc.slice(11, 16);
              timeText = t("venueOverview.liveCourts.next", {
                time,
                defaultValue: `Next: ${time}`,
              });
            } else if (isMaintenance) {
              statusText = t("venueOverview.liveCourts.maintenance", {
                defaultValue: "Maintenance",
              });
              statusBadge =
                "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
              timeText = t("venueOverview.liveCourts.blocked", { defaultValue: "Blocked" });
            }

            const courtCalendarUrl = court.resourceId
              ? `/venue/calendar?resourceId=${encodeURIComponent(court.resourceId)}`
              : "/venue/calendar";
            const courtDetailUrl = court.resourceId
              ? `/venue/resources/${encodeURIComponent(court.resourceId)}`
              : "/venue/resources";
            const newBookingUrl = court.resourceId
              ? `/venue/calendar?newBooking=true&resourceId=${encodeURIComponent(court.resourceId)}`
              : "/venue/bookings/new";

            return (
              <Card
                key={court.resourceId || idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-nx-line bg-nx-surface shadow-xs transition-all hover:border-nx-line-hi hover:shadow-md"
              >
                {/* Court Thumbnail Image with Court Line Aesthetics — Clickable Link */}
                <Link
                  href={courtCalendarUrl}
                  className="relative flex h-20 w-full flex-col justify-between overflow-hidden p-2 transition-opacity group-hover:opacity-95"
                  style={{ background: getCourtBg(court.resourceName) }}
                  title={t("venueOverview.liveCourts.openCalendar", { defaultValue: "Open on Calendar" })}
                >
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
                  {/* Subtle sports court line markings */}
                  <div className="pointer-events-none absolute inset-x-2 inset-y-1 rounded-xs border border-white/20" />
                  <div className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 border-t border-white/20" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="rounded-xs bg-black/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-xs">
                      {court.resourceName.includes("Padel")
                        ? "Padel"
                        : court.resourceName.includes("Foot")
                          ? "Football"
                          : "Court"}
                    </span>
                  </div>
                </Link>

                {/* Court Info */}
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between gap-1.5 min-w-0">
                    <Link
                      href={courtDetailUrl}
                      className="truncate text-xs font-bold text-nx-ink flex-1 min-w-0 hover:text-nx-accent hover:underline"
                      title={court.resourceName}
                    >
                      {court.resourceName}
                    </Link>

                    {/* Functional 3-Dots Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="size-6 shrink-0 rounded-xs p-1 text-nx-ink-3 hover:bg-nx-raised hover:text-nx-ink"
                          aria-label={t("venueOverview.liveCourts.options", {
                            defaultValue: "Options for {{name}}",
                            name: court.resourceName,
                          })}
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase text-nx-ink-3">
                          {court.resourceName}
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={courtCalendarUrl} className="cursor-pointer gap-2">
                            <Calendar className="size-3.5" />
                            <span>{t("venueOverview.liveCourts.viewCalendar", { defaultValue: "View on Calendar" })}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={newBookingUrl} className="cursor-pointer gap-2">
                            <CalendarPlus className="size-3.5" />
                            <span>{t("venueOverview.liveCourts.bookNow", { defaultValue: "Book This Court" })}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={courtDetailUrl} className="cursor-pointer gap-2">
                            <Sliders className="size-3.5" />
                            <span>{t("venueOverview.liveCourts.courtDetails", { defaultValue: "Court Settings" })}</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Pill */}
                  <div>
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusBadge}`}
                    >
                      {statusText}
                    </span>
                  </div>

                  {/* Time info */}
                  <div className="truncate text-[11px] font-medium text-nx-ink-2">{timeText}</div>

                  <div className="flex items-center gap-1.5 truncate border-t border-nx-line pt-1 text-[11px] text-nx-ink-2">
                    <User className="size-3 shrink-0 text-nx-ink-3" />
                    <span className="truncate">
                      {isCheckedIn
                        ? t("venueOverview.liveCourts.activeNow", { defaultValue: "Active Match" })
                        : isNext
                          ? t("venueOverview.liveCourts.reserved", { defaultValue: "Reserved" })
                          : "—"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}