"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface UseSetRolesViewModelProps {
  tenantId?: string;
  open: boolean;
}

/**
 * React hook/ViewModel managing logic, state, and repository queries for set roles view model.
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
        : identityContainer.roleRepository.getMyTenantRoles({
            page: 1,
            pageSize: 100,
          }),
    enabled: open,
  });

  return {
    t,
    language,
    rolesData,
    isLoading,
  };
}
