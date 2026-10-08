/* eslint-disable unused-imports/no-unused-vars */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface UseSetRestrictionsViewModelProps {
  tenantId?: string;
  open: boolean;
}

/**
 * React hook/ViewModel orchestrating state and data flows for set restrictions view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useSetRestrictionsViewModel({ tenantId, open }: UseSetRestrictionsViewModelProps) {
  const { t } = useI18n();

  // Fetch available permissions to distinct their resources
  const { data: availablePermissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["restrictions-available-permissions", tenantId],
    queryFn: async () => {
      try {
        if (tenantId) {
          return await identityContainer.tenantService.getTenantPermissions(tenantId);
        } else {
          return await identityContainer.tenantService.getCreationPermissions();
        }
      } catch (e) {
        return [];
      }
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  return {
    t,
    availablePermissions,
    isLoadingPermissions,
  };
}
