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

/**
 * React hook/ViewModel orchestrating state and data flows for user group detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useUserGroupDetailViewModel(groupId: string) {
  const repo = identityContainer.userGroupRepository;
  const queryClient = useQueryClient();
  const { operationSuccess, operationError } = useEnhancedToast();

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
      operationSuccess("Added", "Members");
      queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    },
    onError: (err: Error) => operationError("Add Members", undefined, err.message),
  });

  // ─── Remove Member Mutation ─────────────────────────
  const removeMemberMutation = useMutation({
    mutationFn: (adminId: string) => repo.removeMember(groupId, adminId),
    onSuccess: () => {
      operationSuccess("Removed", "Member");
      queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    },
    onError: (err: Error) => operationError("Remove Member", undefined, err.message),
  });

  // ─── Set Roles Mutation ─────────────────────────────
  const setRolesMutation = useMutation({
    mutationFn: (roleIds: string[]) => repo.setRoles(groupId, { roleIds }),
    onSuccess: () => {
      operationSuccess("Updated", "Roles");
      queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    },
    onError: (err: Error) => operationError("Update Roles", undefined, err.message),
  });

  // ─── Set Restrictions Mutation ──────────────────────
  const setRestrictionsMutation = useMutation({
    mutationFn: (restrictions: Array<{ permissionCode: string; restrictedFields: string[] }>) =>
      repo.setRestrictions(groupId, { restrictions }),
    onSuccess: () => {
      operationSuccess("Updated", "Restrictions");
      queryClient.invalidateQueries({ queryKey: userGroupKeys.detail(groupId) });
    },
    onError: (err: Error) => operationError("Update Restrictions", undefined, err.message),
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
