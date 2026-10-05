"use client";

import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
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
}

function valueOf(value: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function CalendarToolbar(props: CalendarToolbarProps) {
  const { t } = props;
  return (
    <div className="flex flex-col gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nx-line/60 pb-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label={t("operationsCalendar.toolbar.previous")} onClick={props.onPrevious}>
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
          <Button variant="outline" onClick={props.onToday}>{t("operationsCalendar.toolbar.today")}</Button>
          <Button variant="outline" size="icon" aria-label={t("operationsCalendar.toolbar.next")} onClick={props.onNext}>
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {props.onBlockTime && (
            <Button variant="outline" size="sm" onClick={props.onBlockTime} className="text-xs gap-1.5 font-medium">
              <span className="text-amber-500 font-bold">⊘</span>
              <span>{t("operationsCalendar.toolbar.blockTime", { defaultValue: "+ Block Time" })}</span>
            </Button>
          )}

          <Button asChild size="sm" className="text-xs gap-1.5 font-bold">
            <a href="/venue/bookings/new">
              <span>+ New Booking</span>
            </a>
          </Button>

          <Button variant="outline" size="icon" disabled={props.loading} onClick={props.onRefresh} aria-label={t("operationsCalendar.toolbar.refresh")}>
            <RefreshCw className={`size-4 ${props.loading ? "animate-spin" : ""}`} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="operations-calendar-date">{t("operationsCalendar.toolbar.date")}</Label>
        <Input id="operations-calendar-date" type="date" value={props.date} onChange={(event) => props.onDateChange(event.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("operationsCalendar.toolbar.facility")}</Label>
        <GenericSelect type="searchable" searchType="client" allowClear={false} aria-label={t("operationsCalendar.toolbar.facility")} options={props.facilities.map((item) => ({ value: item.id, label: item.name }))} value={props.facilityId} onValueChange={(value: string | string[]) => props.onFacilityChange(valueOf(value))} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("operationsCalendar.toolbar.timezone")}</Label>
        <GenericSelect allowClear={false} aria-label={t("operationsCalendar.toolbar.timezone")} options={props.timeZones.map((value) => ({ value, label: value }))} value={props.timeZoneId} onValueChange={(value: string | string[]) => props.onTimeZoneChange(valueOf(value))} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("operationsCalendar.toolbar.resource")}</Label>
        <GenericSelect
          type="searchable"
          searchType="client"
          aria-label={t("operationsCalendar.toolbar.resource")}
          placeholder={t("operationsCalendar.toolbar.allResources")}
          options={props.resources.map((item) => ({ value: item.id, label: item.name }))}
          value={props.resourceId}
          onValueChange={(value: string | string[]) => props.onResourceChange(valueOf(value))}
        />
      </div>
      </div>
    </div>
  );
}
