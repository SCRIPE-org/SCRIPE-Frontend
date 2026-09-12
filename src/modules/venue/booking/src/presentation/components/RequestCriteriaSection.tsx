"use client";

import { CalendarRange } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import type { SchedulableResource } from "@modules/venue/schedulable-resource/src/domain/entities/SchedulableResource";
import type { BookingRequestCriteria } from "../../domain/entities/Booking";

interface RequestCriteriaSectionProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  criteria: BookingRequestCriteria;
  facilities: Facility[];
  resources: SchedulableResource[];
  resourceKinds: string[];
  usageTypes: Array<{ code: string; label: string }>;
  disabled: boolean;
  onChange: (patch: Partial<BookingRequestCriteria>) => void;
}

function selectedValue(value: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function RequestCriteriaSection({
  t,
  criteria,
  facilities,
  resources,
  resourceKinds,
  usageTypes,
  disabled,
  onChange,
}: RequestCriteriaSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="size-5 text-nx-accent" aria-hidden="true" />
          {t("booking.request.title")}
        </CardTitle>
        <p className="text-sm text-nx-ink-2">{t("booking.request.description")}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label>{t("booking.request.facility")}</Label>
            <GenericSelect
              type="searchable"
              searchType="client"
              allowClear={false}
              disabled={disabled}
              aria-label={t("booking.request.facility")}
              options={facilities.map((facility) => ({ value: facility.id, label: facility.name }))}
              value={criteria.facilityId}
              onValueChange={(value: string | string[]) => onChange({ facilityId: selectedValue(value), resourceId: "", resourceKindCode: "", usageTypeCode: "" })}
              placeholder={t("booking.request.selectFacility")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{t("booking.request.resource")}</Label>
            <GenericSelect
              type="searchable"
              searchType="client"
              allowClear
              disabled={disabled}
              aria-label={t("booking.request.resource")}
              options={resources.map((resource) => ({ value: resource.id, label: resource.name }))}
              value={criteria.resourceId}
              onValueChange={(value: string | string[]) => onChange({ resourceId: selectedValue(value) })}
              placeholder={t("booking.request.anyResource")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-date">{t("booking.request.date")}</Label>
            <Input id="booking-date" type="date" disabled={disabled} value={criteria.date} onChange={(event) => onChange({ date: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-start-time">{t("booking.request.startTime")}</Label>
            <Input id="booking-start-time" type="time" disabled={disabled} value={criteria.startTime} onChange={(event) => onChange({ startTime: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-duration">{t("booking.request.duration")}</Label>
            <Input id="booking-duration" type="number" min={15} max={1440} step={15} disabled={disabled} value={criteria.durationMinutes} onChange={(event) => onChange({ durationMinutes: Number(event.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-quantity">{t("booking.request.quantity")}</Label>
            <Input id="booking-quantity" type="number" min={1} max={1000} disabled={disabled} value={criteria.quantity} onChange={(event) => onChange({ quantity: Number(event.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>{t("booking.request.resourceKind")}</Label>
            <GenericSelect
              type="searchable"
              searchType="client"
              allowClear
              disabled={disabled}
              aria-label={t("booking.request.resourceKind")}
              options={resourceKinds.map((kind) => ({ value: kind, label: kind }))}
              value={criteria.resourceKindCode}
              onValueChange={(value: string | string[]) => onChange({ resourceKindCode: selectedValue(value), usageTypeCode: "" })}
              placeholder={t("booking.request.anyResourceKind")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("booking.request.usageType")}</Label>
            <GenericSelect
              type="searchable"
              searchType="client"
              allowClear
              disabled={disabled}
              aria-label={t("booking.request.usageType")}
              options={usageTypes.map((usage) => ({ value: usage.code, label: usage.label }))}
              value={criteria.usageTypeCode}
              onValueChange={(value: string | string[]) => onChange({ usageTypeCode: selectedValue(value) })}
              placeholder={t("booking.request.anyUsageType")}
            />
          </div>
        </div>
        <p className="text-xs text-nx-ink-3">{t("booking.request.timezoneNote")}</p>
      </CardContent>
    </Card>
  );
}
