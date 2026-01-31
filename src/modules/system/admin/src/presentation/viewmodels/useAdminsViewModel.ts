/**
 * Admins ViewModel
 *
 * Provides data and operations for the admins management view.
 */
"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
// import type { Admin } from "../../domain/entities/Admin";
import type {
      CreateAdminRequest,
      UpdateAdminRequest,
      AssignRoleRequest,
} from "../../domain/entities/AdminRequests";
import { createAdminSchema, updateAdminSchema } from "../schemas/AdminSchema";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

interface UseAdminsViewModelParams {
      page?: number;
      pageSize?: number;
      search?: string;
      isActive?: boolean;
}

export function useAdminsViewModel(params: UseAdminsViewModelParams = {}) {
      const { page = 1, pageSize = 20, search, isActive } = params;
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { adminRepository } = systemContainer;

      // Query key for cache management
      const queryKey = useMemo(
            () => ["admins", { page, pageSize, search, isActive }],
            [page, pageSize, search, isActive]
      );

      // Fetch admins
      const {
            data,
            isLoading,
            isError,
            error,
            refetch,
      } = useQuery({
            queryKey,
            queryFn: () => adminRepository.getAll({ page, pageSize, search, isActive }),
      });

      // Create admin mutation
      const createMutation = useMutation({
            mutationFn: (request: CreateAdminRequest) => adminRepository.create(request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: "Admin Created",
                        description: "The administrator has been created successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Create Failed",
                        description: err.message || "Failed to create administrator.",
                  });
            },
      });

      // Update admin mutation
      const updateMutation = useMutation({
            mutationFn: ({ id, request }: { id: string; request: UpdateAdminRequest }) =>
                  adminRepository.update(id, request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: "Admin Updated",
                        description: "The administrator has been updated successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Update Failed",
                        description: err.message || "Failed to update administrator.",
                  });
            },
      });

      // Delete admin mutation
      const deleteMutation = useMutation({
            mutationFn: (id: string) => adminRepository.delete(id),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: "Admin Deleted",
                        description: "The administrator has been deleted successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Delete Failed",
                        description: err.message || "Failed to delete administrator.",
                  });
            },
      });

      // Toggle active status mutation
      const toggleActiveMutation = useMutation({
            mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
                  adminRepository.setActive(id, isActive),
            onSuccess: (_, { isActive }) => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: isActive ? "Admin Activated" : "Admin Deactivated",
                        description: `The administrator has been ${isActive ? "activated" : "deactivated"}.`,
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Status Update Failed",
                        description: err.message || "Failed to update status.",
                  });
            },
      });

      // Assign role mutation
      const assignRoleMutation = useMutation({
            mutationFn: ({ adminId, request }: { adminId: string; request: AssignRoleRequest }) =>
                  adminRepository.assignRole(adminId, request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: "Role Assigned",
                        description: "The role has been assigned successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Role Assignment Failed",
                        description: err.message || "Failed to assign role.",
                  });
            },
      });

      // Remove role mutation
      const removeRoleMutation = useMutation({
            mutationFn: ({
                  adminId,
                  roleId,
                  tenantId,
            }: {
                  adminId: string;
                  roleId: string;
                  tenantId?: string;
            }) => adminRepository.removeRole(adminId, roleId, tenantId),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: "Role Removed",
                        description: "The role has been removed successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Role Removal Failed",
                        description: err.message || "Failed to remove role.",
                  });
            },
      });

      // Reset password mutation
      const resetPasswordMutation = useMutation({
            mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
                  adminRepository.resetPassword(id, newPassword),
            onSuccess: () => {
                  success({
                        title: "Password Reset",
                        description: "The password has been reset successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Password Reset Failed",
                        description: err.message || "Failed to reset password.",
                  });
            },
      });

      // Bulk operations
      const bulkActivateMutation = useMutation({
            mutationFn: (ids: string[]) => adminRepository.bulkActivate(ids),
            onSuccess: (count) => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: "Bulk Activation",
                        description: `${count} administrator(s) have been activated.`,
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Bulk Activation Failed",
                        description: err.message || "Failed to activate administrators.",
                  });
            },
      });

      const bulkDeactivateMutation = useMutation({
            mutationFn: (ids: string[]) => adminRepository.bulkDeactivate(ids),
            onSuccess: (count) => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: "Bulk Deactivation",
                        description: `${count} administrator(s) have been deactivated.`,
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Bulk Deactivation Failed",
                        description: err.message || "Failed to deactivate administrators.",
                  });
            },
      });

      const bulkDeleteMutation = useMutation({
            mutationFn: (ids: string[]) => adminRepository.bulkDelete(ids),
            onSuccess: (count) => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: "Bulk Delete",
                        description: `${count} administrator(s) have been deleted.`,
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Bulk Delete Failed",
                        description: err.message || "Failed to delete administrators.",
                  });
            },
      });

      // Handlers
      const handleCreate = useCallback(
            (request: CreateAdminRequest) => createMutation.mutateAsync(request),
            [createMutation]
      );

      const handleUpdate = useCallback(
            (id: string, request: UpdateAdminRequest) =>
                  updateMutation.mutateAsync({ id, request }),
            [updateMutation]
      );

      const handleDelete = useCallback(
            (id: string) => deleteMutation.mutateAsync(id),
            [deleteMutation]
      );

      const handleToggleActive = useCallback(
            (id: string, isActive: boolean) =>
                  toggleActiveMutation.mutateAsync({ id, isActive }),
            [toggleActiveMutation]
      );

      const handleAssignRole = useCallback(
            (adminId: string, request: AssignRoleRequest) =>
                  assignRoleMutation.mutateAsync({ adminId, request }),
            [assignRoleMutation]
      );

      const handleRemoveRole = useCallback(
            (adminId: string, roleId: string, tenantId?: string) =>
                  removeRoleMutation.mutateAsync({ adminId, roleId, tenantId }),
            [removeRoleMutation]
      );

      const handleResetPassword = useCallback(
            (id: string, newPassword: string) =>
                  resetPasswordMutation.mutateAsync({ id, newPassword }),
            [resetPasswordMutation]
      );

      const handleBulkActivate = useCallback(
            (ids: string[]) => bulkActivateMutation.mutateAsync(ids),
            [bulkActivateMutation]
      );

      const handleBulkDeactivate = useCallback(
            (ids: string[]) => bulkDeactivateMutation.mutateAsync(ids),
            [bulkDeactivateMutation]
      );

      const handleBulkDelete = useCallback(
            (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
            [bulkDeleteMutation]
      );

      return {
            // Data
            admins: data?.items ?? [],
            totalCount: data?.totalCount ?? 0,
            totalPages: data?.totalPages ?? 0,
            hasNextPage: data?.hasNextPage ?? false,
            hasPreviousPage: data?.hasPreviousPage ?? false,

            // State
            isLoading,
            isError,
            error,

            // UI Config
            createSchema: createAdminSchema,
            updateSchema: updateAdminSchema,

            // Handlers
            handleCreate,
            handleUpdate,
            handleDelete,
            handleToggleActive,
            handleAssignRole,
            handleRemoveRole,
            handleResetPassword,
            handleBulkActivate,
            handleBulkDeactivate,
            handleBulkDelete,
            refetch: () => refetch(),

            // Mutation states
            isCreating: createMutation.isPending,
            isUpdating: updateMutation.isPending,
            isDeleting: deleteMutation.isPending,
      };
}
