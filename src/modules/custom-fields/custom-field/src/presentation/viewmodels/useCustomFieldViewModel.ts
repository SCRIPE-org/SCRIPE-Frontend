/**
 * CustomField ViewModel
 *
 * Handles all state management for the CustomField list view.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getCustomFieldsContainer } from "../../../../di";
import type { CustomField } from "../../domain/entities/CustomField";

export function useCustomFieldViewModel() {
  const { customFieldRepository } = getCustomFieldsContainer();

  const vm = useCrudViewModel(["customField"], {
    getAll: async (params) => {
      const res = await customFieldRepository.getAll({
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
      const id = await customFieldRepository.create(data as Record<string, unknown>);
      return { id } as unknown as CustomField;
    },
    update: async (id, data) => {
      await customFieldRepository.update(id, data as Record<string, unknown>);
      return { id } as unknown as CustomField;
    },
    delete: async (id) => {
      await customFieldRepository.delete(id);
    },
  });

  return { vm };
}
