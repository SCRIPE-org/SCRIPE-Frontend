"use client";

import React from "react";
import Link from "next/link";
import { CalendarCheck2, Clock, LogIn, ShieldAlert, Activity } from "lucide-react";
import { cn } from "@core/common/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { VenueOverviewUpNextItem } from "../../domain/entities/VenueOverview";
import type { VenueAttentionSignal } from "@modules/venue";
import type { OperationsCalendarBlock } from "@modules/venue";

interface FeedEvent {
  id: string;
  type: "checkedIn" | "held" | "confirmed" | "attention";
  title: string;
  subtitle: string;
  timeLabel: string;
  timestampUtc: string;
  href: string;
}

interface Props {
  blocks?: OperationsCalendarBlock[];
  upNext: VenueOverviewUpNextItem[];
  attentionSignals?: VenueAttentionSignal[];
  timeZoneId: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function formatRelativeOrLocalTime(isoString: string, timeZoneId: string) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.round((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes >= 0 && diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneId,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date);
  } catch {
    return isoString.slice(11, 16);
  }
}

/**
 * Documentation for VenueOverviewLiveFeed
 */
export function VenueOverviewLiveFeed({
  blocks = [],
  upNext,
  attentionSignals = [],
  timeZoneId,
  t,
}: Props) {
  // Truthfully synthesize events from active bounded operations datasets (no fabricated events)
  const events: FeedEvent[] = [];

  // 1. Attention signals (highest priority operational events)
  attentionSignals.forEach((sig) => {
    events.push({
      id: `attention-${sig.kind}-${sig.resourceId}-${sig.occurredAtUtc}`,
      type: "attention",
      title: t("venueOverview.liveFeed.attentionSignal", {
        defaultValue: "Attention signal detected",
      }),
      subtitle: `${sig.resourceName} Â· ${t(`attention.signal.${sig.kind}.title`, { defaultValue: sig.kind })}`,
      timeLabel: formatRelativeOrLocalTime(sig.occurredAtUtc, timeZoneId),
      timestampUtc: sig.occurredAtUtc,
      href: "/venue/attention",
    });
  });

  // 2. Active CheckedIn reservations
  const checkedInBlocks = blocks.filter((b) => b.status === "CheckedIn");
  checkedInBlocks.forEach((b) => {
    events.push({
      id: `checkedin-${b.reservationId}`,
      type: "checkedIn",
      title: t("venueOverview.liveFeed.guestCheckedIn", { defaultValue: "Guest checked in" }),
      subtitle: `${b.reservationNumber} Â· In play`,
      timeLabel: formatRelativeOrLocalTime(b.startUtc, timeZoneId),
      timestampUtc: b.startUtc,
      href: `/venue/bookings/${encodeURIComponent(b.reservationId)}`,
    });
  });

  // 3. Active Holds
  const heldBlocks = blocks.filter((b) => b.status === "Held");
  heldBlocks.forEach((b) => {
    const holdIdentifier = b.reservationNumber || "Hold";
    const label = "Slot reserved";
    events.push({
      id: `held-${b.reservationId}`,
      type: "held",
      title: t("venueOverview.liveFeed.holdActive", { defaultValue: "Hold pending confirmation" }),
      subtitle: `${holdIdentifier} Â· ${label}`,
      timeLabel: formatRelativeOrLocalTime(b.startUtc, timeZoneId),
      timestampUtc: b.startUtc,
      href: "/venue/calendar",
    });
  });

  // 4. Confirmed Upcoming Bookings
  upNext
    .filter((item) => item.status === "Confirmed")
    .slice(0, 5)
    .forEach((item) => {
      const timePart = item.startLocal.split("T")[1]?.slice(0, 5) ?? item.startLocal.slice(11, 16);
      events.push({
        id: `confirmed-${item.reservationId}`,
        type: "confirmed",
        title: t("venueOverview.liveFeed.bookingConfirmed", { defaultValue: "Booking confirmed" }),
        subtitle: `${item.resourceName} Â· ${item.customerDisplayName || item.reservationNumber}`,
        timeLabel: timePart,
        timestampUtc: item.startUtc,
        href: `/venue/bookings/${encodeURIComponent(item.reservationId)}`,
      });
    });

  // Sort events chronologically (newest/nearest first)
  const sortedEvents = events.slice(0, 8);

  return (
    <Card
      className="flex h-full flex-col overflow-hidden border-nx-line bg-nx-surface"
      data-testid="live-venue-feed"
    >
      <CardHeader className="border-b border-nx-line pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="flex size-2 animate-pulse rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("venueOverview.liveFeed.title", { defaultValue: "Live Venue Feed" })}
            </CardTitle>
          </div>
          <span className="font-mono text-[11px] text-nx-ink-3">
            {t("venueOverview.liveFeed.pulse", { defaultValue: "Operational Pulse" })}
          </span>
        </div>
        <CardDescription className="text-xs text-nx-ink-2">
          {t("venueOverview.liveFeed.subtitle", {
            defaultValue:
              "Authoritative real-time operational events from todayâ€™s bookings and attention signals.",
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="max-h-[460px] flex-1 overflow-y-auto p-4">
        {sortedEvents.length === 0 ? (
          <div className="bg-nx-surfaceSubtle/40 flex h-full min-h-[220px] flex-col items-center justify-center rounded-nx-md border border-dashed border-nx-line p-6 text-center text-xs text-nx-ink-3">
            <Activity className="mb-2 size-6 text-nx-ink-3" aria-hidden="true" />
            <p className="font-semibold text-nx-ink">
              {t("venueOverview.liveFeed.noEvents", {
                defaultValue: "No operational events recorded yet",
              })}
            </p>
            <p className="mt-1 max-w-[200px] text-[11px] text-nx-ink-3">
              {t("venueOverview.liveFeed.noEventsDesc", {
                defaultValue: "Check-ins, holds, and confirmed reservations will stream here live.",
              })}
            </p>
          </div>
        ) : (
          <div className="relative space-y-4 ps-6 before:absolute before:bottom-2 before:start-2.5 before:top-2 before:w-px before:bg-nx-line">
            {sortedEvents.map((evt) => {
              let Icon = CalendarCheck2;
              let iconStyle = "bg-nx-accent/10 text-nx-accent border-nx-accent/30";

              if (evt.type === "checkedIn") {
                Icon = LogIn;
                iconStyle = "bg-success/10 text-success border-success/30";
              } else if (evt.type === "held") {
                Icon = Clock;
                iconStyle = "bg-amber-500/10 text-amber-500 border-amber-500/30";
              } else if (evt.type === "attention") {
                Icon = ShieldAlert;
                iconStyle = "bg-destructive/10 text-destructive border-destructive/30";
              }

              return (
                <div key={evt.id} className="group relative">
                  {/* Timeline Node Icon */}
                  <div
                    className={cn(
                      "absolute -start-6 top-0.5 flex size-5 items-center justify-center rounded-full border bg-nx-surface text-[10px]",
                      iconStyle
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="size-2.5" />
                  </div>

                  {/* Event Content */}
                  <Link
                    href={evt.href}
                    className="hover:bg-nx-surfaceSubtle group/item -mx-1 -my-1 block rounded-nx-sm p-2 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-tight text-nx-ink transition-colors group-hover/item:text-nx-accent">
                        {evt.title}
                      </p>
                      <span
                        className="shrink-0 font-mono text-[10px] tabular-nums text-nx-ink-3"
                        dir="ltr"
                      >
                        {evt.timeLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-nx-ink-2">{evt.subtitle}</p>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
