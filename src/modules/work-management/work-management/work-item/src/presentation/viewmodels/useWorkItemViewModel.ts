/**
 * WorkItem ViewModel — CRUD state via useCrudViewModel.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getWorkManagementContainer } from "../../../../di";
import type { WorkItem } from "../../domain/entities/WorkItem";

// ownerEntityId/assignedToId are raw Guid? on the wire (CreateWorkItemRequest /
// UpdateWorkItemRequest) -- an empty string is not a valid Guid and would fail
// backend JSON model binding with a 400, so a blank optional-id field must reach
// the API as null/absent, never "". The generic form only special-cases this
// blank -> omitted conversion for its own "date"/"number" field types, so it is
// done here instead, at this module's own create/update boundary.
function nullifyBlankIds(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  for (const key of ["ownerEntityId", "assignedToId"]) {
    const value = sanitized[key];
    if (typeof value === "string" && value.trim() === "") {
      sanitized[key] = null;
    }
  }
  return sanitized;
}

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
      const id = await workItemRepository.create(nullifyBlankIds(data as Record<string, unknown>));
      return { id } as unknown as WorkItem;
    },
    update: async (id, data) => {
      await workItemRepository.update(id, nullifyBlankIds(data as Record<string, unknown>));
      return { id } as unknown as WorkItem;
    },
    delete: async (id) => {
      await workItemRepository.delete(id);
    },
  });

  return { vm };
}
