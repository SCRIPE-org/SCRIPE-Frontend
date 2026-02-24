/**
 * Editions ViewModel
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { Edition } from "../../domain/entities/Edition";
import type { CreateEditionRequest, UpdateEditionRequest } from "../../domain/entities/EditionRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

export function useEditionsViewModel() {
      const { success } = useEnhancedToast();
      const { editionRepository } = entitlementsContainer;

      const vm = useCrudViewModel<Edition, CreateEditionRequest, UpdateEditionRequest>(
            ["entitlements", "editions"],
            {
                  getAll: async (params) => {
                        const res = await editionRepository.getAll({
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
                        const id = await editionRepository.create(data);
                        success({
                              title: "Edition Created",
                              description: "The edition has been created successfully.",
                        });
                        return { id } as Edition;
                  },
                  update: async (id, data) => {
                        await editionRepository.update(id, data);
                        success({
                              title: "Edition Updated",
                              description: "The edition has been updated successfully.",
                        });
                        return {} as Edition;
                  },
                  delete: async (id) => {
                        await editionRepository.delete(id);
                        success({
                              title: "Edition Deleted",
                              description: "The edition has been deleted successfully.",
                        });
                  },
            }
      );

      const router = require("next/navigation").useRouter();

      return {
            ...vm,
            navigateToFeatures: (editionId: string) => {
                  router.push(`/entitlements/editions/${editionId}`);
            },
      };
}
