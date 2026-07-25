/**
 * PartyKernel ViewModel
 *
 * Handles all state management for the PartyKernel list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getPartyKernelContainer } from "../../../../di";
import type { PartyKernel } from "../../domain/entities/PartyKernel";

export function usePartyKernelViewModel() {
  const { partyKernelRepository } = getPartyKernelContainer();

  const vm = useCrudViewModel(["partyKernel"], {
    getAll: async (params) => {
      const res = await partyKernelRepository.getAll({
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
      const id = await partyKernelRepository.create(data as Record<string, unknown>);
      return { id } as unknown as PartyKernel;
    },
    update: async (id, data) => {
      await partyKernelRepository.update(id, data as Record<string, unknown>);
      return { id } as unknown as PartyKernel;
    },
    delete: async (id) => {
      await partyKernelRepository.delete(id);
    },
  });

  return { vm };
}
