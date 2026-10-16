/**
 * StaffAssignment ViewModel
 *
 * Handles all state management for the StaffAssignment list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getHrmsContainer } from "../../../../di";
import type { StaffAssignment } from "../../domain/entities/StaffAssignment";

/**
 * Documentation for module export
 */
export function useStaffAssignmentViewModel() {
  const { staffAssignmentRepository } = getHrmsContainer();

  const vm = useCrudViewModel(
    ["staffAssignment"],
    {
      getAll: async (params) => {
        const res = await staffAssignmentRepository.getAll({
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
        const id = await staffAssignmentRepository.create(data as Record<string, unknown>);
        return { id } as unknown as StaffAssignment;
      },
      update: async (id, data) => {
        await staffAssignmentRepository.update(id, data as Record<string, unknown>);
        return { id } as unknown as StaffAssignment;
      },
      delete: async (id) => {
        await staffAssignmentRepository.delete(id);
      },
    },
    { deferSuccessEffects: true }
  );

  return { vm };
}
