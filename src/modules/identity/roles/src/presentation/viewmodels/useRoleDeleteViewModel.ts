"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface UseRoleDeleteViewModelProps {
  roleId?: string;
  tenantId?: string;
  open: boolean;
}

export function useRoleDeleteViewModel({ roleId, tenantId, open }: UseRoleDeleteViewModelProps) {
  const { t, language } = useI18n();

  // Fetch admin count for this role
  const { data: adminCount = 0, isLoading: isLoadingCount } = useQuery({
    queryKey: ["role-admin-count", roleId],
    queryFn: async () => {
      if (!roleId) return 0;
      return identityContainer.roleRepository.getAdminCount(roleId);
    },
    enabled: open && !!roleId,
  });

  // Fetch other roles in the same tenant for fallback selection
  const { data: availableRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles-for-fallback", tenantId, roleId],
    queryFn: async () => {
      const result = await identityContainer.roleRepository.getAll({
        page: 1,
        pageSize: 100,
        tenantId: tenantId,
      });
      return result.items.filter((r) => r.id !== roleId);
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
