"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getVenueContainer } from "../../../../di";
import type { Site } from "../../domain/entities/Site";

export function useSiteViewModel() {
  const { siteRepository } = getVenueContainer();

  const vm = useCrudViewModel<Site>(["sites"], {
    getAll: async (params) => {
      const res = await siteRepository.getAll({
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
      const id = await siteRepository.create(data as unknown as { name: string; address?: string; timeZone?: string });
      return { id } as unknown as Site;
    },
    update: async (id, data) => {
      await siteRepository.update(id, data as unknown as { name: string; address?: string; timeZone?: string });
      return { id } as unknown as Site;
    },
    delete: async (id) => {
      await siteRepository.delete(id);
    },
  }, { deferSuccessEffects: true });

  return { vm };
}
