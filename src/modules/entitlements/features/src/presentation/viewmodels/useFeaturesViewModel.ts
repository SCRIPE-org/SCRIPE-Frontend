/**
 * Features ViewModel
 *
 * Read-only view model — features are system-seeded and cannot be
 * created, edited, or deleted from the UI.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { Feature } from "../../domain/entities/Feature";

export function useFeaturesViewModel() {
      const { featureRepository } = entitlementsContainer;

      const vm = useCrudViewModel<Feature, never, never>(
            ["entitlements", "features"],
            {
                  getAll: async (params) => {
                        const res = await featureRepository.getAll({
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
                  // Features are system-seeded — no create, update, or delete
            }
      );

      return vm;
}
