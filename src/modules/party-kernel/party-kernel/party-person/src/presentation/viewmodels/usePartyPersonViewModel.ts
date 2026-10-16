/**
 * PartyPerson ViewModel
 *
 * Handles all state management for the PartyPerson list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getPartyKernelContainer } from "../../../../di";
import type { PartyPerson } from "../../domain/entities/PartyPerson";
import { useCallback } from "react";

/**
 * Documentation for module export
 */
export function usePartyPersonViewModel() {
  const { partyPersonRepository, partyRepository } = getPartyKernelContainer();

  const vm = useCrudViewModel(
    ["partyPerson"],
    {
      getAll: async (params) => {
        const res = await partyPersonRepository.getAll({
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
        const id = await partyPersonRepository.create(data as Record<string, unknown>);
        return { id } as unknown as PartyPerson;
      },
      update: async (id, data) => {
        await partyPersonRepository.update(id, data as Record<string, unknown>);
        return { id } as unknown as PartyPerson;
      },
      delete: async (id) => {
        await partyPersonRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  const lookupParties = useCallback(
    async (query: string) => {
      const res = await partyRepository.lookupContacts({
        search: query,
        type: "Person",
        pageSize: 20,
      });
      return (res.items || []).map((p) => ({
        value: p.id,
        label: p.displayName ? `${p.displayName} (${p.id.length > 8 ? `${p.id.slice(0, 8)}…` : p.id})` : p.id,
      }));
    },
    [partyRepository]
  );

  return { vm, lookupParties };
}
