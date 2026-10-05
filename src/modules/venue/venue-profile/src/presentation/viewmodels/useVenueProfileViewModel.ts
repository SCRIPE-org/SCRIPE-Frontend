"use client";

import { useCallback, useEffect, useState } from "react";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { venueContainer } from "../../../../di";
import type { VenueProfile } from "../../domain/entities/VenueProfile";

const SITE_LOOKUP_PAGE_SIZE = 500;

/**
 * Presentation ViewModel hook managing Venue Profiles and related operational site lookups.
 * 
 * Provides unified CRUD operations via {@link useCrudViewModel}, asynchronously populates
 * site lookup maps for friendly name resolution, and exposes auto-complete search for sites.
 * 
 * @returns An object with the CRUD `vm`, `searchSites` callback, and `siteNameById` cache dictionary.
 */
export function useVenueProfileViewModel() {
  const { venueProfileRepository, siteRepository } = venueContainer;

  const vm = useCrudViewModel(
    ["venueProfile"],
    {
      getAll: async (params) => {
        const res = await venueProfileRepository.getAll({
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
        const id = await venueProfileRepository.create(data as Record<string, unknown>);
        return { id } as unknown as VenueProfile;
      },
      update: async (id, data) => {
        await venueProfileRepository.update(id, data as Record<string, unknown>);
        return { id } as unknown as VenueProfile;
      },
      delete: async (id) => {
        await venueProfileRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  const searchSites = useCallback(
    async (query: string) => {
      const results = await siteRepository.getAll({ page: 1, pageSize: 20, search: query });
      return results.items.map((site) => ({ value: site.id, label: site.name }));
    },
    [siteRepository]
  );

  const [siteNameById, setSiteNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await siteRepository.getAll({ page: 1, pageSize: SITE_LOOKUP_PAGE_SIZE });
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const site of results.items) map[site.id] = site.name;
        setSiteNameById(map);
      } catch {
        // Name resolution is a display nicety — the raw id stays a usable fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteRepository]);

  const refreshSites = useCallback(async () => {
    try {
      const results = await siteRepository.getAll({ page: 1, pageSize: SITE_LOOKUP_PAGE_SIZE });
      const map: Record<string, string> = {};
      for (const site of results.items) map[site.id] = site.name;
      setSiteNameById(map);
    } catch {
      // Name resolution is a display nicety
    }
  }, [siteRepository]);

  return { vm, searchSites, siteNameById, refreshSites };
}
