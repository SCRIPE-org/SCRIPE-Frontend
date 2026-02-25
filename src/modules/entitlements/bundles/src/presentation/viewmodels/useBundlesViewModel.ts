/**
 * Bundles ViewModel
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { Bundle } from "../../domain/entities/Bundle";
import type { CreateBundleRequest, UpdateBundleRequest } from "../../domain/entities/BundleRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

export function useBundlesViewModel() {
      const { success } = useEnhancedToast();
      const { bundleRepository } = entitlementsContainer;

      const vm = useCrudViewModel<Bundle, CreateBundleRequest, UpdateBundleRequest>(
            ["entitlements", "bundles"],
            {
                  getAll: async (params) => {
                        const res = await bundleRepository.getAll({
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
                        const id = await bundleRepository.create(data);
                        success({
                              title: "Bundle Created",
                              description: "The bundle has been created successfully.",
                        });
                        return { id } as unknown as Bundle;
                  },
                  update: async (id, data) => {
                        await bundleRepository.update(id, data);
                        success({
                              title: "Bundle Updated",
                              description: "The bundle has been updated successfully.",
                        });
                        return {} as Bundle;
                  },
                  delete: async (id) => {
                        await bundleRepository.delete(id);
                        success({
                              title: "Bundle Deleted",
                              description: "The bundle has been deleted successfully.",
                        });
                  },
            }
      );

      return vm;
}
