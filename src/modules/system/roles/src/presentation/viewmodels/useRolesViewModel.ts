/**
 * Roles ViewModel
 *
 * Provides data and operations for the roles management view.
 */
"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
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
}

export function useRolesViewModel(params: UseRolesViewModelParams = {}) {
      const { page = 1, pageSize = 20, search, tenantId } = params;
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { roleRepository } = systemContainer;

      // Query key
      const queryKey = useMemo(
            () => ["roles", { page, pageSize, search, tenantId }],
            [page, pageSize, search, tenantId]
      );

      // Fetch roles
      const {
            data,
            isLoading,
            isError,
            error,
            refetch,
      } = useQuery({
            queryKey,
            queryFn: () => roleRepository.getAll({ page, pageSize, search, tenantId }),
      });

      // Create role mutation
      const createMutation = useMutation({
            mutationFn: (request: CreateRoleRequest) => roleRepository.create(request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["roles"] });
                  success({
                        title: "Role Created",
                        description: "The role has been created successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Create Failed",
                        description: err.message || "Failed to create role.",
                  });
            },
      });

      // Update role mutation
      const updateMutation = useMutation({
            mutationFn: ({ id, request }: { id: string; request: UpdateRoleRequest }) =>
                  roleRepository.update(id, request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["roles"] });
                  success({
                        title: "Role Updated",
                        description: "The role has been updated successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Update Failed",
                        description: err.message || "Failed to update role.",
                  });
            },
      });

      // Delete role mutation
      const deleteMutation = useMutation({
            mutationFn: (id: string) => roleRepository.delete(id),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["roles"] });
                  success({
                        title: "Role Deleted",
                        description: "The role has been deleted successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Delete Failed",
                        description: err.message || "Failed to delete role.",
                  });
            },
      });

      // Assign permissions mutation
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

      // Handlers
      const handleCreate = useCallback(
            (request: CreateRoleRequest) => createMutation.mutateAsync(request),
            [createMutation]
      );

      const handleUpdate = useCallback(
            (id: string, request: UpdateRoleRequest) =>
                  updateMutation.mutateAsync({ id, request }),
            [updateMutation]
      );

      const handleDelete = useCallback(
            (id: string) => deleteMutation.mutateAsync(id),
            [deleteMutation]
      );

      const handleAssignPermissions = useCallback(
            (roleId: string, request: AssignPermissionsRequest) =>
                  assignPermissionsMutation.mutateAsync({ roleId, request }),
            [assignPermissionsMutation]
      );

      return {
            // Data
            roles: data?.items ?? [],
            totalCount: data?.totalCount ?? 0,
            totalPages: data?.totalPages ?? 0,
            hasNextPage: data?.hasNextPage ?? false,
            hasPreviousPage: data?.hasPreviousPage ?? false,

            // State
            isLoading,
            isError,
            error,

            // Handlers
            handleCreate,
            handleUpdate,
            handleDelete,
            handleAssignPermissions,
            refetch: () => refetch(),

            // Mutation states
            isCreating: createMutation.isPending,
            isUpdating: updateMutation.isPending,
            isDeleting: deleteMutation.isPending,
            isAssigningPermissions: assignPermissionsMutation.isPending,
      };
}
