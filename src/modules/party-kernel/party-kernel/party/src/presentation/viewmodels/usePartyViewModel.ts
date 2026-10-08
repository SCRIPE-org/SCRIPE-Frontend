/**
 * Party ViewModel
 *
 * Handles all state management for the Party list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getPartyKernelContainer } from "../../../../di";
import type { Party } from "../../domain/entities/Party";

/**
 * Documentation for module export
 */
export function usePartyViewModel() {
  const { partyRepository } = getPartyKernelContainer();

  const vm = useCrudViewModel(
    ["party"],
    {
      getAll: async (params) => {
        const res = await partyRepository.getAll({
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
        const id = await partyRepository.create(data as Record<string, unknown>);
        return { id } as unknown as Party;
      },
      update: async (id, data) => {
        await partyRepository.update(id, data as Record<string, unknown>);
        return { id } as unknown as Party;
      },
      delete: async (id) => {
        await partyRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  return { vm };
}
