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
import type { FieldOption } from "@core/ui/forms/generic-form";

export function useStaffMemberViewModel() {
  const { staffMemberRepository } = getHrmsContainer();

  const vm = useCrudViewModel(["staffMember"], {
    getAll: async (params) => {
      const res = await staffMemberRepository.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
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
  }, { deferSuccessEffects: true });

  // Linked User Account picker (F-86): identityUserId is now a server-select
  // resolving to an Identity Admin or User, not a free-text field the caller
  // has no way to fill in correctly (the backend requires it to decrypt to a
  // real, tenant-scoped Admin/User and fails closed otherwise).
  const searchIdentityUsers = async (query: string): Promise<FieldOption[]> => {
    const results = await staffMemberRepository.searchIdentityUsers(query);
    return results.map((r) => ({
      value: r.id,
      label: r.email ? `${r.name} (${r.email})` : r.name,
    }));
  };

  return { vm, searchIdentityUsers };
}
