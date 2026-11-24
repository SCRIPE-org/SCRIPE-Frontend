/**
 * Roles ViewModel
 *
 * Provides data and operations for the roles management view.
 * Uses useCrudViewModel for consistency with GenericCrudView.
 */
"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { Role } from "../../domain/entities/Role";
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  CloneRoleRequest,
} from "../../domain/entities/RoleRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { isSudoCancelledError } from "@core/store/useSudoStore";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { useOptionalNavigation } from "@core/providers/navigation-provider";
import { syncCurrentSessionAuthorization } from "@core/hooks/use-authorization-sync";
import { qk } from "@core/common/query-keys";

interface UseRolesViewModelParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tenantId?: string;
  /** If true, uses /roles/current-tenant endpoint (tenantId from token) */
  useMyTenant?: boolean;
}

/**
 * React hook/ViewModel orchestrating state and data flows for roles view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useRolesViewModel(params: UseRolesViewModelParams = {}) {
  const { tenantId: propTenantId, useMyTenant } = params;
  const contextTenantId = useCurrentTenantId();

  // Use prop tenantId if provided, otherwise context tenantId
  const tenantId = useMyTenant ? undefined : ((propTenantId || contextTenantId) ?? undefined);

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const nav = useOptionalNavigation();
  const { success, error: toastError, info: toastInfo } = useEnhancedToast();
  const { roleRepository } = identityContainer;

  const notifySudoCancelled = useCallback(() => {
    toastInfo?.({ title: t("profile.sudo.cancelledTitle"), description: t("profile.sudo.cancelledDescription") });
  }, [toastInfo, t]);

  const handleMutationError = useCallback(
    (err: Error, titleKey: string, descKey: string) => {
      if (isSudoCancelledError(err)) {
        notifySudoCancelled();
        return;
      }
      toastError({ title: t(titleKey), description: err.message || t(descKey) });
    },
    [notifySudoCancelled, toastError, t]
  );

  const syncSessionSafely = useCallback(async () => {
    try {
      await syncCurrentSessionAuthorization({
        queryClient,
        refreshNavigation: nav?.refreshNavigation,
        targetTenantId: tenantId ?? null,
      });
    } catch {
      // Non-fatal: role mutation succeeded even if background auth sync fails
    }
  }, [queryClient, nav, tenantId]);

  // Build query key using the factory
  const queryKey: string[] = useMemo(() => {
    if (tenantId) return [...qk.roles.active(tenantId)];
    if (useMyTenant) return [...qk.roles.all, "currentTenant"];
    return [...qk.roles.all];
  }, [tenantId, useMyTenant]);

  // Core CRUD viewModel using useCrudViewModel
  const vm = useCrudViewModel<Role, CreateRoleRequest, UpdateRoleRequest>(
    queryKey,
    {
      getAll: async (queryParams) => {
        // Choose appropriate endpoint based on options
        const res = useMyTenant
          ? await roleRepository.getCurrentTenantRoles({
              page: queryParams.page,
              pageSize: queryParams.pageSize,
              search: queryParams.search,
            })
          : await roleRepository.getAll({
              page: queryParams.page,
              pageSize: queryParams.pageSize,
              search: queryParams.search,
              tenantId,
            });
        return {
          items: res.items || [],
          pagination: {
            itemsCount: res.totalCount,
            pageSize: queryParams.pageSize,
            page: queryParams.page,
            pagesCount: res.totalPages,
          },
        };
      },
      create: async (data) => {
        // Priority 1: explicit tenantId (from tenant detail page) — always wins
        // Priority 2: useMyTenant (tenant admin's own tenant from JWT)
        // Priority 3: neither — system-level role
        const roleId = tenantId
          ? await roleRepository.create({ ...data, tenantId })
          : useMyTenant
            ? await roleRepository.createInCurrentTenant(data)
            : await roleRepository.create(data as CreateRoleRequest);
        // useCrudViewModel/useGenericMutations handles the single localized create toast.
        return { id: roleId } as Role;
      },
      update: async (id, data) => {
        await roleRepository.update(id, data);
        await syncSessionSafely();
        // useCrudViewModel/useGenericMutations handles the single localized update toast.
        return {} as Role;
      },
      delete: async (id) => {
        await roleRepository.delete(id);
        await syncSessionSafely();
        // useCrudViewModel/useGenericMutations handles the single localized delete toast.
      },
    },
    {
      onError: (err) => {
        if (isSudoCancelledError(err)) {
          notifySudoCancelled();
        }
      },
    }
  );

  // Custom create with permissions - creates role then assigns permissions
  const createWithPermissions = useCallback(
    async (roleData: CreateRoleRequest, permissionIds?: string[]) => {
      try {
        const createData = tenantId ? { ...roleData, tenantId } : roleData;
        const roleId = tenantId
          ? await roleRepository.create(createData)
          : useMyTenant
            ? await roleRepository.createInCurrentTenant(createData)
            : await roleRepository.create(createData);

        // Assign permissions if provided
        if (permissionIds && permissionIds.length > 0) {
          const assignments = permissionIds.map((id) => ({ permissionId: id }));
          await roleRepository.assignPermissions(roleId, { permissions: assignments });
        }

        success({
          title: t("roles.createdTitle"),
          description: permissionIds?.length
            ? t("roles.createdWithPermissionsDescription")
            : t("roles.createdDescription"),
        });

        // Invalidate query to refresh the list
        queryClient.invalidateQueries({ queryKey });
        await syncSessionSafely();

        return roleId;
      } catch (err) {
        if (isSudoCancelledError(err)) {
          notifySudoCancelled();
        }
        throw err;
      }
    },
    [
      roleRepository,
      tenantId,
      useMyTenant,
      success,
      t,
      queryClient,
      queryKey,
      syncSessionSafely,
      notifySudoCancelled,
    ]
  );

  // Assign permissions mutation (additional role-specific operation)
  const assignPermissionsMutation = useMutation({
    mutationFn: ({ roleId, request }: { roleId: string; request: AssignPermissionsRequest }) =>
      roleRepository.assignPermissions(roleId, request),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: qk.roles.all });
      await syncSessionSafely();
      success({
        title: t("roles.permissionsAssignedTitle"),
        description: t("roles.permissionsAssignedDescription"),
      });
    },
    onError: (err: Error) => handleMutationError(err, "roles.permissionsAssignFailedTitle", "roles.permissionsAssignFailedDescription"),
  });

  const handleAssignPermissions = useCallback(
    (roleId: string, request: AssignPermissionsRequest) =>
      assignPermissionsMutation.mutateAsync({ roleId, request }),
    [assignPermissionsMutation]
  );

  const cloneMutation = useMutation({
    mutationFn: ({ request, roleId }: { request: CloneRoleRequest; roleId: string }) =>
      roleRepository.clone(roleId, request),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey });
      await syncSessionSafely();
      success({ title: t("roles.clonedTitle"), description: t("roles.clonedDescription") });
    },
    onError: (err: Error) => handleMutationError(err, "roles.cloneFailedTitle", "roles.cloneFailedDescription"),
  });

  const clone = useCallback(
    (request: CloneRoleRequest, roleId: string) => cloneMutation.mutateAsync({ request, roleId }),
    [cloneMutation]
  );

  const deleteRoleMutation = useMutation({
    mutationFn: ({ id, fallbackRoleId }: { id: string; fallbackRoleId?: string }) =>
      roleRepository.delete(id, fallbackRoleId ? { fallbackRoleId } : undefined),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey });
      await syncSessionSafely();
      success({ title: t("roles.deletedTitle"), description: t("roles.deletedDescription") });
    },
    onError: (err: Error) => handleMutationError(err, "roles.deleteFailedTitle", "roles.deleteFailedDescription"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => roleRepository.bulkDelete(ids),
    onSuccess: async (deletedCount) => {
      queryClient.invalidateQueries({ queryKey });
      await syncSessionSafely();
      success({
        title: t("roles.bulkDeletedTitle"),
        description: t("roles.bulkDeletedDescription", { count: deletedCount }),
      });
    },
    onError: (err: Error) => handleMutationError(err, "roles.bulkDeleteFailedTitle", "roles.bulkDeleteFailedDescription"),
  });

  // Return the vm directly plus any additional role-specific properties
  return {
    ...vm,
    // Additional role-specific operations
    createWithPermissions,
    handleAssignPermissions,
    isAssigningPermissions: assignPermissionsMutation.isPending,
    clone,
    isCloning: cloneMutation.isPending,
    deleteRole: (id: string, fallbackRoleId?: string) =>
      deleteRoleMutation.mutateAsync({ id, fallbackRoleId }),
    isDeletingRole: deleteRoleMutation.isPending,
    handleBulkDelete: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
}
