"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getVenueContainer } from "@modules/venue/di";
import type { Facility } from "@modules/venue";
import type {
  CalendarResource,
  OperationsCalendarBlock,
  OperationsCalendarState,
} from "../../domain/entities/OperationsCalendar";
import { localPrefillForInstant } from "./calendarLayout";

const PAGE_SIZE = 100;
const LANE_LIMIT = 50;

const initialState: OperationsCalendarState = {
  stage: "loading",
  day: null,
  errorMessage: null,
};

function details(error: unknown): { errorCode?: string; statusCode?: number } {
  return error instanceof Error
    ? ((error as Error & { details?: { errorCode?: string; statusCode?: number } }).details ?? {})
    : {};
}

function isFeatureUnavailable(error: unknown) {
  return details(error).errorCode === "Error.Forbidden";
}

function message(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayIn(timeZoneId: string): string {
  return localPrefillForInstant(new Date().toISOString(), timeZoneId).date;
}

/**
 * Documentation for module export
 */
export function useOperationsCalendarViewModel() {
  const router = useRouter();
  const {
    operationsCalendarRepository,
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
  } = getVenueContainer();
  const [state, setState] = useState(initialState);
  const [setupLoading, setSetupLoading] = useState(true);
  const [setupReady, setSetupReady] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allResources, setAllResources] = useState<CalendarResource[]>([]);
  const [facilityId, setFacilityIdState] = useState("");
  const [timeZoneId, setTimeZoneIdState] = useState("");
  const [resourceId, setResourceIdState] = useState("");
  const [date, setDateState] = useState(new Date().toISOString().slice(0, 10));
  const requestGeneration = useRef(0);

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
        const profiles = new Map(profilePage.items.map((profile) => [profile.id, profile]));
        const facilityNames = new Map(facilityPage.items.map((facility) => [facility.id, facility.name]));
        const composed = resourcePage.items
          .filter((resource) => resource.isPublished && !resource.isComposite)
          .flatMap((resource) => {
            const profile = profiles.get(resource.facilityResourceProfileId);
            const zone = profile?.operatingPolicy?.timeZoneId;
            if (!profile || !zone) return [];
            return [{
              id: resource.id,
              name: resource.name,
              profileId: profile.id,
              profileName: profile.name,
              facilityId: profile.facilityId,
              facilityName: facilityNames.get(profile.facilityId) ?? profile.name,
              resourceKindCode: profile.resourceKindCode,
              timeZoneId: zone,
            } satisfies CalendarResource];
          });
        const firstFacility = facilityPage.items.find((facility) =>
          composed.some((resource) => resource.facilityId === facility.id));
        const firstZone = composed.find((resource) => resource.facilityId === firstFacility?.id)?.timeZoneId ?? "";
        setFacilities(facilityPage.items);
        setAllResources(composed);
        setSetupReady(true);
        setFacilityIdState(firstFacility?.id ?? "");
        setTimeZoneIdState(firstZone);
        if (firstZone) setDateState(todayIn(firstZone));
      } catch (error) {
        if (!active) return;
        setState((current) => ({
          ...current,
          stage: isFeatureUnavailable(error) ? "featureUnavailable" : "error",
          errorMessage: isFeatureUnavailable(error) ? null : message(error, "calendar-setup-failed"),
        }));
      } finally {
        if (active) setSetupLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [facilityRepository, facilityResourceProfileRepository, schedulableResourceRepository]);

  const timeZoneOptions = useMemo(
    () => Array.from(new Set(allResources
      .filter((resource) => resource.facilityId === facilityId)
      .map((resource) => resource.timeZoneId))).sort(),
    [allResources, facilityId]
  );
  const facilityResources = useMemo(
    () => allResources.filter((resource) =>
      resource.facilityId === facilityId && resource.timeZoneId === timeZoneId),
    [allResources, facilityId, timeZoneId]
  );
  const visibleResources = useMemo(
    () => facilityResources
      .filter((resource) => !resourceId || resource.id === resourceId)
      .slice(0, LANE_LIMIT),
    [facilityResources, resourceId]
  );
  const resourcesTruncated = !resourceId && facilityResources.length > LANE_LIMIT;

  const loadDay = useCallback(async () => {
    if (setupLoading || !setupReady) return null;
    const generation = ++requestGeneration.current;
    if (!date || !timeZoneId || visibleResources.length === 0) {
      setState((current) => ({ ...current, stage: "empty", day: null, errorMessage: null }));
      return null;
    }
    setState((current) => ({ ...current, stage: "loading", errorMessage: null }));
    try {
      const day = await operationsCalendarRepository.getDay({
        dateLocal: date,
        timeZoneId,
        resourceIds: visibleResources.map((resource) => resource.id),
      });
      if (generation !== requestGeneration.current) return null;
      setState((current) => ({
        ...current,
        stage: day.blocks.length === 0 ? "empty" : "ready",
        day,
        errorMessage: null,
      }));
      return day;
    } catch (error) {
      if (generation !== requestGeneration.current) return null;
      setState((current) => ({
        ...current,
        stage: isFeatureUnavailable(error) ? "featureUnavailable" : "error",
        day: null,
        errorMessage: isFeatureUnavailable(error) ? null : message(error, "calendar-load-failed"),
      }));
      return null;
    }
  }, [date, operationsCalendarRepository, setupLoading, setupReady, timeZoneId, visibleResources]);

  useEffect(() => {
    if (!setupLoading && setupReady) void loadDay();
  }, [loadDay, setupLoading, setupReady]);

  const invalidate = useCallback(() => {
    requestGeneration.current += 1;
    setState((current) => ({ ...current, stage: "loading", day: null }));
  }, []);

  const setDate = useCallback((value: string) => {
    invalidate();
    setDateState(value);
  }, [invalidate]);
  const previousDay = useCallback(() => setDate(shiftDate(date, -1)), [date, setDate]);
  const nextDay = useCallback(() => setDate(shiftDate(date, 1)), [date, setDate]);
  const goToday = useCallback(() => setDate(todayIn(timeZoneId || "UTC")), [setDate, timeZoneId]);

  const setFacilityId = useCallback((value: string) => {
    const zone = allResources.find((resource) => resource.facilityId === value)?.timeZoneId ?? "";
    invalidate();
    setFacilityIdState(value);
    setTimeZoneIdState(zone);
    setResourceIdState("");
  }, [allResources, invalidate]);
  const setTimeZoneId = useCallback((value: string) => {
    invalidate();
    setTimeZoneIdState(value);
    setResourceIdState("");
  }, [invalidate]);
  const setResourceId = useCallback((value: string) => {
    invalidate();
    setResourceIdState(value);
  }, [invalidate]);

  const openBlock = useCallback((block: OperationsCalendarBlock) => {
    router.push(`/venue/bookings/${encodeURIComponent(block.reservationId)}`);
  }, [router]);

  const createFromSlot = useCallback((resource: CalendarResource, instantUtc: string) => {
    const prefill = localPrefillForInstant(instantUtc, resource.timeZoneId);
    const params = new URLSearchParams({
      facilityId: resource.facilityId,
      resourceId: resource.id,
      date: prefill.date,
      startTime: prefill.startTime,
      durationMinutes: "60",
    });
    router.push(`/venue/bookings/new?${params.toString()}`);
  }, [router]);

  return {
    state,
    setupLoading,
    facilities,
    allResources,
    visibleResources,
    resourcesTruncated,
    timeZoneOptions,
    facilityId,
    timeZoneId,
    resourceId,
    date,
    setDate,
    previousDay,
    nextDay,
    goToday,
    setFacilityId,
    setTimeZoneId,
    setResourceId,
    refresh: loadDay,
    openBlock,
    createFromSlot,
  };
}
