"use client";

import { useCallback, useEffect, useState } from "react";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getVenueContainer } from "../../../../di";
import type { VenueProfile } from "../../domain/entities/VenueProfile";

const SITE_LOOKUP_PAGE_SIZE = 500;

export function useVenueProfileViewModel() {
  const { venueProfileRepository, sitePickerService } = getVenueContainer();

  const vm = useCrudViewModel(["venueProfile"], {
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
  }, { deferSuccessEffects: true });

  // Powers the Site `server-select` field — Sites live in OrganizationCore,
  // a different backend module, so this goes through the dedicated picker
  // service rather than the venueProfileRepository.
  const searchSites = useCallback(
    async (query: string) => {
      const results = await sitePickerService.search(query);
      return results.map((site) => ({ value: site.id, label: site.name }));
    },
    [sitePickerService]
  );

  // siteId -> site name, so the table can show a name instead of a raw id.
  // VenueProfileListResponse has no denormalized site name to fall back on, so this is a
  // client-side lookup built from a bulk sites fetch (small, tenant-scoped set), mirroring
  // FacilityListView's venueProfileId -> venue name lookup for the same class of column.
  const [siteNameById, setSiteNameById] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await sitePickerService.search("", SITE_LOOKUP_PAGE_SIZE);
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const site of results) map[site.id] = site.name;
        setSiteNameById(map);
      } catch {
        // Name resolution is a display nicety — the raw id stays a usable
        // fallback in the table if this lookup fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sitePickerService]);

  return { vm, searchSites, siteNameById };
}
