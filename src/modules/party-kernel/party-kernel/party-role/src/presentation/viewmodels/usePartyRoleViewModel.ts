/**
 * PartyRole ViewModel
 *
 * Handles all state management for the PartyRole list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getPartyKernelContainer } from "../../../../di";
import type { PartyRole } from "../../domain/entities/PartyRole";

export function usePartyRoleViewModel() {
  const { partyRoleRepository } = getPartyKernelContainer();

  const vm = useCrudViewModel(["partyRole"], {
    getAll: async (params) => {
      const res = await partyRoleRepository.getAll({
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
      const id = await partyRoleRepository.create(data as Record<string, unknown>);
      return { id } as unknown as PartyRole;
    },
    update: async (id, data) => {
      await partyRoleRepository.update(id, data as Record<string, unknown>);
      return { id } as unknown as PartyRole;
    },
    delete: async (id) => {
      await partyRoleRepository.delete(id);
    },
  }, { deferSuccessEffects: true });

  return { vm };
}
