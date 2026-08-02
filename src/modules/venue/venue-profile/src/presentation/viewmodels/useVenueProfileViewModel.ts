"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getVenueContainer } from "../../../../di";
import type { VenueProfile } from "../../domain/entities/VenueProfile";

export function useVenueProfileViewModel() {
  const { venueProfileRepository } = getVenueContainer();

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

  return { vm };
}
