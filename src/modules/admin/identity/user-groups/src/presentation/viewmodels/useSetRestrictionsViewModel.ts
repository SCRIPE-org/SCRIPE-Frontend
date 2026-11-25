"use client";

import { useQuery } from "@tanstack/react-query";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { usePermissions } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface UseSetRestrictionsViewModelProps {
  tenantId?: string;
  open: boolean;
}

/**
 * React hook/ViewModel orchestrating state and data flows for set restrictions view model.
 * Pre-gates permission picker endpoints by caller capabilities to prevent 403 probes and
 * defensively strips platformOnly permissions in tenant contexts.
 */
export function useSetRestrictionsViewModel({ tenantId, open }: UseSetRestrictionsViewModelProps) {
  const { t } = useI18n();
  const { user, has, isPlatformSuperAdmin } = usePermissions();

  const userTenantId = user?.tenantId ?? undefined;
  const canViewTargetTenantPerms = Boolean(
    tenantId &&
      (isPlatformSuperAdmin ||
        (tenantId !== userTenantId && has(SYSTEM_PERMISSIONS.TENANTS_VIEW)))
  );
  const canViewCreationPerms = Boolean(
    !tenantId &&
      !userTenantId &&
      (isPlatformSuperAdmin || has(SYSTEM_PERMISSIONS.TENANTS_CREATE))
  );
  const canViewTenantAvailablePerms = Boolean(
    isPlatformSuperAdmin || has(SYSTEM_PERMISSIONS.ROLES_VIEW)
  );
  const canViewAllPermissions = Boolean(
    isPlatformSuperAdmin || has(SYSTEM_PERMISSIONS.PERMISSIONS_VIEW)
  );
  const canReadCustomFields = Boolean(
    isPlatformSuperAdmin || has(SYSTEM_PERMISSIONS.CUSTOM_FIELD_VIEW)
  );

  // Fetch available permissions without firing unauthorized 403 endpoint probes
  const { data: availablePermissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: [
      "restrictions-available-permissions",
      tenantId ?? null,
      userTenantId ?? null,
      canViewTargetTenantPerms,
      canViewCreationPerms,
      canViewTenantAvailablePerms,
      canViewAllPermissions,
    ],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      const fetchPermissions = async () => {
        if (canViewTargetTenantPerms && tenantId) {
          return identityContainer.tenantRepository.getTenantPermissions(tenantId);
        }
        if (canViewCreationPerms) {
          return identityContainer.tenantRepository.getCreationPermissions();
        }
        if (canViewTenantAvailablePerms) {
          return identityContainer.roleRepository.getCurrentTenantAvailablePermissions();
        }
        if (canViewAllPermissions) {
          return identityContainer.permissionRepository.getAll();
        }
        return identityContainer.permissionRepository.getEffectivePermissions();
      };

      const permissions = await fetchPermissions();
      const isTenantScoped = Boolean(userTenantId || tenantId);
      return isTenantScoped ? permissions.filter((perm) => !perm.platformOnly) : permissions;
    },
    enabled: open && Boolean(user),
    staleTime: 5 * 60 * 1000,
  });

  return {
    t,
    availablePermissions,
    isLoadingPermissions,
    canReadCustomFields,
  };
}
