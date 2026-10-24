"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { User, MoreHorizontal, Calendar, CalendarPlus, Sliders, Eye } from "lucide-react";
import type {
  VenueOverviewResourceActivityItem,
  VenueOverviewState,
} from "../../domain/entities/VenueOverview";

interface VenueOverviewLiveCourtsProps {
  items?: VenueOverviewResourceActivityItem[];
  overview?: VenueOverviewState | null;
  t: (key: string, options?: any) => string;
}

interface SportBadgeInfo {
  label: string;
  gradient: string;
}

function resolveSportBadge(name: string): SportBadgeInfo {
  const n = name.toLowerCase();
  if (n.includes("padel")) {
    return { label: "Padel", gradient: "linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)" };
  }
  if (n.includes("tennis") || n.includes("clay") || n.includes("hardcourt")) {
    return { label: "Tennis", gradient: "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)" };
  }
  if (n.includes("squash")) {
    return { label: "Squash", gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)" };
  }
  if (
    n.includes("pool") ||
    n.includes("swimming") ||
    n.includes("lane") ||
    n.includes("aquatic") ||
    n.includes("hydro")
  ) {
    return { label: "Swimming", gradient: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)" };
  }
  if (n.includes("basket") || n.includes("hoop") || n.includes("arena")) {
    return { label: "Basketball", gradient: "linear-gradient(135deg, #9a3412 0%, #f97316 100%)" };
  }
  if (n.includes("track") || n.includes("running") || n.includes("athletic")) {
    return { label: "Athletics", gradient: "linear-gradient(135deg, #831843 0%, #db2777 100%)" };
  }
  if (
    n.includes("gym") ||
    n.includes("crossfit") ||
    n.includes("fitness") ||
    n.includes("conditioning")
  ) {
    return { label: "Fitness & Gym", gradient: "linear-gradient(135deg, #18181b 0%, #3f3f46 100%)" };
  }
  if (n.includes("volley")) {
    return { label: "Volleyball", gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)" };
  }
  if (n.includes("badminton")) {
    return { label: "Badminton", gradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)" };
  }
  if (n.includes("table tennis")) {
    return { label: "Table Tennis", gradient: "linear-gradient(135deg, #047857 0%, #10b981 100%)" };
  }
  if (n.includes("handball")) {
    return { label: "Handball", gradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" };
  }
  if (
    n.includes("martial") ||
    n.includes("judo") ||
    n.includes("dojo") ||
    n.includes("boxing")
  ) {
    return { label: "Martial Arts", gradient: "linear-gradient(135deg, #701a75 0%, #a21caf 100%)" };
  }
  if (n.includes("5-a-side") || n.includes("5a")) {
    return { label: "5-a-side", gradient: "linear-gradient(135deg, #064e3b 0%, #059669 100%)" };
  }
  if (n.includes("7-a-side") || n.includes("7a")) {
    return { label: "7-a-side", gradient: "linear-gradient(135deg, #065f46 0%, #10b981 100%)" };
  }
  if (
    n.includes("foot") ||
    n.includes("pitch") ||
    n.includes("turf") ||
    n.includes("stadium")
  ) {
    return { label: "Football", gradient: "linear-gradient(135deg, #065f46 0%, #059669 100%)" };
  }
  return { label: "Court", gradient: "linear-gradient(135deg, #1e293b 0%, #475569 100%)" };
}

function computeElapsedPercent(startUtc?: string | null, endUtc?: string | null): number {
  if (!startUtc || !endUtc) return 50;
  const startMs = new Date(startUtc).getTime();
  const endMs = new Date(endUtc).getTime();
  if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return 50;
  const nowMs = Date.now();
  const pct = Math.round(((nowMs - startMs) / (endMs - startMs)) * 100);
  return Math.min(100, Math.max(5, pct));
}

export function VenueOverviewLiveCourts({ items, overview, t }: VenueOverviewLiveCourtsProps) {
  const router = useRouter();
  const courts = items || overview?.resourceActivity || [];

  // Sort by operational priority: 1. In-Use match (checkedIn) -> 2. Upcoming booked -> 3. Maintenance -> 4. Idle
  const sortedCourts = [...courts].sort((a, b) => {
    const priority = (s: string) => {
      if (s === "checkedIn") return 0;
      if (s === "nextBooking") return 1;
      if (s === "maintenance") return 2;
      return 3;
    };
    return priority(a.statusLabel) - priority(b.statusLabel);
  });

  // Take up to 12 live courts to show in the live grid
  const displayCourts = sortedCourts.slice(0, 12);

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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
            const sportInfo = resolveSportBadge(court.resourceName);

            let statusText = t("venueOverview.liveCourts.idle", {
              defaultValue: "No Current Booking",
            });
            let statusBadge = "bg-nx-surfaceSubtle text-nx-ink-2 border-nx-line";
            let timeText = t("venueOverview.resourceActivity.status.noActiveBooking", {
              defaultValue: "No Active Booking",
            });

            if (isCheckedIn && court.currentOrNextEndUtc) {
              statusText = t("venueOverview.liveCourts.inUse", { defaultValue: "In Use" });
              statusBadge = "bg-success/10 text-success border-success/20";
              const time = court.currentOrNextEndUtc.slice(11, 16);
              timeText = t("venueOverview.liveCourts.until", {
                time,
                defaultValue: `Until ${time}`,
              });
            } else if (isNext && court.currentOrNextStartUtc) {
              statusText = t("venueOverview.liveCourts.booked", { defaultValue: "Booked" });
              statusBadge = "bg-info/10 text-info border-info/20";
              const time = court.currentOrNextStartUtc.slice(11, 16);
              timeText = t("venueOverview.liveCourts.next", {
                time,
                defaultValue: `Next: ${time}`,
              });
            } else if (isMaintenance) {
              statusText = t("venueOverview.liveCourts.maintenance", {
                defaultValue: "Maintenance",
              });
              statusBadge = "bg-warning/10 text-warning border-warning/20";
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
            const booking360Url = court.activeReservationId
              ? `/venue/bookings/${encodeURIComponent(court.activeReservationId)}`
              : null;

            const elapsedPercent = computeElapsedPercent(
              court.currentOrNextStartUtc,
              court.currentOrNextEndUtc
            );
            const resolvedCustomerName =
              court.customerDisplayName ||
              overview?.upNext?.find(
                (u) =>
                  u.resourceId === court.resourceId ||
                  (court.activeReservationId && u.reservationId === court.activeReservationId)
              )?.customerDisplayName ||
              (court.reservationNumber ? `#${court.reservationNumber}` : null);

            return (
              <Card
                key={court.resourceId || idx}
                onClick={() => router.push(courtCalendarUrl)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-nx-line bg-nx-surface transition-all hover:border-nx-line-hi hover:bg-nx-raised/40 cursor-pointer"
              >
                {/* Court Header: Clean Architectural Sport Header */}
                <div className="relative flex h-14 w-full items-center justify-between border-b border-nx-line bg-nx-raised/40 px-3 py-2">
                  <span className="inline-flex items-center rounded border border-nx-line bg-nx-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-nx-ink">
                    {sportInfo.label}
                  </span>
                  {isCheckedIn ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                      <span className="size-1.5 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
                      LIVE
                    </span>
                  ) : isNext ? (
                    <span className="inline-flex items-center rounded-full border border-info/20 bg-info/10 px-2 py-0.5 text-[10px] font-semibold text-info">
                      BOOKED
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-nx-line bg-nx-surfaceSubtle px-2 py-0.5 text-[10px] font-medium text-nx-ink-3">
                      IDLE
                    </span>
                  )}
                </div>

                {/* Court Info */}
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between gap-1.5 min-w-0">
                    <span
                      className="truncate text-xs font-bold text-nx-ink flex-1 min-w-0 group-hover:text-nx-accent"
                      title={court.resourceName}
                    >
                      {court.resourceName}
                    </span>

                    {/* Functional 3-Dots Dropdown Menu */}
                    <div onClick={(e) => e.stopPropagation()}>
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
                        {booking360Url && (
                          <DropdownMenuItem asChild>
                            <Link href={booking360Url} className="cursor-pointer gap-2 text-nx-accent">
                              <Eye className="size-3.5" />
                              <span>
                                {t("venueOverview.liveCourts.viewBooking", {
                                  defaultValue: "Booking 360",
                                })}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={courtCalendarUrl} className="cursor-pointer gap-2">
                            <Calendar className="size-3.5" />
                            <span>
                              {t("venueOverview.liveCourts.viewCalendar", {
                                defaultValue: "View on Calendar",
                              })}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={newBookingUrl} className="cursor-pointer gap-2">
                            <CalendarPlus className="size-3.5" />
                            <span>
                              {t("venueOverview.liveCourts.bookNow", {
                                defaultValue: "Book This Court",
                              })}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={courtDetailUrl} className="cursor-pointer gap-2">
                            <Sliders className="size-3.5" />
                            <span>
                              {t("venueOverview.liveCourts.courtDetails", {
                                defaultValue: "Court Settings",
                              })}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>

                  {/* Status Pill & Match Progress */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusBadge}`}
                    >
                      {isCheckedIn && (
                        <span className="size-1.5 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
                      )}
                      {statusText}
                    </span>
                    {isCheckedIn && (
                      <span className="font-mono text-[10px] font-semibold text-success">
                        {elapsedPercent}%
                      </span>
                    )}
                  </div>

                  {/* Occupancy Timeline Progress Bar for In-Use Courts */}
                  {isCheckedIn && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-nx-raised-2">
                      <div
                        className="h-full rounded-full bg-success transition-all duration-500"
                        style={{ width: `${elapsedPercent}%` }}
                      />
                    </div>
                  )}

                  {/* Time info */}
                  <div className="truncate text-[11px] font-medium text-nx-ink-2">{timeText}</div>

                  {/* Customer / Match Details */}
                  <div className="flex items-center gap-1.5 truncate border-t border-nx-line pt-1 text-[11px] text-nx-ink-2">
                    <User className="size-3 shrink-0 text-nx-ink-3" />
                    <span className="truncate font-medium" title={resolvedCustomerName || undefined}>
                      {resolvedCustomerName ||
                        (isCheckedIn
                          ? t("venueOverview.liveCourts.activeNow", { defaultValue: "Active Match" })
                          : isNext
                            ? t("venueOverview.liveCourts.reserved", { defaultValue: "Reserved" })
                            : "—")}
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