"use client";

import { useCallback } from "react";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getVenueContainer } from "../../../../di";
import type { VenueProfile } from "../../domain/entities/VenueProfile";

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
  });

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

  return { vm, searchSites };
}
