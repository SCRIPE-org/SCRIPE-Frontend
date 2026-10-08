/**
 * PartyRelationship ViewModel
 *
 * Handles all state management for the PartyRelationship list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getPartyKernelContainer } from "../../../../di";
import type { PartyRelationship } from "../../domain/entities/PartyRelationship";

/**
 * Documentation for module export
 */
export function usePartyRelationshipViewModel() {
  const { partyRelationshipRepository } = getPartyKernelContainer();

  const vm = useCrudViewModel(
    ["partyRelationship"],
    {
      getAll: async (params) => {
        const res = await partyRelationshipRepository.getAll({
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
        const id = await partyRelationshipRepository.create(data as Record<string, unknown>);
        return { id } as unknown as PartyRelationship;
      },
      update: async (id, data) => {
        await partyRelationshipRepository.update(id, data as Record<string, unknown>);
        return { id } as unknown as PartyRelationship;
      },
      delete: async (id) => {
        await partyRelationshipRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  return { vm };
}
