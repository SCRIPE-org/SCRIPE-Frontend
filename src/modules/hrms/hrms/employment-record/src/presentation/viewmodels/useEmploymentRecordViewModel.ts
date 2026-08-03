/**
 * EmploymentRecord ViewModel
 *
 * Handles all state management for the EmploymentRecord list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getHrmsContainer } from "../../../../di";
import type { EmploymentRecord } from "../../domain/entities/EmploymentRecord";

export function useEmploymentRecordViewModel() {
  const { employmentRecordRepository } = getHrmsContainer();

  const vm = useCrudViewModel(["employmentRecord"], {
    getAll: async (params) => {
      const res = await employmentRecordRepository.getAll({
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
      const id = await employmentRecordRepository.create(data as Record<string, unknown>);
      return { id } as unknown as EmploymentRecord;
    },
    update: async (id, data) => {
      await employmentRecordRepository.update(id, data as Record<string, unknown>);
      return { id } as unknown as EmploymentRecord;
    },
    delete: async (id) => {
      await employmentRecordRepository.delete(id);
    },
  });

  return { vm };
}
