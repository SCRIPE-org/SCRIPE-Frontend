"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getVenueContainer } from "../../../../di";
import type { Site } from "../../domain/entities/Site";

/**
 * Custom React hook providing the MVVM presentation layer for Venue Sites management.
 *
 * Leverages {@link useCrudViewModel} to bridge UI components with {@link ISiteRepository},
 * managing pagination, search queries, asynchronous state transitions, and mutation side-effects.
 *
 * @returns Object containing the standardized CRUD view model instance (`vm`).
 */
export function useSiteViewModel() {
  const { siteRepository } = getVenueContainer();

  const vm = useCrudViewModel<Site>(
    ["sites"],
    {
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
        const id = await siteRepository.create(
          data as unknown as { name: string; address?: string; timeZone?: string }
        );
        return { id } as unknown as Site;
      },
      update: async (id, data) => {
        await siteRepository.update(
          id,
          data as unknown as { name: string; address?: string; timeZone?: string }
        );
        return { id } as unknown as Site;
      },
      delete: async (id) => {
        await siteRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  return { vm };
}
