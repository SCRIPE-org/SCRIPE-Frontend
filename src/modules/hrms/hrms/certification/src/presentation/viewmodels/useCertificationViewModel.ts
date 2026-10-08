/**
 * Certification ViewModel
 *
 * Handles all state management for the Certification list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getHrmsContainer } from "../../../../di";
import type { Certification } from "../../domain/entities/Certification";

/**
 * Documentation for module export
 */
export function useCertificationViewModel() {
  const { certificationRepository } = getHrmsContainer();

  const vm = useCrudViewModel(
    ["certification"],
    {
      getAll: async (params) => {
        const res = await certificationRepository.getAll({
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection,
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
        const id = await certificationRepository.create(data as Record<string, unknown>);
        return { id } as unknown as Certification;
      },
      update: async (id, data) => {
        await certificationRepository.update(id, data as Record<string, unknown>);
        return { id } as unknown as Certification;
      },
      delete: async (id) => {
        await certificationRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  return { vm };
}
