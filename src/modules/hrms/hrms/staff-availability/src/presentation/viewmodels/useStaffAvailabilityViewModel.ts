/**
 * StaffAvailability ViewModel
 *
 * Handles all state management for the StaffAvailability list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getHrmsContainer } from "../../../../di";
import type { StaffAvailability } from "../../domain/entities/StaffAvailability";

export function useStaffAvailabilityViewModel() {
  const { staffAvailabilityRepository } = getHrmsContainer();

  const vm = useCrudViewModel(["staffAvailability"], {
    getAll: async (params) => {
      const res = await staffAvailabilityRepository.getAll({
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
      const id = await staffAvailabilityRepository.create(data as Record<string, unknown>);
      return { id } as unknown as StaffAvailability;
    },
    update: async (id, data) => {
      await staffAvailabilityRepository.update(id, data as Record<string, unknown>);
      return { id } as unknown as StaffAvailability;
    },
    delete: async (id) => {
      await staffAvailabilityRepository.delete(id);
    },
  });

  return { vm };
}
