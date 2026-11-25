"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { usePermissions } from "@core/hooks/use-permission";
import { identityContainer } from "@modules/identity/di";

interface UseRoleDeleteViewModelProps {
  roleId?: string;
  tenantId?: string;
  open: boolean;
}

/**
 * React hook/ViewModel orchestrating state and data flows for role delete view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useRoleDeleteViewModel({ roleId, tenantId, open }: UseRoleDeleteViewModelProps) {
  const { t, language } = useI18n();
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const { isPlatformSuperAdmin } = usePermissions();

  // Fetch admin count for this role
  const { data: adminCount = 0, isLoading: isLoadingCount } = useQuery({
    queryKey: ["role-admin-count", roleId],
    queryFn: async () => {
      if (!roleId) return 0;
      return identityContainer.roleRepository.getAdminCount(roleId);
    },
    enabled: open && !!roleId,
  });

  // Fetch other roles in the same tenant for fallback selection (sorted ascending by priority: 0 = highest)
  const useCurrentTenantEndpoint = !isPlatformSuperAdmin && (!tenantId || tenantId === userTenantId);
  const { data: availableRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles-for-fallback", tenantId, roleId, useCurrentTenantEndpoint],
    queryFn: async () => {
      const result = useCurrentTenantEndpoint
        ? await identityContainer.roleRepository.getCurrentTenantRoles({
            page: 1,
            pageSize: 100,
          })
        : await identityContainer.roleRepository.getAll({
            page: 1,
            pageSize: 100,
            tenantId,
            strict: Boolean(tenantId),
          });
      return result.items
        .filter((r) => r.id !== roleId)
        .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER));
    },
    enabled: open && !!roleId && adminCount > 0,
  });

  return {
    t,
    language,
    adminCount,
    availableRoles,
    isLoading: isLoadingCount || (adminCount > 0 && isLoadingRoles),
  };
}
