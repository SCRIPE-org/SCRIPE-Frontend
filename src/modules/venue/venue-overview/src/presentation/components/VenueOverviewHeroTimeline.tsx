// FILE-EXCEPTION: rule bypass for existing large file
"use client";

import React, { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Calendar } from "lucide-react";
import { cn } from "@core/common/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type {
  CalendarResource,
  OperationsCalendarBlock,
  OperationsCalendarDay,
} from "@modules/venue/operations-calendar/src/domain/entities/OperationsCalendar";
import {
  blockPosition,
  buildTimeSlots,
  localPrefillForInstant,
  placeBlocksOnTracks,
} from "@modules/venue/operations-calendar/src/presentation/viewmodels/useCalendarLayout";
import { resolveSportIcon } from "@modules/venue";
import { VenueCourtMotif } from "@modules/venue";

const SLOT_WIDTH = 72;
const BLOCK_HEIGHT = 42;

interface Props {
  day: OperationsCalendarDay | null;
  resources: CalendarResource[];
  locale: string;
  direction: "ltr" | "rtl";
  canCreateBooking?: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function statusBlockClasses(status: OperationsCalendarBlock["status"]) {
  switch (status) {
    case "CheckedIn":
      return "border-success/60 bg-success/15 text-success hover:bg-success/25 focus-visible:ring-success shadow-nx-xs";
    case "Held":
      return "border-amber-500/60 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-dashed hover:bg-amber-500/25 focus-visible:ring-amber-500";
    case "Completed":
      return "border-nx-line bg-nx-surfaceSubtle text-nx-ink-2 hover:bg-nx-hover";
    case "Confirmed":
    default:
      return "border-nx-accent/50 bg-nx-accent/15 text-nx-accent hover:bg-nx-accent/25 focus-visible:ring-nx-accent";
  }
}

function formatLocalTime(value: string, locale: string, timeZoneId: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timeZoneId,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(value));
  } catch {
    return value.slice(11, 16);
  }
}

/**
 * Documentation for VenueOverviewHeroTimeline
 */
