/**
 * CustomField ViewModel
 *
 * Handles state management for the CustomField list view and entity-types discovery query.
 * Uses useCrudViewModel for standard CRUD operations and TanStack Query for caching entity types.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getCustomFieldsContainer } from "../../../../di";
import type { CustomField } from "../../domain/entities/CustomField";

export function useCustomFieldViewModel() {
  const { customFieldRepository } = getCustomFieldsContainer();

  const { data: entityTypes = [], isLoading: isEntityTypesLoading } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60, // Cache entity types for 1 hour
  });

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

  return { vm, entityTypes, isEntityTypesLoading };
}
