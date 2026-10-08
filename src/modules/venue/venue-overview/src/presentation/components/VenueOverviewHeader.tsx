"use client";

import Link from "next/link";
import { Clock, RefreshCw, Building2, Plus, CalendarDays } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";

interface FacilityOption {
  id: string;
  name: string;
}

interface Props {
  facilityName: string;
  selectedFacilityId: string;
  facilities: FacilityOption[];
  timeZoneId: string;
  localDate: string;
  refreshing: boolean;
  onRefresh: () => void;
  onFacilityChange: (facilityId: string) => void;
  onBlockTime?: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function formatDisplayDate(dateStr: string, timeZoneId: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: timeZoneId || "UTC",
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}

/**
 * Documentation for VenueOverviewHeader
 */
export function VenueOverviewHeader({
  facilityName,
  selectedFacilityId,
  facilities,
  timeZoneId,
  localDate,
  refreshing,
  onRefresh,
  onFacilityChange,
  onBlockTime,
  t,
}: Props) {
  const formattedDate = formatDisplayDate(localDate, timeZoneId);

  return (
    <div
      className="mb-6 flex flex-col gap-4 border-b border-nx-line pb-4 lg:flex-row lg:items-center lg:justify-between"
      data-testid="venue-overview-header"
    >
      {/* Left Context: Title, Venue/Branch context, Date */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-nx-ink sm:text-2xl">
            {t("venueOverview.title", { defaultValue: "Venue Operations" })}
          </h1>
          {facilityName && (
            <Badge
              variant="outline"
              className="border-nx-line/80 bg-nx-surfaceSubtle px-2 py-0.5 text-xs font-semibold"
            >
              <Building2 className="me-1.5 size-3 text-nx-accent" aria-hidden="true" />
              <span>{facilityName}</span>
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-nx-ink-2">
          <span className="font-medium text-nx-ink">{formattedDate}</span>
          <span className="text-nx-line">Â·</span>
          <span
            className="inline-flex items-center gap-1 font-mono text-[11px] text-nx-ink-3"
            dir="ltr"
          >
            <Clock className="size-3" aria-hidden="true" />
            <span>{timeZoneId || "UTC"}</span>
          </span>
          <span className="text-nx-line">Â·</span>
          <span className="text-xs text-nx-ink-3">
            {t("venueOverview.subtitle", { defaultValue: "Sports Operations Console" })}
          </span>
        </div>
      </div>

      {/* Right Actions: Facility Switcher, Block Time, Record Payment, Calendar, Refresh, + New Booking CTA */}
      <div className="flex flex-wrap items-center gap-2">
        {facilities.length > 1 && (
          <Select value={selectedFacilityId} onValueChange={onFacilityChange}>
            <SelectTrigger
              className="h-8.5 w-auto min-w-[130px] bg-nx-surface text-xs"
              aria-label={t("venueOverview.header.facility", { defaultValue: "Facility" })}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-xs">
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Quick Action: Block Time */}
        {onBlockTime ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBlockTime}
            className="h-8.5 hover:bg-nx-surfaceSubtle gap-1.5 border-nx-line text-xs font-medium"
          >
            <span className="font-bold text-amber-500">âŠ˜</span>
            <span className="hidden sm:inline">Block Time</span>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8.5 hover:bg-nx-surfaceSubtle gap-1.5 border-nx-line text-xs font-medium"
          >
            <Link href="/venue/calendar">
              <span className="font-bold text-amber-500">âŠ˜</span>
              <span className="hidden sm:inline">Block Time</span>
            </Link>
          </Button>
        )}

        {/* Quick Action: Record Payment */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8.5 hover:bg-nx-surfaceSubtle gap-1.5 border-nx-line text-xs font-medium"
        >
          <Link href="/venue/money/payments">
            <span className="font-bold text-emerald-500">$</span>
            <span className="hidden sm:inline">Record Payment</span>
          </Link>
        </Button>

        {/* Secondary: Calendar */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8.5 gap-1.5 border-nx-line text-xs font-semibold hover:border-nx-accent hover:text-nx-accent"
        >
          <Link href="/venue/calendar">
            <CalendarDays className="size-3.5 text-nx-accent" aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("venueOverview.quickActions.openCalendar", { defaultValue: "Calendar" })}
            </span>
          </Link>
        </Button>

        {/* Secondary: Refresh */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={t("venueOverview.header.refresh", { defaultValue: "Refresh data" })}
          className="h-8.5 w-8.5 gap-1.5 border-nx-line p-0 text-xs font-medium sm:w-auto sm:px-2.5"
          title={t("venueOverview.header.refresh", { defaultValue: "Refresh" })}
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin text-nx-accent" : "text-nx-ink-3"}`}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">
            {refreshing
              ? t("venueOverview.header.refreshing", { defaultValue: "Refreshing..." })
              : t("venueOverview.header.refresh", { defaultValue: "Refresh" })}
          </span>
        </Button>

        {/* Primary CTA: + New Booking */}
        <Button asChild size="sm" className="h-8.5 gap-1.5 px-3.5 text-xs font-bold shadow-nx-sm">
          <Link href="/venue/bookings/new">
            <Plus className="size-4" aria-hidden="true" />
            <span>
              {t("venueOverview.quickActions.newBooking", { defaultValue: "New Booking" })}
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
