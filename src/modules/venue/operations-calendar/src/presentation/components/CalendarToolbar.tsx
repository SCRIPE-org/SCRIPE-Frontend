"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { Facility } from "@modules/venue";
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
  onFindSlots?: () => void;
  onNewBooking?: () => void;
  hasBookingReadyCourts?: boolean;
}

function valueOf(value: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

/**
 * Top operations calendar toolbar with date stepper, actions, and collapsible resource filters.
 */
export function CalendarToolbar(props: CalendarToolbarProps) {
  const { t } = props;
  const { language } = useI18n();
  const actionsDisabled = props.hasBookingReadyCourts === false || props.resources.length === 0;

  const [showFilters, setShowFilters] = useState(true);

  const dateParts = props.date.split("-").map(Number);
  const dateValue =
    dateParts.length === 3 && dateParts.every(Number.isFinite)
      ? new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], 12))
      : null;
  const formattedDisplayDate = dateValue
    ? new Intl.DateTimeFormat(language, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(dateValue)
    : props.date;

  const filtersActive = showFilters || Boolean(props.resourceId);

  return (
    <div
      className="flex flex-col gap-4 rounded-nx-lg border border-nx-line bg-nx-surface p-4"
      data-testid="calendar-toolbar"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date stepper & current display date */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-nx-control border border-nx-line bg-nx-raised p-0.5 text-xs font-semibold">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-nx-sm text-nx-ink-2 hover:text-nx-ink"
              aria-label={t("operationsCalendar.toolbar.previous")}
              onClick={props.onPrevious}
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onToday}
              className="px-2.5 py-1 text-xs font-bold text-nx-ink hover:text-nx-accent"
            >
              {t("operationsCalendar.toolbar.today")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-nx-sm text-nx-ink-2 hover:text-nx-ink"
              aria-label={t("operationsCalendar.toolbar.next")}
              onClick={props.onNext}
            >
              <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </div>

          <div className="rounded-nx-control border border-nx-line bg-nx-surface px-3 py-1.5 text-xs font-bold tracking-tight text-nx-ink">
            {formattedDisplayDate}
          </div>
        </div>

        {/* Filter toggle & primary actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            aria-pressed={filtersActive}
            onClick={() => setShowFilters((prev) => !prev)}
            className={`h-8 gap-1.5 text-xs font-semibold transition-colors ${
              filtersActive
                ? "border-nx-accent/40 bg-nx-accent-wash font-semibold text-nx-accent"
                : "border-nx-line text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
            }`}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            <span>{t("operationsCalendar.toolbar.filter")}</span>
            {props.resourceId ? (
              <span className="size-1.5 rounded-full bg-nx-accent-fill" />
            ) : null}
          </Button>

          {props.onFindSlots && (
            <Button
              variant="outline"
              size="sm"
              disabled={actionsDisabled}
              onClick={props.onFindSlots}
              className="h-8 gap-1.5 border-nx-line text-xs font-semibold hover:bg-nx-raised"
            >
              <Search className="size-3.5 text-nx-accent" aria-hidden="true" />
              <span className="hidden sm:inline">{t("operationsCalendar.toolbar.findSlots")}</span>
            </Button>
          )}

          {props.onBlockTime && (
            <Button
              variant="outline"
              size="sm"
              disabled={actionsDisabled}
              onClick={props.onBlockTime}
              className="h-8 gap-1.5 border-nx-line text-xs font-semibold hover:bg-nx-raised"
            >
              <Clock className="size-3.5 text-warning" aria-hidden="true" />
              <span className="hidden sm:inline">{t("operationsCalendar.toolbar.blockTime")}</span>
            </Button>
          )}

          {props.onNewBooking ? (
            <Button
              variant="default"
              size="sm"
              disabled={actionsDisabled}
              onClick={props.onNewBooking}
              className="h-8 gap-1.5 px-3.5 text-xs font-bold"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>{t("operationsCalendar.toolbar.newBooking")}</span>
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="icon"
            className="size-8 border-nx-line"
            disabled={props.loading}
            onClick={props.onRefresh}
            aria-label={t("operationsCalendar.toolbar.refresh")}
          >
            <RefreshCw
              className={`size-3.5 ${props.loading ? "animate-spin text-nx-accent" : "text-nx-ink-3"}`}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>

      {/* Collapsible filter row */}
      {showFilters && (
        <div className="grid gap-3 border-t border-nx-line/60 pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label
              id="calendar-facility-label"
              htmlFor="calendar-facility-select"
              className="text-xs font-bold text-nx-ink"
            >
              {t("operationsCalendar.toolbar.facility")}
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
            <Label
              id="calendar-resource-label"
              htmlFor="calendar-resource-select"
              className="text-xs font-bold text-nx-ink"
            >
              {t("operationsCalendar.toolbar.resource")}
            </Label>
            <GenericSelect
              id="calendar-resource-select"
              aria-labelledby="calendar-resource-label"
              type="searchable"
              searchType="client"
              placeholder={t("operationsCalendar.toolbar.allResources")}
              options={props.resources.map((item) => ({ value: item.id, label: item.name }))}
              value={props.resourceId}
              onValueChange={(value: string | string[]) => props.onResourceChange(valueOf(value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="operations-calendar-date" className="text-xs font-bold text-nx-ink">
              {t("operationsCalendar.toolbar.date")}
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
            <Label
              id="calendar-timezone-label"
              htmlFor="calendar-timezone-select"
              className="text-xs font-bold text-nx-ink"
            >
              {t("operationsCalendar.toolbar.timezone")}
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
