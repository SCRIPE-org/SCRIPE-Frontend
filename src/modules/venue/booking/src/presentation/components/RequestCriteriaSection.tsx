"use client";

import { useState } from "react";
import { CalendarRange, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import type { Facility } from "@modules/venue";
import { FacilityQuickCreateDialog } from "@modules/venue";
import type { SchedulableResource } from "@modules/venue";
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
  onFacilityCreated?: (facilityId: string) => Promise<void> | void;
}

function selectedValue(value: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

/**
 * Documentation for RequestCriteriaSection
 */
export function RequestCriteriaSection({
  t,
  criteria,
  facilities,
  resources,
  resourceKinds,
  usageTypes,
  disabled,
  onChange,
  onFacilityCreated,
}: RequestCriteriaSectionProps) {
  const [quickCreateFacilityOpen, setQuickCreateFacilityOpen] = useState(false);
  const canCreateFacility = usePermission(VENUE_PERMISSIONS.FACILITY_CREATE);

  return (
    <>
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
              <div className="flex items-center justify-between">
                <Label id="booking-facility-label" htmlFor="booking-facility-select">{t("booking.request.facility")}</Label>
                {onFacilityCreated && canCreateFacility && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs text-nx-accent hover:text-nx-accent/80"
                    onClick={() => setQuickCreateFacilityOpen(true)}
                    disabled={disabled}
                  >
                    <Plus className="mr-1 size-3" />
                    {t("facility.addNew") || "New Facility"}
                  </Button>
                )}
              </div>
            <GenericSelect
              id="booking-facility-select"
              aria-labelledby="booking-facility-label"
              type="searchable"
              searchType="client"
              allowClear={false}
              disabled={disabled}
              options={facilities.map((facility) => ({
                value: facility.id,
                label: facility.name ? `${facility.name} (${facility.code})` : facility.code || facility.id,
              }))}
              value={criteria.facilityId}
              onValueChange={(value: string | string[]) => onChange({ facilityId: selectedValue(value), resourceId: "", resourceKindCode: "", usageTypeCode: "" })}
              placeholder={t("booking.request.selectFacility")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label id="booking-resource-label" htmlFor="booking-resource-select">{t("booking.request.resource")}</Label>
            <GenericSelect
              id="booking-resource-select"
              aria-labelledby="booking-resource-label"
              type="searchable"
              searchType="client"
              allowClear
              disabled={disabled}
              options={resources.map((resource) => ({
                value: resource.id,
                label: resource.name || resource.namedUnitLabel || resource.id,
              }))}
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
            <Label id="booking-resource-kind-label" htmlFor="booking-resource-kind-select">{t("booking.request.resourceKind")}</Label>
            <GenericSelect
              id="booking-resource-kind-select"
              aria-labelledby="booking-resource-kind-label"
              type="searchable"
              searchType="client"
              allowClear
              disabled={disabled}
              options={resourceKinds.map((kind) => ({ value: kind, label: kind }))}
              value={criteria.resourceKindCode}
              onValueChange={(value: string | string[]) => onChange({ resourceKindCode: selectedValue(value), usageTypeCode: "" })}
              placeholder={t("booking.request.anyResourceKind")}
            />
          </div>
          <div className="space-y-2">
            <Label id="booking-usage-type-label" htmlFor="booking-usage-type-select">{t("booking.request.usageType")}</Label>
            <GenericSelect
              id="booking-usage-type-select"
              aria-labelledby="booking-usage-type-label"
              type="searchable"
              searchType="client"
              allowClear
              disabled={disabled}
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

    <FacilityQuickCreateDialog
      open={quickCreateFacilityOpen}
      onOpenChange={setQuickCreateFacilityOpen}
      onSuccess={async (createdFacilityId) => {
        await onFacilityCreated?.(createdFacilityId);
      }}
    />
  </>
  );
}
