"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { EditionCategory } from "../../domain/entities/EditionCategory";
import type {
  CreateEditionCategoryRequest,
  UpdateEditionCategoryRequest,
} from "../../domain/entities/EditionCategoryRequests";

/**
 * React hook/ViewModel orchestrating state and data flows for edition categories view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useEditionCategoriesViewModel() {
  const { editionCategoryRepository } = entitlementsContainer;

  const vm = useCrudViewModel<
    EditionCategory,
    CreateEditionCategoryRequest,
    UpdateEditionCategoryRequest
  >(["entitlements", "edition-categories"], {
    getAll: async (params) => {
      const result = await editionCategoryRepository.getAll(params);
      return {
        items: result.items,
        pagination: {
          itemsCount: result.totalCount,
          pageSize: result.pageSize,
          page: result.page,
          pagesCount: result.totalPages,
        },
      };
    },
    create: async (data) => {
      const id = await editionCategoryRepository.create(data);
      return editionCategoryRepository.getById(id);
    },
    update: async (id, data) => {
      await editionCategoryRepository.update(id, data);
      return editionCategoryRepository.getById(id);
    },
    delete: async (id) => {
      await editionCategoryRepository.delete(id);
    },
  });

  return vm;
}
