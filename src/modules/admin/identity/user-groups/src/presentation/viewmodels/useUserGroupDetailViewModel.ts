/**
 * User Group Detail ViewModel
 *
 * Loads a single user group by ID with members, roles, restrictions.
 * Provides mutations for member/role/restriction management.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { userGroupKeys } from "./useUserGroupsViewModel";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useSessionAuthorizationSync } from "@core/hooks/use-session-authorization-sync";
import { useI18n } from "@core/providers/i18n-provider";
import { isSudoCancelledError } from "@core/store/useSudoStore";

/**
 * React hook/ViewModel orchestrating state and data flows for user group detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useUserGroupDetailViewModel(groupId: string) {
  const repo = identityContainer.userGroupRepository;
  const queryClient = useQueryClient();
  const syncSessionAuthorization = useSessionAuthorizationSync();
  // `success`/`toastError`/`info` are used directly (not the operationSuccess/
  // operationError wrapper) so every word in the toast — including the
  // dynamic ones — goes through t(): the wrapper always builds
  // "{operation} Successful" in English.
  const { success, error: toastError, info } = useEnhancedToast();
  const { t } = useI18n();

  const invalidateGroupQueries = () => {
    queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    queryClient.invalidateQueries({ queryKey: userGroupKeys.lists() });
  };

  const syncAuthorizationSafely = async () => {
    try {
      await syncSessionAuthorization(group?.tenantId ?? null);
    } catch {
      // Best-effort session sync must not mask an already-committed backend mutation.
    }
  };

  const handleMutationError = (err: Error) => {
    if (isSudoCancelledError(err)) {
      info({
        title: t("profile.sudo.cancelledTitle"),
        description: t("profile.sudo.cancelledDescription"),
      });
      return;
    }
    toastError({ title: t("common.error"), description: err.message });
  };

  // ─── Fetch Group Detail ─────────────────────────────
  const {
    data: group,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userGroupKeys.detail(groupId),
    queryFn: () => repo.getById(groupId),
    enabled: !!groupId,
  });

  // ─── Add Members Mutation ───────────────────────────
  const addMembersMutation = useMutation({
    mutationFn: (adminIds: string[]) => repo.addMembers(groupId, { adminIds }),
    onSuccess: async () => {
      success({ title: t("common.success"), description: t("userGroups.membersAdded") });
      invalidateGroupQueries();
      await syncAuthorizationSafely();
    },
    onError: handleMutationError,
  });

  // ─── Remove Member Mutation ─────────────────────────
  const removeMemberMutation = useMutation({
    mutationFn: (adminId: string) => repo.removeMember(groupId, adminId),
    onSuccess: async () => {
      success({ title: t("common.success"), description: t("userGroups.memberRemoved") });
      invalidateGroupQueries();
      await syncAuthorizationSafely();
    },
    onError: handleMutationError,
  });

  // ─── Set Roles Mutation ─────────────────────────────
  const setRolesMutation = useMutation({
    mutationFn: (roleIds: string[]) =>
      repo.setRoles(groupId, {
        roleIds,
        ...(group?.rowVersion != null ? { rowVersion: group.rowVersion } : {}),
      }),
    onSuccess: async () => {
      success({ title: t("common.success"), description: t("userGroups.rolesUpdated") });
      invalidateGroupQueries();
      await syncAuthorizationSafely();
    },
    onError: handleMutationError,
  });

  // ─── Set Restrictions Mutation ──────────────────────
  const setRestrictionsMutation = useMutation({
    mutationFn: (restrictions: Array<{ permissionCode: string; restrictedFields: string[] }>) =>
      repo.setRestrictions(groupId, {
        restrictions,
        ...(group?.rowVersion != null ? { rowVersion: group.rowVersion } : {}),
      }),
    onSuccess: async () => {
      success({ title: t("common.success"), description: t("userGroups.restrictionsUpdated") });
      invalidateGroupQueries();
      await syncAuthorizationSafely();
    },
    onError: handleMutationError,
  });

  return {
    group,
    isLoading,
    error,
    refetch,
    // Members
    addMembers: addMembersMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    isAddingMembers: addMembersMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
    // Roles
    setRoles: setRolesMutation.mutateAsync,
    isSettingRoles: setRolesMutation.isPending,
    // Restrictions
    setRestrictions: setRestrictionsMutation.mutateAsync,
    isSettingRestrictions: setRestrictionsMutation.isPending,
  };
}
