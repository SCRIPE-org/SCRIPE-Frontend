/**
 * Admins ViewModel
 *
 * Handles all state management for the Admins view using the generic CRUD pattern.
 * Uses useCrudViewModel for standard CRUD and additional custom operations for role management.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { Admin, AdminData } from "../../domain/entities/Admin";
import type {
      CreateAdminRequest,
      UpdateAdminRequest,
      AssignRoleRequest,
} from "../../domain/entities/AdminRequests";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

/**
 * useAdminsViewModel hook options
 */
interface AdminsViewModelOptions {
      /** Optional tenant ID to filter admins for a specific tenant (uses /byTenantId endpoint) */
      tenantId?: string;
      /** If true, uses /myTenantAdmins endpoint (for admins page) */
      useMyTenant?: boolean;
}

export function useAdminsViewModel(options: AdminsViewModelOptions = {}) {
      const { tenantId, useMyTenant } = options;
      const { adminRepository } = systemContainer;
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();

      // Build query key based on mode
      const queryKey = tenantId
            ? ["admins", "tenant", tenantId]
            : useMyTenant
                  ? ["admins", "myTenant"]
                  : ["admins"];

      // ============ Core CRUD ViewModel (React Query Engine) ============
      // Using 'any' for Create/Update types as repository returns string/void but useCrudViewModel expects entities
      const vm = useCrudViewModel<Admin, CreateAdminRequest, UpdateAdminRequest>(
            queryKey,
            {
                  getAll: async (params) => {
                        // Choose appropriate endpoint based on options
                        let res;
                        if (tenantId) {
                              // Specific tenant - use /byTenantId/{tenantId}
                              res = await adminRepository.getByTenantId(tenantId, {
                                    page: params.page,
                                    pageSize: params.pageSize,
                                    search: params.search,
                              });
                        } else if (useMyTenant) {
                              // Current user's tenant - use /myTenantAdmins
                              res = await adminRepository.getMyTenantAdmins({
                                    page: params.page,
                                    pageSize: params.pageSize,
                                    search: params.search,
                              });
                        } else {
                              // Default - use main /Admins endpoint (data scope)
                              res = await adminRepository.getAll({
                                    page: params.page,
                                    pageSize: params.pageSize,
                                    search: params.search,
                              });
                        }
                        return {
                              items: res.items || [],
                              pagination: {
                                    itemsCount: res.totalCount,
                                    pageSize: params.pageSize,
                                    page: params.page,
                                    pagesCount: res.totalPages,
                              },
                        };
                  },
                  create: async (data) => {
                        await adminRepository.create(data);
                        success({ title: t("admin.created") || "Admin Created", description: t("admin.createdDesc") || "Administrator created successfully." });
                        // Return empty admin to satisfy type - will refresh from server
                        return {} as Admin;
                  },
                  update: async (id, data) => {
                        await adminRepository.update(id, data);
                        success({ title: t("admin.updated") || "Admin Updated", description: t("admin.updatedDesc") || "Administrator updated successfully." });
                        // Return empty admin to satisfy type - will refresh from server
                        return {} as Admin;
                  },
                  delete: async (id) => {
                        await adminRepository.delete(id);
                        success({ title: t("admin.deleted") || "Admin Deleted", description: t("admin.deletedDesc") || "Administrator deleted successfully." });
                  },
            }
      );

      // ============ Additional Admin-Specific Operations ============

      // Toggle active status mutation
      const toggleActiveMutation = useMutation({
            mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
                  adminRepository.setActive(id, isActive),
            onSuccess: (_, { isActive }) => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({
                        title: isActive ? t("admin.activated") || "Admin Activated" : t("admin.deactivated") || "Admin Deactivated",
                        description: `Administrator has been ${isActive ? "activated" : "deactivated"}.`,
                  });
            },
            onError: (err: Error) => {
                  toastError({ title: t("common.error") || "Error", description: err.message });
            },
      });

      // Assign role mutation
      const assignRoleMutation = useMutation({
            mutationFn: ({ adminId, request }: { adminId: string; request: AssignRoleRequest }) =>
                  adminRepository.assignRole(adminId, request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({ title: t("admin.role.assigned") || "Role Assigned", description: t("admin.role.assignedDesc") || "Role assigned successfully." });
            },
            onError: (err: Error) => {
                  toastError({ title: t("common.error") || "Error", description: err.message });
            },
      });

      // Remove role mutation
      const removeRoleMutation = useMutation({
            mutationFn: ({ adminId, roleId, tenantId }: { adminId: string; roleId: string; tenantId?: string }) =>
                  adminRepository.removeRole(adminId, roleId, tenantId),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  success({ title: t("admin.role.removed") || "Role Removed", description: t("admin.role.removedDesc") || "Role removed successfully." });
            },
            onError: (err: Error) => {
                  toastError({ title: t("common.error") || "Error", description: err.message });
            },
      });

      // ============ Handler Functions ============
      const handleDelete = useCallback(async (admin: Admin) => {
            await adminRepository.delete(admin.id);
            await vm.refreshItems();
      }, [adminRepository, vm]);

      const handleToggleActive = useCallback((id: string, isActive: boolean) =>
            toggleActiveMutation.mutateAsync({ id, isActive }),
            [toggleActiveMutation]
      );

      const handleAssignRole = useCallback((adminId: string, request: AssignRoleRequest) =>
            assignRoleMutation.mutateAsync({ adminId, request }),
            [assignRoleMutation]
      );

      const handleRemoveRole = useCallback((adminId: string, roleId: string, tenantId?: string) =>
            removeRoleMutation.mutateAsync({ adminId, roleId, tenantId }),
            [removeRoleMutation]
      );

      // ============ Config Base (Fields, Actions, Initial Values) ============
      const getConfigBase = useCallback((): Partial<CrudConfig<Admin>> => ({
            createFields: [
                  {
                        name: "username",
                        label: t("admin.username") || "Username",
                        type: "text" as const,
                        placeholder: t("admin.usernamePlaceholder") || "Enter username",
                        required: true,
                  },
                  {
                        name: "password",
                        label: t("admin.password") || "Password",
                        type: "password" as const,
                        placeholder: t("admin.passwordPlaceholder") || "Enter password",
                        required: true,
                  },
                  {
                        name: "firstName",
                        label: t("admin.firstName") || "First Name",
                        type: "text" as const,
                        placeholder: t("admin.firstNamePlaceholder") || "Enter first name",
                  },
                  {
                        name: "lastName",
                        label: t("admin.lastName") || "Last Name",
                        type: "text" as const,
                        placeholder: t("admin.lastNamePlaceholder") || "Enter last name",
                  },
                  {
                        name: "phoneNumber",
                        label: t("admin.phoneNumber") || "Phone Number",
                        type: "text" as const,
                        placeholder: t("admin.phoneNumberPlaceholder") || "+1 234 567 8900",
                  },
                  {
                        name: "notes",
                        label: t("admin.notes") || "Notes",
                        type: "textarea" as const,
                        placeholder: t("admin.notesPlaceholder") || "Optional notes...",
                  },
            ],
            editFields: [
                  {
                        name: "firstName",
                        label: t("admin.firstName") || "First Name",
                        type: "text" as const,
                        placeholder: t("admin.firstNamePlaceholder") || "Enter first name",
                  },
                  {
                        name: "lastName",
                        label: t("admin.lastName") || "Last Name",
                        type: "text" as const,
                        placeholder: t("admin.lastNamePlaceholder") || "Enter last name",
                  },
                  {
                        name: "phoneNumber",
                        label: t("admin.phoneNumber") || "Phone Number",
                        type: "text" as const,
                        placeholder: t("admin.phoneNumberPlaceholder") || "+1 234 567 8900",
                  },
                  {
                        name: "notes",
                        label: t("admin.notes") || "Notes",
                        type: "textarea" as const,
                        placeholder: t("admin.notesPlaceholder") || "Optional notes...",
                  },
                  {
                        name: "isActive",
                        label: t("admin.isActive") || "Active",
                        type: "switch" as const,
                  },
                  { name: "id", type: "hidden" as const, required: true },
            ],
            createInitialValues: {
                  username: "",
                  password: "",
                  firstName: "",
                  lastName: "",
                  phoneNumber: "",
                  notes: "",
            },
            editInitialValues: (admin: Admin) => ({
                  id: admin.id,
                  firstName: admin.firstName || "",
                  lastName: admin.lastName || "",
                  phoneNumber: admin.phoneNumber || "",
                  notes: admin.notes || "",
                  isActive: admin.isActive,
            }),
            getItemDisplayName: (admin: Admin) => admin.displayName || admin.username,
            enableBulkActions: false,
            permissions: {
                  canCreate: "admins:create",
                  canUpdate: "admins:update",
                  canDelete: "admins:delete",
            },
      }), [t]);

      return {
            vm,
            getConfigBase,
            handleDelete,
            handleToggleActive,
            handleAssignRole,
            handleRemoveRole,
            isTogglingActive: toggleActiveMutation.isPending,
            isAssigningRole: assignRoleMutation.isPending,
            isRemovingRole: removeRoleMutation.isPending,
            t,
      };
}
