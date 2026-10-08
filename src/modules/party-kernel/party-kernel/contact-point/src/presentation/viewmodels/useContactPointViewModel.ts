/**
 * ContactPoint ViewModel
 *
 * Handles all state management for the ContactPoint list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getPartyKernelContainer } from "../../../../di";
import type { ContactPoint } from "../../domain/entities/ContactPoint";

/**
 * Documentation for module export
 */
export function useContactPointViewModel() {
  const { contactPointRepository } = getPartyKernelContainer();

  const vm = useCrudViewModel(
    ["contactPoint"],
    {
      getAll: async (params) => {
        const res = await contactPointRepository.getAll({
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
        const id = await contactPointRepository.create(data as Record<string, unknown>);
        return { id } as unknown as ContactPoint;
      },
      update: async (id, data) => {
        await contactPointRepository.update(id, data as Record<string, unknown>);
        return { id } as unknown as ContactPoint;
      },
      delete: async (id) => {
        await contactPointRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  return { vm };
}
