/**
* StaffCompetency ViewModel
*
* Handles all state management for the StaffCompetency list view.
* Uses useCrudViewModel for standard CRUD operations.
*/
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getHrmsContainer } from "../../../../di";
import type { StaffCompetency } from "../../domain/entities/StaffCompetency";

export function useStaffCompetencyViewModel() {
const { staffCompetencyRepository } = getHrmsContainer();

const vm = useCrudViewModel(["staffCompetency"], {
getAll: async (params) => {
const res = await staffCompetencyRepository.getAll({
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
const id = await staffCompetencyRepository.create(data as Record<string, unknown>);
      return { id } as unknown as StaffCompetency;
      },
      update: async (id, data) => {
      await staffCompetencyRepository.update(id, data as Record<string, unknown>);
            return { id } as unknown as StaffCompetency;
            },
            delete: async (id) => {
            await staffCompetencyRepository.delete(id);
            },
            });

            return { vm };
            }