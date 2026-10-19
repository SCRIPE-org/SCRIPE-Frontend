"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

interface CalendarToolbarProps {
  t: (key: string) => string;
  date: string;
  facilityId: string;
  timeZoneId: string;
  resourceId: string;
  facilities: Facility[];
  resources: CalendarResource[];
  timeZones: string[];
  loading: boolean;
  onDateChange: (value: string) => void;
  onFacilityChange: (value: string) => void;
  onTimeZoneChange: (value: string) => void;
  onResourceChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onRefresh: () => void;
  onBlockTime?: () => void;
  onNewBooking?: () => void;
  hasBookingReadyCourts?: boolean;
}

function valueOf(value: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function CalendarToolbar(props: CalendarToolbarProps) {
  const { t } = props;
  const actionsDisabled = props.hasBookingReadyCourts === false || props.resources.length === 0;

  const [showFilters, setShowFilters] = React.useState(true);

  // Format display date: "Wed, 16 Apr 2025"
  const formattedDisplayDate = React.useMemo(() => {
    try {
      const parts = props.date.split("-").map(Number);
      if (parts[0] && parts[1] && parts[2]) {
        const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
        return new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(d);
      }
      return props.date;
    } catch {
      return props.date;
    }
  }, [props.date]);

  return (
    <div className="flex flex-col gap-4 rounded-nx-xl border border-nx-line bg-nx-surface p-4 shadow-xs" data-testid="calendar-toolbar">
      {/* Top Main Bar matching reference design */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Date stepper & Navigation */}
        <div className="flex items-center gap-2">
          {/* Stepper Pill: < Today > */}
          <div className="flex items-center rounded-lg border border-nx-line bg-nx-surfaceSubtle p-0.5 text-xs font-semibold">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-nx-ink-2 hover:text-nx-ink"
              aria-label={t("operationsCalendar.toolbar.previous")}
              onClick={props.onPrevious}
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
            <button
              type="button"
              onClick={props.onToday}
              className="px-2.5 py-1 text-xs font-bold text-nx-ink hover:text-nx-accent transition-colors"
            >
              {t("operationsCalendar.toolbar.today") || "Today"}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-nx-ink-2 hover:text-nx-ink"
              aria-label={t("operationsCalendar.toolbar.next")}
              onClick={props.onNext}
            >
              <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </div>

          {/* Formatted Date Pill */}
          <div className="px-3 py-1.5 rounded-lg border border-nx-line bg-nx-surface text-xs font-bold text-nx-ink tracking-tight shadow-2xs">
            {formattedDisplayDate}
          </div>
        </div>

        {/* Right: Filter & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`h-8 gap-1.5 text-xs font-semibold border-nx-line transition-colors ${
              showFilters || Boolean(props.resourceId)
                ? "bg-nx-surfaceSubtle text-nx-ink font-bold border-nx-ink/20"
                : "text-nx-ink hover:bg-nx-surfaceSubtle"
            }`}
          >
            <SlidersHorizontal className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            <span>{t("operationsCalendar.toolbar.filter") || "Filter"}</span>
            {props.resourceId ? (
              <span className="size-1.5 rounded-full bg-nx-accent" />
            ) : null}
          </Button>

          {/* Block Time Action */}
          {props.onBlockTime && (
            <Button
              variant="outline"
              size="sm"
              disabled={actionsDisabled}
              onClick={props.onBlockTime}
              className="h-8 gap-1.5 text-xs font-semibold border-nx-line hover:bg-nx-surfaceSubtle"
            >
              <Clock className="size-3.5 text-amber-500" />
              <span className="hidden sm:inline">{t("operationsCalendar.toolbar.blockTime") || "Block Time"}</span>
            </Button>
          )}

          {/* + New Booking CTA in Canonical Signal Lime */}
          {props.onNewBooking ? (
            <Button
              size="sm"
              disabled={actionsDisabled}
              onClick={props.onNewBooking}
              className="h-8 gap-1.5 text-xs font-bold bg-nx-accent hover:bg-nx-accent/90 text-nx-accent-contrast shadow-sm px-3.5"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>{t("operationsCalendar.toolbar.newBooking") || "New Booking"}</span>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="h-8 gap-1.5 text-xs font-bold bg-nx-accent hover:bg-nx-accent/90 text-nx-accent-contrast shadow-sm px-3.5"
            >
              <Link href="/venue/calendar?newBooking=true">
                <Plus className="size-4" aria-hidden="true" />
                <span>{t("operationsCalendar.toolbar.newBooking") || "New Booking"}</span>
              </Link>
            </Button>
          )}

          {/* Refresh Icon */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 border-nx-line"
            disabled={props.loading}
            onClick={props.onRefresh}
            aria-label={t("operationsCalendar.toolbar.refresh")}
          >
            <RefreshCw className={`size-3.5 ${props.loading ? "animate-spin text-nx-accent" : "text-nx-ink-3"}`} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Filter Row: Facility, Court/Resource, Jump-to-Date, Timezone */}
      {showFilters && (
        <div className="grid gap-3 pt-3 border-t border-nx-line/60 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label id="calendar-facility-label" htmlFor="calendar-facility-select" className="text-xs font-bold text-nx-ink">
              {t("operationsCalendar.toolbar.facility") || "Facility"}
            </Label>
            <GenericSelect
              id="calendar-facility-select"
              aria-labelledby="calendar-facility-label"
              type="searchable"
              searchType="client"
              allowClear={false}
              options={props.facilities.map((item) => ({ value: item.id, label: item.name }))}
              value={props.facilityId}
              onValueChange={(value: string | string[]) => props.onFacilityChange(valueOf(value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label id="calendar-resource-label" htmlFor="calendar-resource-select" className="text-xs font-bold text-nx-ink">
              {t("operationsCalendar.toolbar.resource") || "Court / Space"}
            </Label>
            <GenericSelect
              id="calendar-resource-select"
              aria-labelledby="calendar-resource-label"
              type="searchable"
              searchType="client"
              placeholder={t("operationsCalendar.toolbar.allResources") || "All Courts"}
              options={props.resources.map((item) => ({ value: item.id, label: item.name }))}
              value={props.resourceId}
              onValueChange={(value: string | string[]) => props.onResourceChange(valueOf(value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="operations-calendar-date" className="text-xs font-bold text-nx-ink">
              {t("operationsCalendar.toolbar.date") || "Jump to Date"}
            </Label>
            <Input
              id="operations-calendar-date"
              type="date"
              value={props.date}
              onChange={(event) => props.onDateChange(event.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label id="calendar-timezone-label" htmlFor="calendar-timezone-select" className="text-xs font-bold text-nx-ink">
              {t("operationsCalendar.toolbar.timezone") || "Timezone"}
            </Label>
            <GenericSelect
              id="calendar-timezone-select"
              aria-labelledby="calendar-timezone-label"
              allowClear={false}
              options={props.timeZones.map((value) => ({ value, label: value }))}
              value={props.timeZoneId}
              onValueChange={(value: string | string[]) => props.onTimeZoneChange(valueOf(value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
