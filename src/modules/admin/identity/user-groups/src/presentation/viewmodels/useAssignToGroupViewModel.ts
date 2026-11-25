/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useSessionAuthorizationSync } from "@core/hooks/use-session-authorization-sync";
import { isSudoCancelledError } from "@core/store/useSudoStore";
import { userGroupKeys } from "./useUserGroupsViewModel";
import { appLogger } from "@/core/common/logger";
import { resolveBilingualLabel } from "@core/common/utils";
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
  const { success, error, info } = useEnhancedToast();
  const queryClient = useQueryClient();
  const syncSessionAuthorization = useSessionAuthorizationSync();

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
        result = await identityContainer.userGroupRepository.getCurrentTenantGroups(baseParams);
      } else {
        result = await identityContainer.userGroupRepository.getAll(baseParams);
      }

      return result.items.map((g) => ({
        value: g.id,
        label: resolveBilingualLabel(g.nameEn, g.nameAr, language),
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
      progress,
    }: {
      adminIds: string[];
      selectedGroupIds: string[];
      progress: { committedCount: number };
    }) => {
      for (const groupId of selectedGroupIds) {
        await identityContainer.userGroupRepository.addMembers(groupId, {
          adminIds,
        });
        progress.committedCount += 1;
      }
    },
  });

  const addRoles = useMutation({
    mutationFn: async ({
      roleIds,
      selectedGroupIds,
      progress,
    }: {
      roleIds: string[];
      selectedGroupIds: string[];
      progress: { committedCount: number };
    }) => {
      for (const groupId of selectedGroupIds) {
        const group = await identityContainer.userGroupRepository.getById(groupId);
        const currentRoleIds = group.roles.map((r: any) => r.roleId);
        for (const tId of roleIds) {
          if (!currentRoleIds.includes(tId)) {
            currentRoleIds.push(tId);
          }
        }
        await identityContainer.userGroupRepository.setRoles(groupId, {
          roleIds: currentRoleIds,
          ...(group.rowVersion != null ? { rowVersion: group.rowVersion } : {}),
        });
        progress.committedCount += 1;
      }
    },
  });

  const handleAssignError = (err: unknown) => {
    if (isSudoCancelledError(err)) {
      info({
        title: t("profile.sudo.cancelledTitle"),
        description: t("profile.sudo.cancelledDescription"),
      });
      return;
    }
    const message = err instanceof Error ? err.message : t("common.error");
    error({ title: t("userGroups.assignToGroups"), description: message });
  };

  const finalizePartialOrFullCommit = async (
    committedCount: number,
    secondaryQueryKey: readonly string[]
  ) => {
    if (committedCount <= 0) return;
    queryClient.invalidateQueries({ queryKey: userGroupKeys.lists() });
    queryClient.invalidateQueries({ queryKey: secondaryQueryKey });
    try {
      await syncSessionAuthorization(tenantId ?? null);
    } catch {
      // Best-effort authorization sync must not mask an already-committed assignment.
    }
  };

  return {
    t,
    language,
    fetchGroups,
    addMembers: async (adminIds: string[], selectedGroupIds: string[]): Promise<boolean> => {
      const progress = { committedCount: 0 };
      try {
        await addMembers.mutateAsync({ adminIds, selectedGroupIds, progress });
        success({
          title: t("userGroups.assignAction"),
          description: t("userGroups.multiAssignSuccess", {
            admins: adminIds.length,
            groups: selectedGroupIds.length,
          }),
        });
        onOpenChange(false);
        return true;
      } catch (err: unknown) {
        handleAssignError(err);
        return false;
      } finally {
        await finalizePartialOrFullCommit(progress.committedCount, ["admins"]);
      }
    },
    addRoles: async (roleIds: string[], selectedGroupIds: string[]): Promise<boolean> => {
      const progress = { committedCount: 0 };
      try {
        await addRoles.mutateAsync({ roleIds, selectedGroupIds, progress });
        success({
          title: t("userGroups.assignAction"),
          description: t("userGroups.multiAssignSuccess", {
            admins: roleIds.length,
            groups: selectedGroupIds.length,
          }),
        });
        onOpenChange(false);
        return true;
      } catch (err: unknown) {
        handleAssignError(err);
        return false;
      } finally {
        await finalizePartialOrFullCommit(progress.committedCount, ["roles"]);
      }
    },
    isPending: addMembers.isPending || addRoles.isPending,
  };
}
