/**
* StaffMember ViewModel
*
* Handles all state management for the StaffMember list view.
* Uses useCrudViewModel for standard CRUD operations.
*/
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getHrmsContainer } from "../../../../di";
import type { StaffMember } from "../../domain/entities/StaffMember";

export function useStaffMemberViewModel() {
const { staffMemberRepository } = getHrmsContainer();

const vm = useCrudViewModel(["staffMember"], {
getAll: async (params) => {
const res = await staffMemberRepository.getAll({
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
const id = await staffMemberRepository.create(data as Record<string, unknown>);
      return { id } as unknown as StaffMember;
      },
      update: async (id, data) => {
      await staffMemberRepository.update(id, data as Record<string, unknown>);
            return { id } as unknown as StaffMember;
            },
            delete: async (id) => {
            await staffMemberRepository.delete(id);
            },
            });

            return { vm };
            }