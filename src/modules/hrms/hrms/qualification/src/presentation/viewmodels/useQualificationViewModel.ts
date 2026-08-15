/**
 * Qualification ViewModel
 *
 * Handles all state management for the Qualification list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getHrmsContainer } from "../../../../di";
import type { Qualification } from "../../domain/entities/Qualification";

export function useQualificationViewModel() {
  const { qualificationRepository } = getHrmsContainer();

  const vm = useCrudViewModel(["qualification"], {
    getAll: async (params) => {
      const res = await qualificationRepository.getAll({
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
      const id = await qualificationRepository.create(data as Record<string, unknown>);
      return { id } as unknown as Qualification;
    },
    update: async (id, data) => {
      await qualificationRepository.update(id, data as Record<string, unknown>);
      return { id } as unknown as Qualification;
    },
    delete: async (id) => {
      await qualificationRepository.delete(id);
    },
  }, { deferSuccessEffects: true });

  return { vm };
}
