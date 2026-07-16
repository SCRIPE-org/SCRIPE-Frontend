/**
* Hrms ViewModel
*
* Handles all state management for the Hrms list view.
* Uses useCrudViewModel for standard CRUD operations.
*/
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getHrmsContainer } from "../../../../di";
import type { Hrms } from "../../domain/entities/Hrms";

export function useHrmsViewModel() {
const { hrmsRepository } = getHrmsContainer();

const vm = useCrudViewModel(["hrms"], {
getAll: async (params) => {
const res = await hrmsRepository.getAll({
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
const id = await hrmsRepository.create(data as Record<string, unknown>);
  return { id } as unknown as Hrms;
  },
  update: async (id, data) => {
  await hrmsRepository.update(id, data as Record<string, unknown>);
    return { id } as unknown as Hrms;
    },
    delete: async (id) => {
    await hrmsRepository.delete(id);
    },
    });

    return { vm };
    }