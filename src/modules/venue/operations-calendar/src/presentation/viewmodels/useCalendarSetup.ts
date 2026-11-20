"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSavedFacilityId, type Facility } from "@modules/venue";
import type { getVenueContainer } from "@modules/venue/di";
import type { CalendarResource, OperationsCalendarState } from "../../domain/entities/OperationsCalendar";
import { localPrefillForInstant } from "./useCalendarLayout";

type VenueContainer = ReturnType<typeof getVenueContainer>;

const PAGE_SIZE = 100;

export function extractCalendarErrorDetails(
  error: unknown,
): { errorCode?: string; statusCode?: number } {
  return error instanceof Error
    ? ((error as Error & { details?: { errorCode?: string; statusCode?: number } }).details ?? {})
    : {};
}

export function isCalendarFeatureUnavailable(error: unknown): boolean {
  return extractCalendarErrorDetails(error).errorCode === "Error.Forbidden";
}

export function getCalendarErrorMessage(error: unknown): string | null {
  return error instanceof Error && error.message ? error.message : null;
}

export function shiftCalendarDate(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayInTimeZone(timeZoneId: string): string {
  return localPrefillForInstant(new Date().toISOString(), timeZoneId).date;
}

export function syncCalendarUrlParams(newParams: {
  date?: string;
  facilityId?: string;
  resourceId?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (newParams.date !== undefined) {
      if (newParams.date) url.searchParams.set("date", newParams.date);
      else url.searchParams.delete("date");
    }
    if (newParams.facilityId !== undefined) {
      if (newParams.facilityId) url.searchParams.set("facilityId", newParams.facilityId);
      else url.searchParams.delete("facilityId");
    }
    if (newParams.resourceId !== undefined) {
      if (newParams.resourceId) url.searchParams.set("resourceId", newParams.resourceId);
      else url.searchParams.delete("resourceId");
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  } catch {}
}

interface UseCalendarSetupProps {
  facilityRepository: VenueContainer["facilityRepository"];
  facilityResourceProfileRepository: VenueContainer["facilityResourceProfileRepository"];
  schedulableResourceRepository: VenueContainer["schedulableResourceRepository"];
  commercialPricingRepository: VenueContainer["commercialPricingRepository"];
  onSetupError: (updater: (current: OperationsCalendarState) => OperationsCalendarState) => void;
}

/**
 * Loads facilities, profiles, schedulable resources, and pricing readiness for the operations calendar.
 */
export function useCalendarSetup({
  facilityRepository,
  facilityResourceProfileRepository,
  schedulableResourceRepository,
  commercialPricingRepository,
  onSetupError,
}: UseCalendarSetupProps) {
  const searchParams = useSearchParams();
  const [initialParams] = useState(() => ({
    facilityId: searchParams?.get("facilityId") ?? null,
    resourceId: searchParams?.get("resourceId") ?? null,
    date: searchParams?.get("date") ?? null,
  }));

  const [setupLoading, setSetupLoading] = useState(true);
  const [setupReady, setSetupReady] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allResources, setAllResources] = useState<CalendarResource[]>([]);
  const [facilityId, setFacilityIdState] = useState("");
  const [timeZoneId, setTimeZoneIdState] = useState("");
  const [resourceId, setResourceIdState] = useState("");
  const [date, setDateState] = useState(() => new Date().toISOString().slice(0, 10));

  const syncUrl = syncCalendarUrlParams;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [facilityPage, profilePage, resourcePage] = await Promise.all([
          facilityRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
          facilityResourceProfileRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
          schedulableResourceRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
        ]);
        if (!active) return;

        let pricingMap = new Map<string, string | null>();
        if (commercialPricingRepository?.getResourceConfiguration) {
          try {
            const pricingEntries = await Promise.all(
              resourcePage.items.map(async (resource) => {
                try {
                  const cfg = await commercialPricingRepository.getResourceConfiguration(
                    resource.id,
                  );
                  return [resource.id, cfg?.effectiveFromUtc ?? null] as const;
                } catch {
                  return [resource.id, null] as const;
                }
              }),
            );
            pricingMap = new Map(pricingEntries);
          } catch {
            // Ignore pricing lookup failure if unavailable
          }
        }

        const profiles = new Map(profilePage.items.map((profile) => [profile.id, profile]));
        const facilityNames = new Map(
          facilityPage.items.map((facility) => [facility.id, facility.name]),
        );
        const defaultZone =
          typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
            : "UTC";

        const composed = resourcePage.items
          .filter((resource) => !resource.isComposite)
          .flatMap((resource) => {
            const profile = profiles.get(resource.facilityResourceProfileId);
            const resolvedFacilityId = profile?.facilityId || "";
            const zone =
              profile?.operatingPolicy?.timeZoneId ||
              resource.slotPolicy?.timeZoneId ||
              defaultZone;
            if (!resolvedFacilityId) return [];
            return [
              {
                id: resource.id,
                name: resource.name,
                profileId: profile?.id || resource.facilityResourceProfileId,
                profileName: profile?.name || resource.name,
                facilityId: resolvedFacilityId,
                facilityName: facilityNames.get(resolvedFacilityId) ?? profile?.name ?? "",
                resourceKindCode: profile?.resourceKindCode || "court",
                timeZoneId: zone,
                slotPolicy: resource.slotPolicy,
                priceEffectiveFromUtc: pricingMap.get(resource.id) ?? null,
              } satisfies CalendarResource,
            ];
          });

        const paramFacilityId = initialParams.facilityId;
        const paramResourceId = initialParams.resourceId;
        const paramDate = initialParams.date;

        const targetFacilityId =
          (paramFacilityId && facilityPage.items.some((f) => f.id === paramFacilityId)
            ? paramFacilityId
            : null) ||
          (paramResourceId && composed.find((r) => r.id === paramResourceId)?.facilityId) ||
          getSavedFacilityId(facilityPage.items);

        const initialFacility =
          (targetFacilityId &&
            facilityPage.items.find(
              (f) => f.id === targetFacilityId && composed.some((r) => r.facilityId === f.id),
            )) ||
          facilityPage.items.find((facility) =>
            composed.some((resource) => resource.facilityId === facility.id),
          ) ||
          (targetFacilityId && facilityPage.items.find((f) => f.id === targetFacilityId)) ||
          facilityPage.items[0];

        const initialZone =
          composed.find((resource) => resource.facilityId === initialFacility?.id)?.timeZoneId ??
          composed[0]?.timeZoneId ??
          defaultZone;

        setFacilities(facilityPage.items);
        setAllResources(composed);
        setSetupReady(true);
        setFacilityIdState(initialFacility?.id ?? "");
        setTimeZoneIdState(initialZone);
        if (paramResourceId && composed.some((r) => r.id === paramResourceId)) {
          setResourceIdState(paramResourceId);
        }
        if (paramDate) {
          setDateState(paramDate);
        } else if (initialZone) {
          setDateState(todayInTimeZone(initialZone));
        }
      } catch (error) {
        if (!active) return;
        onSetupError((current) => ({
          ...current,
          stage: isCalendarFeatureUnavailable(error) ? "featureUnavailable" : "error",
          errorMessage: isCalendarFeatureUnavailable(error) ? null : getCalendarErrorMessage(error),
        }));
      } finally {
        if (active) setSetupLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [
    commercialPricingRepository,
    facilityRepository,
    facilityResourceProfileRepository,
    initialParams,
    onSetupError,
    schedulableResourceRepository,
  ]);

  return {
    setupLoading,
    setupReady,
    facilities,
    allResources,
    facilityId,
    setFacilityIdState,
    timeZoneId,
    setTimeZoneIdState,
    resourceId,
    setResourceIdState,
    date,
    setDateState,
    syncUrl,
  };
}
