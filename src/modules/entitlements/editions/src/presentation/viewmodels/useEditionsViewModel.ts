/**
 * Editions ViewModel
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { Edition } from "../../domain/entities/Edition";
import type {
  CreateEditionRequest,
  UpdateEditionRequest,
} from "../../domain/entities/EditionRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * React hook/ViewModel managing logic, state, and repository queries for editions view model.
 */
export function useEditionsViewModel() {
  const { success } = useEnhancedToast();
  const { editionRepository } = entitlementsContainer;
  const router = useRouter();
  const { t } = useI18n();

  // M-10: Fetch ALL editions for dropdown selects (fallback, assign, etc.)
  // This ensures the dropdown is not limited to the current paginated page.
  const { data: allEditionsData } = useQuery({
    queryKey: ["entitlements", "editions", "all-for-select"],
    queryFn: () => editionRepository.getAll({ page: 1, pageSize: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const allEditionsForSelect = allEditionsData?.items ?? [];

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
          title: t("entitlements.editions.created"),
          description: t("entitlements.editions.createdDesc"),
        });
        return { id } as Edition;
      },
      update: async (id, data) => {
        await editionRepository.update(id, data);
        success({
          title: t("entitlements.editions.updated"),
          description: t("entitlements.editions.updatedDesc"),
        });
        return {} as Edition;
      },
      delete: async (id) => {
        await editionRepository.delete(id);
        success({
          title: t("entitlements.editions.deleted"),
          description: t("entitlements.editions.deletedDesc"),
        });
      },
    }
  );

  return {
    ...vm,
    allEditionsForSelect,
    navigateToFeatures: (editionId: string) => {
      router.push(`/entitlements/editions/${editionId}`);
    },
  };
}
