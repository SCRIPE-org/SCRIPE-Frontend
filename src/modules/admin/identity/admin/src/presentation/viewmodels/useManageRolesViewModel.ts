"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { identityContainer } from "@modules/identity/di";
import type { SyncRoleAssignment } from "../../domain/interfaces/IAdminRepository";

interface UseManageRolesViewModelProps {
  adminId?: string;
  scopeTenantId: string;
  open: boolean;
}

/**
 * React hook/ViewModel orchestrating state and data flows for manage roles view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useManageRolesViewModel({
  adminId,
  scopeTenantId,
  open,
}: UseManageRolesViewModelProps) {
  const { t, language } = useI18n();
  const toast = useEnhancedToast();
  const queryClient = useQueryClient();
  const { roleRepository, adminRepository } = identityContainer;

  // Fetch available roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles-for-manage", scopeTenantId],
    queryFn: () =>
      scopeTenantId
        ? roleRepository.getAll({
            page: 1,
            pageSize: 100,
            tenantId: scopeTenantId,
            strict: true,
          })
        : roleRepository.getMyTenantRoles({
            page: 1,
            pageSize: 100,
          }),
    enabled: open && !!adminId,
  });

  // Fetch current roles
  const { data: currentRoles, isLoading: isLoadingCurrentRoles } = useQuery({
    queryKey: ["admin-roles", adminId],
    queryFn: async () => {
      if (!adminId) return [];
      return adminRepository.getRoles(adminId);
    },
    enabled: open && !!adminId,
  });

  // Sync roles mutation
  const syncMutation = useMutation({
    mutationFn: async ({
      selectedRoleIds,
      inheritToChildren,
    }: {
      selectedRoleIds: string[];
      inheritToChildren: boolean;
    }) => {
      if (!adminId) throw new Error("No admin selected");

      const assignments: SyncRoleAssignment[] = selectedRoleIds.map((roleId) => ({
        roleId,
        tenantId: scopeTenantId || undefined,
        inheritToChildren: scopeTenantId ? inheritToChildren : undefined,
      }));

      await adminRepository.syncRoles(adminId, assignments, scopeTenantId || undefined);
    },
  });

  return {
    t,
    language,
    rolesData,
    currentRoles,
    isLoading: isLoadingRoles || isLoadingCurrentRoles,
    syncRoles: async (
      selectedRoleIds: string[],
      inheritToChildren: boolean,
      onOpenChange: (open: boolean) => void
    ) => {
      try {
        await syncMutation.mutateAsync({ selectedRoleIds, inheritToChildren });
        toast.success({ title: t("admin.role.syncSuccess") || "Roles updated successfully" });
        queryClient.invalidateQueries({ queryKey: ["admin-roles", adminId] });
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        onOpenChange(false);
      } catch (error: any) {
        toast.error({ title: error?.message || t("common.error") || "Failed to update roles" });
      }
    },
    isSubmitting: syncMutation.isPending,
  };
}
