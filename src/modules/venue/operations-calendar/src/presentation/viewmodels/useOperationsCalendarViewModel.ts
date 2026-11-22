"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveFacilityId } from "@modules/venue";
import { getVenueContainer } from "@modules/venue/di";
import { isClosureBlock } from "../../domain/entities/OperationsCalendar";
import type {
  CalendarResource,
  OperationsCalendarBlock,
  OperationsCalendarState,
} from "../../domain/entities/OperationsCalendar";
import { localPrefillForInstant } from "./useCalendarLayout";
import {
  getCalendarErrorMessage,
  isCalendarFeatureUnavailable,
  shiftCalendarDate,
  todayInTimeZone,
  useCalendarSetup,
} from "./useCalendarSetup";

const LANE_LIMIT = 50;

const initialState: OperationsCalendarState = {
  stage: "loading",
  day: null,
  errorMessage: null,
};

/**
 * Primary ViewModel orchestrating operations calendar state, filters, and day loading.
 */
export function useOperationsCalendarViewModel() {
  const router = useRouter();
  const {
    operationsCalendarRepository,
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
    commercialPricingRepository,
  } = getVenueContainer();

  const [state, setState] = useState(initialState);
  const [selectedClosure, setSelectedClosure] = useState<OperationsCalendarBlock | null>(null);
  const requestGeneration = useRef(0);

  const {
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
  } = useCalendarSetup({
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
    commercialPricingRepository,
    onSetupError: setState,
  });

  const timeZoneOptions = Array.from(
    new Set(
      allResources
        .filter((resource) => resource.facilityId === facilityId)
        .map((resource) => resource.timeZoneId),
    ),
  ).sort();

  const facilityResources = allResources.filter(
    (resource) => resource.facilityId === facilityId && resource.timeZoneId === timeZoneId,
  );

  const visibleResources = useMemo(
    () =>
      allResources
        .filter(
          (resource) =>
            resource.facilityId === facilityId &&
            resource.timeZoneId === timeZoneId &&
            (!resourceId || resource.id === resourceId),
        )
        .slice(0, LANE_LIMIT),
    [allResources, facilityId, resourceId, timeZoneId],
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
        stage: isCalendarFeatureUnavailable(error) ? "featureUnavailable" : "error",
        day: null,
        errorMessage: isCalendarFeatureUnavailable(error) ? null : getCalendarErrorMessage(error),
      }));
      return null;
    }
  }, [date, operationsCalendarRepository, setupLoading, setupReady, timeZoneId, visibleResources]);

  useEffect(() => {
    if (setupLoading || !setupReady) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void loadDay();
    });
    return () => {
      cancelled = true;
    };
  }, [loadDay, setupLoading, setupReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = () => {
      if (!setupLoading && setupReady) void loadDay();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !setupLoading && setupReady) void loadDay();
    };
    window.addEventListener("venue-booking-updated", handleUpdate);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("venue-booking-updated", handleUpdate);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadDay, setupLoading, setupReady]);

  const invalidate = useCallback(() => {
    requestGeneration.current += 1;
    setState((current) => ({ ...current, stage: "loading", day: null }));
  }, []);

  const setDate = useCallback(
    (value: string) => {
      invalidate();
      setDateState(value);
      syncUrl({ date: value });
    },
    [invalidate, setDateState, syncUrl],
  );
  const previousDay = useCallback(
    () => setDate(shiftCalendarDate(date, -1)),
    [date, setDate],
  );
  const nextDay = useCallback(
    () => setDate(shiftCalendarDate(date, 1)),
    [date, setDate],
  );
  const goToday = useCallback(
    () => setDate(todayInTimeZone(timeZoneId || "UTC")),
    [setDate, timeZoneId],
  );

  const setFacilityId = useCallback(
    (value: string) => {
      const zone = allResources.find((resource) => resource.facilityId === value)?.timeZoneId ?? "";
      invalidate();
      setFacilityIdState(value);
      setTimeZoneIdState(zone);
      setResourceIdState("");
      syncUrl({ facilityId: value, resourceId: "" });
      if (typeof window !== "undefined") {
        try {
          saveFacilityId(value);
          window.dispatchEvent(
            new CustomEvent("venue-facility-changed", { detail: { facilityId: value } }),
          );
        } catch {}
      }
    },
    [allResources, invalidate, setFacilityIdState, setResourceIdState, setTimeZoneIdState, syncUrl],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleFacilityChanged = (e: Event) => {
      const newFacilityId = (e as CustomEvent<{ facilityId: string }>).detail?.facilityId;
      if (newFacilityId && newFacilityId !== facilityId) setFacilityId(newFacilityId);
    };
    window.addEventListener("venue-facility-changed", handleFacilityChanged);
    return () => window.removeEventListener("venue-facility-changed", handleFacilityChanged);
  }, [facilityId, setFacilityId]);

  const setTimeZoneId = useCallback(
    (value: string) => {
      invalidate();
      setTimeZoneIdState(value);
      setResourceIdState("");
      syncUrl({ resourceId: "" });
    },
    [invalidate, setResourceIdState, setTimeZoneIdState, syncUrl],
  );
  const setResourceId = useCallback(
    (value: string) => {
      invalidate();
      setResourceIdState(value);
      syncUrl({ resourceId: value });
    },
    [invalidate, setResourceIdState, syncUrl],
  );

  const openBlock = useCallback(
    (block: OperationsCalendarBlock) => {
      if (isClosureBlock(block)) setSelectedClosure(block);
      else router.push(`/venue/bookings/${encodeURIComponent(block.reservationId)}`);
    },
    [router],
  );

  const createFromSlot = useCallback(
    (resource: CalendarResource, instantUtc: string) => {
      const prefill = localPrefillForInstant(instantUtc, resource.timeZoneId);
      const params = new URLSearchParams({
        facilityId: resource.facilityId,
        resourceId: resource.id,
        date: prefill.date,
        startTime: prefill.startTime,
        durationMinutes: "60",
      });
      router.push(`/venue/bookings/new?${params.toString()}`);
    },
    [router],
  );

  return {
    state,
    setupLoading,
    facilities,
    allResources,
    facilityResources,
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
    selectedClosure,
    setSelectedClosure,
    closeClosure: () => setSelectedClosure(null),
  };
}
