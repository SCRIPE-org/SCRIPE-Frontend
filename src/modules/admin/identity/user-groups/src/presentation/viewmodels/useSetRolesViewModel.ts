"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveBilingualLabel } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface UseSetRolesViewModelProps {
  tenantId?: string;
  open: boolean;
}

/**
 * React hook/ViewModel orchestrating state and data flows for set roles view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useSetRolesViewModel({ tenantId, open }: UseSetRolesViewModelProps) {
  const { t, language } = useI18n();

  // Fetch all available roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles-for-group-assign", tenantId],
    queryFn: () =>
      tenantId
        ? identityContainer.roleRepository.getAll({
            page: 1,
            pageSize: 100,
            tenantId,
            strict: true,
          })
        : identityContainer.roleRepository.getCurrentTenantRoles({
            page: 1,
            pageSize: 100,
          }),
    enabled: open,
  });

  const sortedRolesData = useMemo(() => {
    if (!rolesData) return rolesData;
    const sortedItems = [...(rolesData.items ?? [])].sort((a, b) => {
      const priorityDiff =
        (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER);
      if (priorityDiff !== 0) return priorityDiff;
      const labelA = resolveBilingualLabel(a.nameEn, a.nameAr, language);
      const labelB = resolveBilingualLabel(b.nameEn, b.nameAr, language);
      return labelA.localeCompare(labelB) || a.code.localeCompare(b.code);
    });
    return {
      ...rolesData,
      items: sortedItems,
    };
  }, [rolesData, language]);

  return {
    t,
    language,
    rolesData: sortedRolesData,
    isLoading,
  };
}
