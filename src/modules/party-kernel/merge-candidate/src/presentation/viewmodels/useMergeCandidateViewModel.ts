/**
* MergeCandidate ViewModel
*
* Handles all state management for the MergeCandidate list view.
* Uses useCrudViewModel for standard CRUD operations.
*/
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getPartyKernelContainer } from "../../../../di";
import type { MergeCandidate } from "../../domain/entities/MergeCandidate";

export function useMergeCandidateViewModel() {
const { mergeCandidateRepository } = getPartyKernelContainer();

const vm = useCrudViewModel(["mergeCandidate"], {
getAll: async (params) => {
const res = await mergeCandidateRepository.getAll({
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
const id = await mergeCandidateRepository.create(data as Record<string, unknown>);
      return { id } as unknown as MergeCandidate;
      },
      update: async (id, data) => {
      await mergeCandidateRepository.update(id, data as Record<string, unknown>);
            return { id } as unknown as MergeCandidate;
            },
            delete: async (id) => {
            await mergeCandidateRepository.delete(id);
            },
            });

            return { vm };
            }