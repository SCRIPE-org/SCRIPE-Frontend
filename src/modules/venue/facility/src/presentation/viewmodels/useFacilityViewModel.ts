"use client";

import { useCallback, useEffect, useState } from "react";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getVenueContainer } from "../../../../di";
import type { Facility } from "../../domain/entities/Facility";

const VENUE_PROFILE_LOOKUP_PAGE_SIZE = 500;

export function useFacilityViewModel() {
  const { facilityRepository, venueProfileRepository } = getVenueContainer();

  const vm = useCrudViewModel(["facility"], {
    getAll: async (params) => {
      const res = await facilityRepository.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
      return {
        items: res.items || [],
        pagination: {
          itemsCount: res.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: res.totalPages,
        },
      };
    },
    create: async (data) => {
      const id = await facilityRepository.create(data as Record<string, unknown>);
      return { id } as unknown as Facility;
    },
    update: async (id, data) => {
      await facilityRepository.update(id, data as Record<string, unknown>);
      return { id } as unknown as Facility;
    },
    delete: async (id) => {
      await facilityRepository.delete(id);
    },
  }, { deferSuccessEffects: true });

  // Powers the Venue `server-select` field on the create form.
  const searchVenueProfiles = useCallback(
    async (query: string) => {
      const res = await venueProfileRepository.getAll({ page: 1, pageSize: 20, search: query || undefined });
      return res.items.map((venueProfile) => ({ value: venueProfile.id, label: venueProfile.name }));
    },
    [venueProfileRepository]
  );

  // venueProfileId -> venue name, so the table can show a name instead of a
  // raw GUID. FacilityListResponse has no denormalized venue name to fall
  // back on, so this is a client-side lookup built from the venue profiles
  // list (small, tenant-scoped set) rather than a per-row fetch.
  const [venueProfileNameById, setVenueProfileNameById] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await venueProfileRepository.getAll({ page: 1, pageSize: VENUE_PROFILE_LOOKUP_PAGE_SIZE });
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const venueProfile of res.items) map[venueProfile.id] = venueProfile.name;
        setVenueProfileNameById(map);
      } catch {
        // Name resolution is a display nicety — the raw id stays a usable
        // fallback in the table if this lookup fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venueProfileRepository]);

  return { vm, searchVenueProfiles, venueProfileNameById };
}
