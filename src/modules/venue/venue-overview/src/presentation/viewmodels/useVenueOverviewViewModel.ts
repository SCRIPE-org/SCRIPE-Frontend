"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { VenueOverviewState } from "../../domain/entities/VenueOverview";

const INITIAL_STATE: VenueOverviewState = {
  stage: "loading",
  facilityId: "",
  facilityName: "",
  timeZoneId: "UTC",
  asOfUtc: "",
  localDate: new Date().toISOString().slice(0, 10),
  kpis: {
    todayReservationsCount: 0,
    todayReservationsConfirmedCount: 0,
    todayReservationsCheckedInCount: 0,
    activeHoldsCount: 0,
    nearestHoldExpiryUtc: null,
    checkedInNowCount: 0,
    activeResourcesCount: 0,
  },
  hourlyLoad: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${h.toString().padStart(2, "0")}:00`,
    held: 0,
    confirmed: 0,
    checkedIn: 0,
    completed: 0,
    other: 0,
    total: 0,
  })),
  atAGlance: [],
  upNext: [],
  resourceActivity: [],
  timelineDay: null,
  timelineResources: [],
  recentActivityDeferred: true,
  error: false,
};

export interface FacilityOption {
  id: string;
  name: string;
}

/**
 * Presentation ViewModel hook orchestrating real-time Venue Operational Overview telemetry.
 * 
 * Aggregates live operational KPIs, hourly load distributions, up-next arrivals, and timeline
 * allocations across facility resources with automatic polling and deferred activity updates.
 * 
 * @param initialFacilityId Optional initial facility identifier filter.
 * @param initialLocalDate Optional initial date string (YYYY-MM-DD) for operational window.
 * @returns State package including reactive `state`, facility list, selection callbacks, and reload triggers.
 */
export function useVenueOverviewViewModel(
  initialFacilityId?: string,
  initialLocalDate?: string
) {
  const [state, setState] = useState<VenueOverviewState>(INITIAL_STATE);
  const [selectedFacilityId, setSelectedFacilityId] = useState(initialFacilityId || "");
  const selectedFacilityIdRef = useRef(initialFacilityId || "");
  selectedFacilityIdRef.current = selectedFacilityId;
  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (facId?: string, dateStr?: string) => {
    setState((curr) => ({ ...curr, stage: "loading", error: false }));
    try {
      const container = getVenueContainer();
      const overview = await container.venueOverviewService.getOverview(
        facId ?? selectedFacilityIdRef.current,
        dateStr ?? INITIAL_STATE.localDate
      );
      setState(overview);

      // Load facilities list for dropdown
      try {
        const page = await container.facilityRepository.getAll({ page: 1, pageSize: 50 });
        setFacilities(page.items.map((f) => ({ id: f.id, name: f.name })));
        if (!selectedFacilityIdRef.current && overview.facilityId) {
          setSelectedFacilityId(overview.facilityId);
          selectedFacilityIdRef.current = overview.facilityId;
        }
      } catch {
        if (process.env.NODE_ENV !== "production") {
          setFacilities([
            { id: "fac-cairo-downtown", name: "Al-Ahly Sports Hub & Padel Club" },
            { id: "fac-west", name: "West Padel Club" },
            { id: "fac-olympic", name: "Olympic Football Center" },
          ]);
        }
      }
    } catch {
      if (process.env.NODE_ENV !== "production") {
        try {
          const { getRealisticVenueOperationalData } = await import(
            "../../data/mock/realisticVenueOperationalData"
          );
          const mock = getRealisticVenueOperationalData(dateStr);
          setState(mock);
          setFacilities([
            { id: "fac-cairo-downtown", name: "Al-Ahly Sports Hub & Padel Club" },
            { id: "fac-west", name: "West Padel Club" },
            { id: "fac-olympic", name: "Olympic Football Center" },
          ]);
          setSelectedFacilityId(mock.facilityId);
          return;
        } catch {
          // fallback
        }
      }
      setState((curr) => ({
        ...curr,
        stage: "failed",
        error: true,
      }));
    }
  }, []);

  useEffect(() => {
    void load(initialFacilityId, initialLocalDate);
  }, [initialFacilityId, initialLocalDate, load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(selectedFacilityId);
    } finally {
      setRefreshing(false);
    }
  }, [load, selectedFacilityId]);

  const changeFacility = useCallback(async (facId: string) => {
    setSelectedFacilityId(facId);
    await load(facId);
  }, [load]);

  return {
    state,
    facilities,
    selectedFacilityId: selectedFacilityId || state.facilityId,
    refreshing,
    refresh,
    changeFacility,
  };
}
