"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { userGroupKeys } from "./useUserGroupsViewModel";
import { appLogger } from "@/core/common/logger";
import type { GenericSelectOption } from "@core/crud/components/generic-select";

interface UseAssignToGroupViewModelProps {
  tenantId?: string;
  useMyTenant?: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * React hook/ViewModel orchestrating state and data flows for assign to group view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useAssignToGroupViewModel({
  tenantId,
  useMyTenant,
  onOpenChange,
}: UseAssignToGroupViewModelProps) {
  const { t, language } = useI18n();
  // `success`/`error` are used directly rather than the operationSuccess/
  // operationError wrapper: the wrapper rebuilds "{itemName} has been
  // {operation} successfully" around whatever itemName it is given, which
  // would double up on the already-complete multiAssignSuccess sentence below.
  const { success, error } = useEnhancedToast();
  const queryClient = useQueryClient();

  const fetchGroups = async (term: string): Promise<GenericSelectOption[]> => {
    try {
      let result;
      const baseParams = {
        page: 1,
        pageSize: 50,
        search: term,
        isActive: true,
      };

      if (tenantId) {
        result = await identityContainer.userGroupRepository.getAll({
          ...baseParams,
          tenantId,
        });
      } else if (useMyTenant) {
        result = await identityContainer.userGroupRepository.getMyTenantGroups(baseParams);
      } else {
        result = await identityContainer.userGroupRepository.getAll(baseParams);
      }

      return result.items.map((g) => ({
        value: g.id,
        label: language === "ar" ? g.nameAr : g.nameEn,
        description: g.code,
      }));
    } catch (err) {
      appLogger.error("Failed to search groups", err);
      return [];
    }
  };

  const addMembers = useMutation({
    mutationFn: async ({
      adminIds,
      selectedGroupIds,
    }: {
      adminIds: string[];
      selectedGroupIds: string[];
    }) => {
      for (const groupId of selectedGroupIds) {
        await identityContainer.userGroupRepository.addMembers(groupId, {
          adminIds,
        });
      }
    },
  });

  const addRoles = useMutation({
    mutationFn: async ({
      roleIds,
      selectedGroupIds,
    }: {
      roleIds: string[];
      selectedGroupIds: string[];
    }) => {
      for (const groupId of selectedGroupIds) {
        const group = await identityContainer.userGroupRepository.getById(groupId);
        const currentRoleIds = group.roles.map((r: any) => r.roleId);
        for (const tId of roleIds) {
          if (!currentRoleIds.includes(tId)) {
            currentRoleIds.push(tId);
          }
        }
        await identityContainer.userGroupRepository.setRoles(groupId, { roleIds: currentRoleIds });
      }
    },
  });

  return {
    t,
    language,
    fetchGroups,
    addMembers: async (adminIds: string[], selectedGroupIds: string[]) => {
      try {
        await addMembers.mutateAsync({ adminIds, selectedGroupIds });
        success({
          title: t("userGroups.assignAction"),
          description: t("userGroups.multiAssignSuccess", {
            admins: adminIds.length,
            groups: selectedGroupIds.length,
          }),
        });
        queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        onOpenChange(false);
      } catch (err: any) {
        error({ title: t("userGroups.assignToGroups"), description: err.message });
      }
    },
    addRoles: async (roleIds: string[], selectedGroupIds: string[]) => {
      try {
        await addRoles.mutateAsync({ roleIds, selectedGroupIds });
        success({
          title: t("userGroups.assignAction"),
          description: t("userGroups.multiAssignSuccess", {
            admins: roleIds.length,
            groups: selectedGroupIds.length,
          }),
        });
        queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        onOpenChange(false);
      } catch (err: any) {
        error({ title: t("userGroups.assignToGroups"), description: err.message });
      }
    },
    isPending: addMembers.isPending || addRoles.isPending,
  };
}
