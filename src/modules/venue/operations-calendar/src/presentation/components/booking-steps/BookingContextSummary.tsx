"use client";

import Image from "next/image";
import { Button } from "@core/ui/button";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";

function getCourtImage(resourceName?: string, sportType?: string): string {
  const n = (resourceName || "").toLowerCase();
  const s = (sportType || "").toLowerCase();
  if (s.includes("5-a-side") || n.includes("5-a-side") || n.includes("5a")) {
    return "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80";
  }
  if (
    s.includes("foot") ||
    n.includes("foot") ||
    n.includes("pitch") ||
    s.includes("soccer") ||
    n.includes("turf")
  ) {
    return "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("tennis") || n.includes("tennis") || n.includes("clay") || n.includes("hardcourt")) {
    return "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("swim") || n.includes("swim") || n.includes("pool") || n.includes("lane") || s.includes("aqua")) {
    return "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("squash") || n.includes("squash")) {
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("basket") || n.includes("basket") || n.includes("fieldhouse")) {
    return "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("badmin") || n.includes("badmin")) {
    return "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("volley") || n.includes("volley") || n.includes("beach")) {
    return "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80";
  }
  if (
    s.includes("gym") ||
    s.includes("crossfit") ||
    s.includes("fit") ||
    n.includes("gym") ||
    n.includes("crossfit")
  ) {
    return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("run") || s.includes("track") || s.includes("athletic") || n.includes("track")) {
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80";
  }
  if (n.includes("outdoor") || s.includes("outdoor") || n.includes("panoramic")) {
    return "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("padel") || n.includes("padel")) {
    return "https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&w=1200&q=80";
  }
  return "/images/venue/padel-court-indoor.svg";
}

interface BookingContextSummaryProps {
  resource: CalendarResource;
  isContextual: boolean;
  duration: number;
  dateDisplay: string;
  timeRange: string;
  onChangeCourt: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Compact selected court + slot summary banner rendered in Customer & Confirm steps.
 */
export function BookingContextSummary({
  resource,
  isContextual,
  duration,
  dateDisplay,
  timeRange,
  onChangeCourt,
  t,
}: BookingContextSummaryProps) {
  return (
    <div className="flex items-center gap-3 rounded-nx-lg border border-nx-line bg-nx-raised/40 p-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-nx-control border border-nx-line bg-nx-surface">
        <Image
          src={getCourtImage(resource.name)}
          alt={resource.name}
          fill
          sizes="48px"
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nx-ground/60 via-transparent to-transparent" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="truncate text-xs font-bold text-nx-ink">{resource.name}</h4>
          {!isContextual && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onChangeCourt}
              className="h-auto px-0 text-[11px] font-semibold text-nx-accent hover:underline"
            >
              {t("operationsCalendar.clickToBook.context.change")}
            </Button>
          )}
        </div>
        <p className="truncate text-[11px] text-nx-ink-2">{resource.facilityName}</p>
        <p className="mt-0.5 text-[11px] font-medium text-nx-ink">
          {dateDisplay} • {timeRange} (
          {t("operationsCalendar.clickToBook.context.durationMins", { duration })})
        </p>
      </div>
    </div>
  );
}
