"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getVenueContainer } from "../../../../di";
import type { Facility } from "../../domain/entities/Facility";

export function useFacilityViewModel() {
  const { facilityRepository } = getVenueContainer();

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
  });

  return { vm };
}
