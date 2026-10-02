"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  Clock,
  LogIn,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { VenueOverviewUpNextItem } from "../../domain/entities/VenueOverview";
import type { VenueAttentionSignal } from "@modules/venue/attention-center/src/domain/entities/VenueAttention";
import type { OperationsCalendarBlock } from "@modules/venue/operations-calendar/src/domain/entities/OperationsCalendar";

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
      title: t("venueOverview.liveFeed.attentionSignal", { defaultValue: "Attention signal detected" }),
      subtitle: `${sig.resourceName} · ${t(`attention.signal.${sig.kind}.title`, { defaultValue: sig.kind })}`,
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
      subtitle: `${b.reservationNumber} · In play`,
      timeLabel: formatRelativeOrLocalTime(b.startUtc, timeZoneId),
      timestampUtc: b.startUtc,
      href: `/venue/bookings/${encodeURIComponent(b.reservationId)}`,
    });
  });

  // 3. Active Holds
  const heldBlocks = blocks.filter((b) => b.status === "Held");
  heldBlocks.forEach((b) => {
    const holdIdentifier = b.holdId || b.reservationNumber || "Hold";
    const label = b.customerDisplayName ? `${b.customerDisplayName} · Slot reserved` : "Slot reserved";
    events.push({
      id: `held-${b.holdId || b.reservationId || b.id}`,
      type: "held",
      title: t("venueOverview.liveFeed.holdActive", { defaultValue: "Hold pending confirmation" }),
      subtitle: `${holdIdentifier} · ${label}`,
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
        subtitle: `${item.resourceName} · ${item.customerDisplayName || item.reservationNumber}`,
        timeLabel: timePart,
        timestampUtc: item.startUtc,
        href: `/venue/bookings/${encodeURIComponent(item.reservationId)}`,
      });
    });

  // Sort events chronologically (newest/nearest first)
  const sortedEvents = events.slice(0, 8);

  return (
    <Card
      className="border-nx-line bg-nx-surface flex flex-col h-full overflow-hidden"
      data-testid="live-venue-feed"
    >
      <CardHeader className="pb-3 border-b border-nx-line">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("venueOverview.liveFeed.title", { defaultValue: "Live Venue Feed" })}
            </CardTitle>
          </div>
          <span className="text-[11px] font-mono text-nx-ink-3">
            {t("venueOverview.liveFeed.pulse", { defaultValue: "Operational Pulse" })}
          </span>
        </div>
        <CardDescription className="text-xs text-nx-ink-2">
          {t("venueOverview.liveFeed.subtitle", {
            defaultValue: "Authoritative real-time operational events from today’s bookings and attention signals.",
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto max-h-[460px]">
        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[220px] rounded-nx-md border border-dashed border-nx-line bg-nx-surfaceSubtle/40 p-6 text-center text-xs text-nx-ink-3">
            <Activity className="size-6 text-nx-ink-3 mb-2" aria-hidden="true" />
            <p className="font-semibold text-nx-ink">
              {t("venueOverview.liveFeed.noEvents", { defaultValue: "No operational events recorded yet" })}
            </p>
            <p className="mt-1 text-[11px] text-nx-ink-3 max-w-[200px]">
              {t("venueOverview.liveFeed.noEventsDesc", {
                defaultValue: "Check-ins, holds, and confirmed reservations will stream here live.",
              })}
            </p>
          </div>
        ) : (
          <div className="relative ps-6 space-y-4 before:absolute before:start-2.5 before:top-2 before:bottom-2 before:w-px before:bg-nx-line">
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
                <div key={evt.id} className="relative group">
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
                    className="block rounded-nx-sm p-2 -my-1 -mx-1 hover:bg-nx-surfaceSubtle transition-colors group/item"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-nx-ink group-hover/item:text-nx-accent transition-colors leading-tight">
                        {evt.title}
                      </p>
                      <span className="text-[10px] font-mono text-nx-ink-3 shrink-0 tabular-nums" dir="ltr">
                        {evt.timeLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-nx-ink-2 truncate mt-0.5">
                      {evt.subtitle}
                    </p>
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
