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
} from "../../domain/entities/RoleRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

interface UseRolesViewModelParams {
      page?: number;
      pageSize?: number;
      search?: string;
      tenantId?: string;
      /** If true, uses myTenantRoles endpoint (tenantId from token) */
      useMyTenant?: boolean;
}

export function useRolesViewModel(params: UseRolesViewModelParams = {}) {
      const { tenantId, useMyTenant } = params;
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
                        const res = await roleRepository.getAll({
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
                        // Add tenantId if creating for a specific tenant
                        const createData = tenantId ? { ...data, tenantId } : data;
                        await roleRepository.create(createData as CreateRoleRequest);
                        success({
                              title: "Role Created",
                              description: "The role has been created successfully.",
                        });
                        return {} as Role;
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

      // Return the vm directly plus any additional role-specific properties
      return {
            ...vm,
            // Additional role-specific operations
            handleAssignPermissions,
            isAssigningPermissions: assignPermissionsMutation.isPending,
      };
}
