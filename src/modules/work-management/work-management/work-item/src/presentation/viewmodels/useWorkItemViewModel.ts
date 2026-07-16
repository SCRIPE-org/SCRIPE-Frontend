/**
 * WorkItem ViewModel — CRUD state via useCrudViewModel.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getWorkManagementContainer } from "../../../../di";
import type { WorkItem } from "../../domain/entities/WorkItem";

export function useWorkItemViewModel() {
  const { workItemRepository } = getWorkManagementContainer();

  const vm = useCrudViewModel(["workItem"], {
    getAll: async (params) => {
      const res = await workItemRepository.getAll({
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
      const id = await workItemRepository.create(data as Record<string, unknown>);
      return { id } as unknown as WorkItem;
    },
    update: async (id, data) => {
      await workItemRepository.update(id, data as Record<string, unknown>);
      return { id } as unknown as WorkItem;
    },
    delete: async (id) => {
      await workItemRepository.delete(id);
    },
  });

  return { vm };
}
