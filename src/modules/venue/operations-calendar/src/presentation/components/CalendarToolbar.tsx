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
}

function valueOf(value: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function CalendarToolbar(props: CalendarToolbarProps) {
  const { t } = props;
  return (
    <div className="grid gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 lg:grid-cols-[auto_minmax(150px,1fr)_minmax(180px,1.2fr)_minmax(180px,1.2fr)_minmax(180px,1.2fr)_auto]">
      <div className="flex items-end gap-1">
        <Button variant="outline" size="icon" aria-label={t("operationsCalendar.toolbar.previous")} onClick={props.onPrevious}>
          <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
        <Button variant="outline" onClick={props.onToday}>{t("operationsCalendar.toolbar.today")}</Button>
        <Button variant="outline" size="icon" aria-label={t("operationsCalendar.toolbar.next")} onClick={props.onNext}>
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="operations-calendar-date">{t("operationsCalendar.toolbar.date")}</Label>
        <Input id="operations-calendar-date" type="date" value={props.date} onChange={(event) => props.onDateChange(event.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label id="calendar-facility-label" htmlFor="calendar-facility-select">{t("operationsCalendar.toolbar.facility")}</Label>
        <GenericSelect id="calendar-facility-select" aria-labelledby="calendar-facility-label" type="searchable" searchType="client" allowClear={false} options={props.facilities.map((item) => ({ value: item.id, label: item.name }))} value={props.facilityId} onValueChange={(value: string | string[]) => props.onFacilityChange(valueOf(value))} />
      </div>
      <div className="space-y-1.5">
        <Label id="calendar-timezone-label" htmlFor="calendar-timezone-select">{t("operationsCalendar.toolbar.timezone")}</Label>
        <GenericSelect id="calendar-timezone-select" aria-labelledby="calendar-timezone-label" allowClear={false} options={props.timeZones.map((value) => ({ value, label: value }))} value={props.timeZoneId} onValueChange={(value: string | string[]) => props.onTimeZoneChange(valueOf(value))} />
      </div>
      <div className="space-y-1.5">
        <Label id="calendar-resource-label" htmlFor="calendar-resource-select">{t("operationsCalendar.toolbar.resource")}</Label>
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
      <div className="flex items-end">
        <Button variant="outline" disabled={props.loading} onClick={props.onRefresh}>
          <RefreshCw className={`size-4 ${props.loading ? "animate-spin" : ""}`} aria-hidden="true" />
          {t("operationsCalendar.toolbar.refresh")}
        </Button>
      </div>
    </div>
  );
}
