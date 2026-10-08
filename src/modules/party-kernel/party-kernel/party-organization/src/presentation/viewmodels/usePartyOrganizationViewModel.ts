/**
 * PartyOrganization ViewModel
 *
 * Handles all state management for the PartyOrganization list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getPartyKernelContainer } from "../../../../di";
import type { PartyOrganization } from "../../domain/entities/PartyOrganization";

/**
 * Documentation for module export
 */
export function usePartyOrganizationViewModel() {
  const { partyOrganizationRepository } = getPartyKernelContainer();

  const vm = useCrudViewModel(
    ["partyOrganization"],
    {
      getAll: async (params) => {
        const res = await partyOrganizationRepository.getAll({
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
        const id = await partyOrganizationRepository.create(data as Record<string, unknown>);
        return { id } as unknown as PartyOrganization;
      },
      update: async (id, data) => {
        await partyOrganizationRepository.update(id, data as Record<string, unknown>);
        return { id } as unknown as PartyOrganization;
      },
      delete: async (id) => {
        await partyOrganizationRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  return { vm };
}
