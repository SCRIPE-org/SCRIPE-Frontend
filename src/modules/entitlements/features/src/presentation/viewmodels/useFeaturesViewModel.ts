/**
 * Features ViewModel
 *
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { Feature } from "../../domain/entities/Feature";
import type { CreateFeatureRequest, UpdateFeatureRequest } from "../../domain/entities/FeatureRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

export function useFeaturesViewModel() {
      const { success } = useEnhancedToast();
      const { featureRepository } = entitlementsContainer;

      const vm = useCrudViewModel<Feature, CreateFeatureRequest, UpdateFeatureRequest>(
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
                  create: async (data) => {
                        const id = await featureRepository.create(data);
                        success({
                              title: "Feature Created",
                              description: "The feature has been created successfully.",
                        });
                        return { id } as Feature;
                  },
                  update: async (id, data) => {
                        await featureRepository.update(id, data);
                        success({
                              title: "Feature Updated",
                              description: "The feature has been updated successfully.",
                        });
                        return {} as Feature;
                  },
                  delete: async (id) => {
                        await featureRepository.delete(id);
                        success({
                              title: "Feature Deleted",
                              description: "The feature has been deleted successfully.",
                        });
                  },
            }
      );

      return vm;
}
