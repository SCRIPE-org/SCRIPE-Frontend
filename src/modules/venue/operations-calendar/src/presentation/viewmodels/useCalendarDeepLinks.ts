"use client";

import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { localToUtcInstant } from "./useCalendarLayout";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

export function cleanModalActionParams() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("newBooking");
    url.searchParams.delete("action");
    url.searchParams.delete("startTime");
    url.searchParams.delete("durationMinutes");
    url.searchParams.delete("customerId");
    url.searchParams.delete("customerPartyId");
    const query = url.searchParams.toString();
    window.history.replaceState(null, "", query ? `${url.pathname}?${query}` : url.pathname);
  } catch {
    window.history.replaceState(null, "", window.location.pathname);
  }
}

interface UseCalendarDeepLinksProps {
  searchParams: ReadonlyURLSearchParams | null;
  canCreate: boolean;
  allResources: CalendarResource[];
  facilityResources: CalendarResource[];
  facilityId: string;
  timeZoneId: string;
  setFacilityId: (id: string) => void;
  setDate: (date: string) => void;
  setSelectedResource: (resource: CalendarResource) => void;
  setSelectedInstant: (instantUtc: string | null) => void;
  setSelectedDuration: (minutes: number) => void;
  setClickToBookOpen: (open: boolean) => void;
  setFindSlotsOpen: (open: boolean) => void;
  setCourtNotReadyNotice: (notice: string | null) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Synchronizes URL deep-link action parameters (`findSlot`, `newBooking`, `action=new-booking`)
 * into calendar modal state and strips one-shot query flags afterwards.
 */
export function useCalendarDeepLinks({
  searchParams,
  canCreate,
  allResources,
  facilityResources,
  facilityId,
  timeZoneId,
  setFacilityId,
  setDate,
  setSelectedResource,
  setSelectedInstant,
  setSelectedDuration,
  setClickToBookOpen,
  setFindSlotsOpen,
  setCourtNotReadyNotice,
  t,
}: UseCalendarDeepLinksProps) {
  useEffect(() => {
    if (searchParams?.get("findSlot") === "true") {
      setFindSlotsOpen(true);
    }
  }, [searchParams, setFindSlotsOpen]);

  useEffect(() => {
    if (!searchParams || !canCreate) return;
    const shouldOpen =
      searchParams.get("newBooking") === "true" || searchParams.get("action") === "new-booking";
    if (!shouldOpen || allResources.length === 0) return;

    const facilityIdParam = searchParams.get("facilityId");
    const resourceIdParam = searchParams.get("resourceId");
    const dateParam = searchParams.get("date");
    const startTimeParam = searchParams.get("startTime");
    const durationParam = searchParams.get("durationMinutes");

    let targetResource: CalendarResource | null = null;
    if (resourceIdParam) {
      const found = allResources.find((r) => r.id === resourceIdParam);
      if (!found) {
        setCourtNotReadyNotice(t("operationsCalendar.readiness.courtNotReady"));
        cleanModalActionParams();
        return;
      }
      if (found.priceEffectiveFromUtc && Date.parse(found.priceEffectiveFromUtc) > Date.now()) {
        setCourtNotReadyNotice(t("operationsCalendar.readiness.courtActivating"));
        cleanModalActionParams();
        return;
      }
      targetResource = found;
      if (found.facilityId !== facilityId) setFacilityId(found.facilityId);
    } else if (facilityIdParam && facilityIdParam !== facilityId) {
      setFacilityId(facilityIdParam);
      targetResource =
        allResources.find((r) => r.facilityId === facilityIdParam) ?? allResources[0] ?? null;
    } else {
      targetResource = facilityResources[0] ?? allResources[0] ?? null;
    }

    if (!targetResource) return;
    setSelectedResource(targetResource);
    if (dateParam) setDate(dateParam);
    setSelectedInstant(
      dateParam && startTimeParam
        ? localToUtcInstant(
            dateParam,
            startTimeParam,
            targetResource.timeZoneId || timeZoneId || "UTC",
          )
        : null,
    );

    const dur = durationParam ? Number(durationParam) : NaN;
    setSelectedDuration(
      Number.isInteger(dur) && dur >= 15
        ? dur
        : (targetResource.slotPolicy?.slotDurationMinutes ?? 60),
    );
    setClickToBookOpen(true);
    cleanModalActionParams();
  }, [
    allResources,
    canCreate,
    facilityId,
    facilityResources,
    searchParams,
    setClickToBookOpen,
    setCourtNotReadyNotice,
    setDate,
    setFacilityId,
    setSelectedDuration,
    setSelectedInstant,
    setSelectedResource,
    t,
    timeZoneId,
  ]);
}
