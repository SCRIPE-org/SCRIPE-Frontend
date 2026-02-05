/**
 * Role Selector Hook
 *
 * Fetches available roles for selection in admin forms.
 * Supports tenant-scoped roles with filtering and search.
 */
import { useQuery } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import type { Role } from "@modules/system/roles/src/domain/entities/Role";

interface UseRoleSelectorOptions {
      /** Optional tenant ID to filter roles by */
      tenantId?: string;
      /** Only fetch roles for current user's tenant */
      useMyTenant?: boolean;
      /** Enabled state */
      enabled?: boolean;
}

interface UseRoleSelectorReturn {
      roles: Role[];
      isLoading: boolean;
      isError: boolean;
      error: Error | null;
}

/**
 * Hook to fetch roles for selection in forms (e.g., admin creation)
 */
export function useRoleSelector(options: UseRoleSelectorOptions = {}): UseRoleSelectorReturn {
      const { tenantId, useMyTenant = true, enabled = true } = options;
      const { roleRepository } = systemContainer;

      const { data, isLoading, isError, error } = useQuery({
            queryKey: ["roles-selector", tenantId, useMyTenant],
            queryFn: async () => {
                  // Use getAll with optional tenantId filter
                  // The repository will use the appropriate endpoint based on parameters
                  const response = await roleRepository.getAll({
                        page: 1,
                        pageSize: 100,
                        tenantId: tenantId
                  });
                  return response.items;
            },
            enabled,
            staleTime: 5 * 60 * 1000, // 5 minutes
      });

      return {
            roles: data || [],
            isLoading,
            isError,
            error: error as Error | null,
      };
}

/**
 * Custom hook for role selection dropdown with search
 */
export function useRoleSelectorWithSearch(options: UseRoleSelectorOptions = {}) {
      const { roles, isLoading, isError, error } = useRoleSelector(options);

      const getRoleOptions = (language: string = 'en') => {
            return roles.map((role) => ({
                  value: role.id,
                  label: language === 'ar' ? role.nameAr : role.nameEn,
                  description: language === 'ar' ? role.descriptionAr : role.descriptionEn,
                  priority: role.priority,
                  isSystem: role.isSystem,
            }));
      };

      const findRoleById = (roleId: string): Role | undefined => {
            return roles.find((r) => r.id === roleId);
      };

      return {
            roles,
            roleOptions: getRoleOptions(),
            isLoading,
            isError,
            error,
            findRoleById,
      };
}
