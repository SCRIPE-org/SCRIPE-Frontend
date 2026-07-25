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
import { useI18n } from "@core/providers/i18n-provider";

/**
 * React hook/ViewModel orchestrating state and data flows for user group detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useUserGroupDetailViewModel(groupId: string) {
  const repo = identityContainer.userGroupRepository;
  const queryClient = useQueryClient();
  // `success`/`toastError` are used directly (not the operationSuccess/
  // operationError wrapper) so every word in the toast — including the
  // dynamic ones — goes through t(): the wrapper always builds
  // "{operation} Successful" in English.
  const { success, error: toastError } = useEnhancedToast();
  const { t } = useI18n();

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
    onSuccess: () => {
      success({ title: t("common.success"), description: t("userGroups.membersAdded") });
      queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    },
    onError: (err: Error) => toastError({ title: t("common.error"), description: err.message }),
  });

  // ─── Remove Member Mutation ─────────────────────────
  const removeMemberMutation = useMutation({
    mutationFn: (adminId: string) => repo.removeMember(groupId, adminId),
    onSuccess: () => {
      success({ title: t("common.success"), description: t("userGroups.memberRemoved") });
      queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    },
    onError: (err: Error) => toastError({ title: t("common.error"), description: err.message }),
  });

  // ─── Set Roles Mutation ─────────────────────────────
  const setRolesMutation = useMutation({
    mutationFn: (roleIds: string[]) => repo.setRoles(groupId, { roleIds }),
    onSuccess: () => {
      success({ title: t("common.success"), description: t("userGroups.rolesUpdated") });
      queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    },
    onError: (err: Error) => toastError({ title: t("common.error"), description: err.message }),
  });

  // ─── Set Restrictions Mutation ──────────────────────
  const setRestrictionsMutation = useMutation({
    mutationFn: (restrictions: Array<{ permissionCode: string; restrictedFields: string[] }>) =>
      repo.setRestrictions(groupId, { restrictions }),
    onSuccess: () => {
      success({ title: t("common.success"), description: t("userGroups.restrictionsUpdated") });
      queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    },
    onError: (err: Error) => toastError({ title: t("common.error"), description: err.message }),
  });

  return {
    group,
    isLoading,
    error,
    refetch,
    // Members
    addMembers: addMembersMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    isAddingMembers: addMembersMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
    // Roles
    setRoles: setRolesMutation.mutate,
    isSettingRoles: setRolesMutation.isPending,
    // Restrictions
    setRestrictions: setRestrictionsMutation.mutate,
    isSettingRestrictions: setRestrictionsMutation.isPending,
  };
}