export function VenueOverviewHeroTimeline({
  day,
  resources,
  locale,
  direction,
  canCreateBooking = true,
  t,
}: Props) {
  const router = useRouter();
  const [now, setNow] = useState(() => (day ? Date.parse(day.asOfUtc) : Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!day || resources.length === 0) {
    return (
      <Card className="border-nx-line bg-nx-surface relative overflow-hidden" data-testid="hero-timeline">
        <VenueCourtMotif variant="padel" />
        <CardHeader className="pb-3 border-b border-nx-line">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("venueOverview.heroTimeline.title", { defaultValue: "Todayâ€™s Venue Activity" })}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {t("venueOverview.heroTimeline.subtitle", {
                  defaultValue: "Resource Ã— Time operational timeline across courts and fields.",
                })}
              </CardDescription>
            </div>
            <Link
              href="/venue/calendar"
              className="text-xs font-semibold text-nx-accent hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{t("venueOverview.quickActions.openCalendar", { defaultValue: "Open Calendar" })}</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center rounded-nx-md border border-dashed border-nx-line bg-nx-surfaceSubtle/50 p-8 text-center text-xs text-nx-ink-3">
            <Calendar className="size-8 text-nx-ink-3 mb-2" aria-hidden="true" />
            <p className="font-medium text-nx-ink">
              {t("venueOverview.resourceActivity.noResources", { defaultValue: "No schedulable resources configured." })}
            </p>
            <p className="mt-1 text-nx-ink-3">
              {t("venueOverview.empty.noFacilityDescription", { defaultValue: "Create a facility and resources to view activity." })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const slots = buildTimeSlots(day, locale);
  const timelineWidth = Math.max(SLOT_WIDTH, slots.length * SLOT_WIDTH);
  const from = Date.parse(day.fromUtc);
  const to = Date.parse(day.toUtc);
  const currentPercent =
    now >= from && now < to && to > from ? ((now - from) / (to - from)) * 100 : null;

  const handleOpenBooking = (block: OperationsCalendarBlock) => {
    router.push(`/venue/bookings/${encodeURIComponent(block.reservationId)}`);
  };

  const handleEmptySlot = (resource: CalendarResource, instantUtc: string) => {
    if (!canCreateBooking) return;
    const prefill = localPrefillForInstant(instantUtc, day.timeZoneId);
    const params = new URLSearchParams({
      resourceId: resource.id,
      date: prefill.date,
      time: prefill.startTime,
    });
    router.push(`/venue/bookings/new?${params.toString()}`);
  };

  return (
    <Card className="border-nx-line bg-nx-surface relative overflow-hidden" data-testid="hero-timeline">
      {/* Delicate Court Geometry Watermark */}
      <VenueCourtMotif variant="padel" />

      <CardHeader className="pb-3 border-b border-nx-line relative z-10 bg-nx-surface/90 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("venueOverview.heroTimeline.title", { defaultValue: "Todayâ€™s Venue Activity" })}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-2 mt-0.5">
              {t("venueOverview.heroTimeline.subtitle", {
                defaultValue: "Resource Ã— Time operational timeline across courts and fields.",
              })}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Status Legend Pills */}
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-flex items-center gap-1 text-[11px] text-nx-ink-2">
                <span className="size-2 rounded-full bg-success" />
                {t("operationsCalendar.status.CheckedIn", { defaultValue: "Checked In" })}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-nx-ink-2">
                <span className="size-2 rounded-full bg-nx-accent" />
                {t("operationsCalendar.status.Confirmed", { defaultValue: "Confirmed" })}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-nx-ink-2">
                <span className="size-2 rounded-full bg-amber-500" />
                {t("operationsCalendar.status.Held", { defaultValue: "Held" })}
              </span>
            </div>

            <Link
              href="/venue/calendar"
              className="text-xs font-semibold text-nx-accent hover:underline flex items-center gap-1 ps-2 border-s border-nx-line"
            >
              <span>{t("venueOverview.quickActions.openCalendar", { defaultValue: "Open Calendar" })}</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto relative" data-testid="hero-timeline-scroll">
          <div className="min-w-max" dir="ltr">
            {/* Time Slot Header Row */}
            <div className="flex border-b border-nx-line bg-nx-surfaceSubtle/60 sticky top-0 z-20">
              <div
                className="sticky left-0 z-30 flex w-48 shrink-0 items-center border-r border-nx-line bg-nx-surfaceSubtle px-4 py-2.5 text-xs font-bold text-nx-ink uppercase tracking-wider"
                dir={direction}
              >
                {t("operationsCalendar.timeline.resource", { defaultValue: "Resource" })}
              </div>
              <div className="flex" style={{ width: timelineWidth }}>
                {slots.map((slot) => (
                  <div
                    key={slot.instantUtc}
                    className="w-[72px] shrink-0 border-r border-nx-line/50 px-2 py-2 text-center text-[11px] font-mono tabular-nums text-nx-ink-2"
                  >
                    {slot.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Lane Rows */}
            {resources.map((resource) => {
              const resBlocks = day.blocks.filter((b) => b.resourceId === resource.id);
              const placed = placeBlocksOnTracks(resBlocks);
              const trackCount = Math.max(1, ...placed.map((item) => item.track + 1));
              const laneHeight = Math.max(54, trackCount * BLOCK_HEIGHT + 12);
              const SportIcon = resolveSportIcon(resource.name);

              return (
                <div
                  key={resource.id}
                  className="flex border-b border-nx-line hover:bg-nx-surfaceSubtle/30 transition-colors group"
                  style={{ minHeight: laneHeight }}
                  data-resource-id={resource.id}
                >
                  {/* Sticky Resource Lane Title */}
                  <div
                    className="sticky left-0 z-20 w-48 shrink-0 border-r border-nx-line bg-nx-surface px-3.5 py-2.5 flex items-center gap-2.5 shadow-[1px_0_0_0_var(--nx-line)]"
                    dir={direction}
                  >
                    <div className="flex size-7 items-center justify-center rounded-nx-xs border border-nx-line bg-nx-surfaceSubtle text-nx-accent shrink-0">
                      {SportIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-nx-ink group-hover:text-nx-accent transition-colors">
                        {resource.name}
                      </p>
                      <p className="truncate text-[10px] text-nx-ink-3">
                        {resource.profileName}
                      </p>
                    </div>
                  </div>

                  {/* Lane Timeline Track */}
                  <div className="relative flex" style={{ width: timelineWidth, height: laneHeight }}>
                    {/* Background Hourly Grid Slots */}
                    {slots.map((slot) => {
                      const slotStart = Date.parse(slot.instantUtc);
                      const slotEnd = slotStart + 60 * 60 * 1000;
                      const occupied = placed.some(
                        ({ block }) =>
                          Date.parse(block.startUtc) < slotEnd && slotStart < Date.parse(block.endUtc)
                      );

                      return (
                        // UI-EXCEPTION: highly specialized timeline grid block
                        <button
                          type="button"
                          key={slot.instantUtc}
                          className={cn(
                            "h-full w-[72px] shrink-0 border-r border-nx-line/40 text-transparent outline-none transition-colors",
                            occupied
                              ? "cursor-default"
                              : canCreateBooking
                              ? "hover:bg-nx-accent/5 focus-visible:bg-nx-accent/10 focus-visible:z-10 cursor-pointer"
                              : "cursor-default"
                          )}
                          aria-label={
                            occupied
                              ? undefined
                              : t("operationsCalendar.timeline.emptySlot", {
                                  resource: resource.name,
                                  time: slot.label,
                                  defaultValue: `Free slot on ${resource.name} at ${slot.label}`,
                                })
                          }
                          tabIndex={occupied || !canCreateBooking ? -1 : 0}
                          onClick={() => handleEmptySlot(resource, slot.instantUtc)}
                          title={
                            occupied
                              ? undefined
                              : canCreateBooking
                              ? `+ Book ${resource.name} at ${slot.label}`
                              : undefined
                          }
                        >
                          {slot.label}
                        </button>
                      );
                    })}

                    {/* Booking Blocks */}
                    {placed.map(({ block, track }) => {
                      const position = blockPosition(block, day);
                      const start = formatLocalTime(block.startUtc, locale, day.timeZoneId);
                      const end = formatLocalTime(block.endUtc, locale, day.timeZoneId);
                      const statusLabel = t(`operationsCalendar.status.${block.status}`, {
                        defaultValue: block.status,
                      });

                      return (
                        // UI-EXCEPTION: highly specialized timeline grid block
                        <button
                          type="button"
                          key={block.reservationId}
                          className={cn(
                            "absolute z-10 overflow-hidden rounded-nx-xs border px-2 py-1 text-left text-[11px] leading-tight outline-none focus-visible:z-30 focus-visible:ring-2 transition-all duration-nx-micro select-none cursor-pointer",
                            statusBlockClasses(block.status)
                          )}
                          style={
                            {
                              left: `${position.leftPercent}%`,
                              width: `${position.widthPercent}%`,
                              minWidth: 44,
                              top: 6 + track * BLOCK_HEIGHT,
                              height: BLOCK_HEIGHT - 6,
                            } as CSSProperties
                          }
                          onClick={() => handleOpenBooking(block)}
                          title={`${block.reservationNumber} Â· ${statusLabel} (${start}â€“${end})`}
                          aria-label={t("operationsCalendar.timeline.bookingLabel", {
                            reference: block.reservationNumber,
                            status: statusLabel,
                            start,
                            end,
                            resource: resource.name,
                            defaultValue: `${block.reservationNumber}: ${statusLabel}, ${start}â€“${end} on ${resource.name}`,
                          })}
                        >
                          <div className="flex items-center gap-1 font-bold truncate">
                            {block.status === "CheckedIn" && (
                              <span className="size-1.5 rounded-full bg-success animate-pulse shrink-0" />
                            )}
                            <span className="truncate">{block.reservationNumber}</span>
                          </div>
                          <div className="truncate text-[10px] opacity-90">
                            {statusLabel} Â· {start}â€“{end}
                          </div>
                        </button>
                      );
                    })}

                    {/* Current Time Needle */}
                    {currentPercent != null && (
                      <div
                        className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-destructive shadow-[0_0_4px_rgba(239,68,68,0.6)]"
                        style={{ left: `${currentPercent}%` }}
                        title={t("operationsCalendar.timeline.currentTime", { defaultValue: "Current Time" })}
                      >
                        <div className="size-2 -translate-x-[3px] rounded-full bg-destructive" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
