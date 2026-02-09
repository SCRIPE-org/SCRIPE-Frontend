/**
 * Roles ViewModel
 *
 * Provides data and operations for the roles management view.
 * Uses useCrudViewModel for consistency with GenericCrudView.
 */
"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { Role } from "../../domain/entities/Role";
import type {
      CreateRoleRequest,
      UpdateRoleRequest,
      AssignPermissionsRequest,
      CloneRoleRequest,
} from "../../domain/entities/RoleRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

import { useCurrentTenantId } from "@core/providers/tenant-context-provider";

interface UseRolesViewModelParams {
      page?: number;
      pageSize?: number;
      search?: string;
      tenantId?: string;
      /** If true, uses myTenantRoles endpoint (tenantId from token) */
      useMyTenant?: boolean;
}

export function useRolesViewModel(params: UseRolesViewModelParams = {}) {
      const { tenantId: propTenantId, useMyTenant } = params;
      const contextTenantId = useCurrentTenantId();

      // Use prop tenantId if provided, otherwise context tenantId
      const tenantId = useMyTenant ? undefined : ((propTenantId || contextTenantId) ?? undefined);

      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { roleRepository } = systemContainer;

      // Build query key based on mode
      const queryKey = useMemo(() => {
            if (tenantId) return ["roles", "tenant", tenantId];
            if (useMyTenant) return ["roles", "myTenant"];
            return ["roles"];
      }, [tenantId, useMyTenant]);

      // Core CRUD viewModel using useCrudViewModel
      const vm = useCrudViewModel<Role, CreateRoleRequest, UpdateRoleRequest>(
            queryKey,
            {
                  getAll: async (queryParams) => {
                        // Choose appropriate endpoint based on options
                        const res = useMyTenant
                              ? await roleRepository.getMyTenantRoles({
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
                        // Use appropriate endpoint based on mode
                        const roleId = useMyTenant
                              ? await roleRepository.createForMyTenant(data)
                              : await roleRepository.create(tenantId ? { ...data, tenantId } : data as CreateRoleRequest);
                        success({
                              title: "Role Created",
                              description: "The role has been created successfully.",
                        });
                        // Return role with ID for potential chaining
                        return { id: roleId } as Role;
                  },
                  update: async (id, data) => {
                        await roleRepository.update(id, data);
                        success({
                              title: "Role Updated",
                              description: "The role has been updated successfully.",
                        });
                        return {} as Role;
                  },
                  delete: async (id) => {
                        await roleRepository.delete(id);
                        success({
                              title: "Role Deleted",
                              description: "The role has been deleted successfully.",
                        });
                  },
            }
      );

      // Custom create with permissions - creates role then assigns permissions
      const createWithPermissions = useCallback(
            async (roleData: CreateRoleRequest, permissionIds?: string[]) => {
                  const createData = tenantId ? { ...roleData, tenantId } : roleData;
                  const roleId = await roleRepository.create(createData);

                  // Assign permissions if provided
                  if (permissionIds && permissionIds.length > 0) {
                        const assignments = permissionIds.map((id) => ({ permissionId: id }));
                        await roleRepository.assignPermissions(roleId, { permissions: assignments });
                  }

                  success({
                        title: "Role Created",
                        description: permissionIds?.length
                              ? "The role has been created with permissions."
                              : "The role has been created successfully.",
                  });

                  // Invalidate query to refresh the list
                  queryClient.invalidateQueries({ queryKey });

                  return roleId;
            },
            [roleRepository, tenantId, success, queryClient, queryKey]
      );

      // Assign permissions mutation (additional role-specific operation)
      const assignPermissionsMutation = useMutation({
            mutationFn: ({
                  roleId,
                  request,
            }: {
                  roleId: string;
                  request: AssignPermissionsRequest;
            }) => roleRepository.assignPermissions(roleId, request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["roles"] });
                  success({
                        title: "Permissions Assigned",
                        description: "Permissions have been updated successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Permission Assignment Failed",
                        description: err.message || "Failed to update permissions.",
                  });
            },
      });

      const handleAssignPermissions = useCallback(
            (roleId: string, request: AssignPermissionsRequest) =>
                  assignPermissionsMutation.mutateAsync({ roleId, request }),
            [assignPermissionsMutation]
      );

      // Clone role mutation
      const cloneMutation = useMutation({
            mutationFn: ({ request, roleId }: { request: CloneRoleRequest; roleId: string }) =>
                  roleRepository.clone(roleId, request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey });
                  success({
                        title: "Role Cloned",
                        description: "The role has been cloned successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Clone Failed",
                        description: err.message || "Failed to clone role.",
                  });
            },
      });

      const clone = useCallback(
            (request: CloneRoleRequest, roleId: string) =>
                  cloneMutation.mutateAsync({ request, roleId }),
            [cloneMutation]
      );

      // Return the vm directly plus any additional role-specific properties
      return {
            ...vm,
            // Additional role-specific operations
            createWithPermissions,
            handleAssignPermissions,
            isAssigningPermissions: assignPermissionsMutation.isPending,
            clone,
            isCloning: cloneMutation.isPending,
      };
}
