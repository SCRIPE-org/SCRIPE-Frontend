/**
 * Admins ViewModel
 *
 * Handles all state management for the Admins view using the generic CRUD pattern.
 * Uses useCrudViewModel for standard CRUD and additional custom operations for role management.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { systemContainer } from "@/modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { Admin, AdminData } from "../../domain/entities/Admin";
import type {
  CreateAdminRequest,
  UpdateAdminRequest,
  AssignRoleRequest,
} from "../../domain/entities/AdminRequests";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { secureTokenService } from "@core/common/secure-token-service";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { useImpersonation } from "@modules/auth/core/src/presentation/viewmodels/useImpersonation";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

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
  const { tenantId: propTenantId, useMyTenant } = options;
  const contextTenantId = useCurrentTenantId();

  // Use prop tenantId if provided (Priority 1)
  // Otherwise if useMyTenant is true, use undefined (to trigger myTenant endpoint)
  // Otherwise use context tenantId (System Admin browsing context)
  const rawTenantId = propTenantId ?? (useMyTenant ? undefined : contextTenantId);
  const tenantId = rawTenantId ?? undefined; // Normalize null to undefined

  const { adminRepository, roleRepository } = systemContainer;
  const { t, language } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { authRepository } = useServices();
  const setAuth = useAppStore((state) => state.setAuth);

  // Build query key based on mode
  const queryKey = tenantId
    ? ["admins", "tenant", tenantId]
    : useMyTenant
      ? ["admins", "myTenant"]
      : ["admins"];

  // ============ Core CRUD ViewModel (React Query Engine) ============
  // Using 'any' for Create/Update types as repository returns string/void but useCrudViewModel expects entities
  const vm = useCrudViewModel<Admin, CreateAdminRequest, UpdateAdminRequest>(queryKey, {
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
      // Choose endpoint based on context:
      // Priority 1: explicit tenantId (from tenant detail page props) — always wins
      // Priority 2: useMyTenant: createForMyTenant (tenantId from JWT token)
      // Priority 3: neither — create regular system admin
      if (tenantId) {
        await adminRepository.create({ ...data, tenantId });
      } else if (useMyTenant) {
        await adminRepository.createForMyTenant(data);
      } else {
        await adminRepository.create(data);
      }
      success({
        title: t("admin.created") || "Admin Created",
        description: t("admin.createdDesc") || "Administrator created successfully.",
      });
      // Return empty admin to satisfy type - will refresh from server
      return {} as Admin;
    },
    update: async (id, data) => {
      await adminRepository.update(id, data);
      success({
        title: t("admin.updated") || "Admin Updated",
        description: t("admin.updatedDesc") || "Administrator updated successfully.",
      });
      // Return empty admin to satisfy type - will refresh from server
      return {} as Admin;
    },
    delete: async (id) => {
      await adminRepository.delete(id);
      success({
        title: t("admin.deleted") || "Admin Deleted",
        description: t("admin.deletedDesc") || "Administrator deleted successfully.",
      });
    },
  });

  // ============ Additional Admin-Specific Operations ============

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminRepository.setActive(id, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      success({
        title: isActive
          ? t("admin.activated") || "Admin Activated"
          : t("admin.deactivated") || "Admin Deactivated",
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
      success({
        title: t("admin.role.assigned") || "Role Assigned",
        description: t("admin.role.assignedDesc") || "Role assigned successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
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
        title: t("admin.role.removed") || "Role Removed",
        description: t("admin.role.removedDesc") || "Role removed successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ adminId, newPassword }: { adminId: string; newPassword: string }) =>
      adminRepository.resetPassword(adminId, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      success({
        title: t("admin.passwordReset") || "Password Reset",
        description: t("admin.passwordResetDesc") || "Password has been reset successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // Impersonation — the hook handles the API call and page reload
  const { startImpersonation, isImpersonationLoading } = useImpersonation();
  const handleImpersonate = useCallback(
    (id: string) => {
      startImpersonation(id);
    },
    [startImpersonation]
  );

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: import("../../domain/entities/AdminRequests").TransferAdminRequest;
    }) => adminRepository.transfer(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      success({
        title: t("admin.transferred") || "Admin Transferred",
        description: t("admin.transferredDesc") || "Admin transferred successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // Transfer Protection mutation
  const transferProtectionMutation = useMutation({
    mutationFn: ({ targetAdminId }: { targetAdminId: string }) =>
      adminRepository.transferProtection({ targetAdminId }),
    onSuccess: async () => {
      // Refresh admin list
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      // Refresh current user data (isProtected has changed)
      try {
        const user = await authRepository.getMe();
        if (user) {
          setAuth(user, user.permissions || [], []);
        }
      } catch {
        // Silently fail – user can re-login to refresh
      }
      success({
        title: t("admin.protectionTransferred") || "Protection Transferred",
        description:
          t("admin.protectionTransferredDesc") || "Admin protection transferred successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // Bulk Activate
  const bulkActivateMutation = useMutation({
    mutationFn: (ids: string[]) => adminRepository.bulkActivate(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      success({ title: "Bulk Activated", description: `${count} admins activated.` });
    },
  });

  // Bulk Deactivate
  const bulkDeactivateMutation = useMutation({
    mutationFn: (ids: string[]) => adminRepository.bulkDeactivate(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      success({ title: "Bulk Deactivated", description: `${count} admins deactivated.` });
    },
  });

  // Bulk Delete
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => adminRepository.bulkDelete(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      success({ title: "Bulk Deleted", description: `${count} admins deleted.` });
    },
  });

  // ============ Handler Functions ============
  const handleDelete = useCallback(
    async (admin: Admin) => {
      await adminRepository.delete(admin.id);
      await vm.refreshItems();
    },
    [adminRepository, vm]
  );

  const handleToggleActive = useCallback(
    (id: string, isActive: boolean) => toggleActiveMutation.mutateAsync({ id, isActive }),
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
    (adminId: string, newPassword: string) =>
      resetPasswordMutation.mutateAsync({ adminId, newPassword }),
    [resetPasswordMutation]
  );

  // ============ Role Search for Create Form ============
  const handleRoleSearch = useCallback(
    async (query: string): Promise<FieldOption[]> => {
      try {
        // For role search, always use the most specific tenant context:
        // 1. Explicit propTenantId (from tenant detail page)
        // 2. Context tenantId (from drill-down)
        // 3. undefined (system-level roles)
        const roleSearchTenantId = propTenantId ?? contextTenantId ?? undefined;
        const isExplicitTenant = !!propTenantId;

        const result = (useMyTenant && !isExplicitTenant)
          ? await roleRepository.getMyTenantRoles({ search: query, page: 1, pageSize: 20 })
          : await roleRepository.getAll({
            search: query,
            page: 1,
            pageSize: 20,
            tenantId: roleSearchTenantId,
            strict: true, // Force strict filtering
          });

        return (result.items || []).map((role) => ({
          value: role.id,
          label: language === "ar" ? role.nameAr : role.nameEn,
        }));
      } catch {
        return [];
      }
    },
    [roleRepository, propTenantId, contextTenantId, language]
  );

  // ============ Group Search for Create Form ============
  const handleGroupSearch = useCallback(
    async (query: string): Promise<FieldOption[]> => {
      try {
        // For group search, use the most specific tenant context available
        const groupSearchTenantId = propTenantId ?? contextTenantId ?? undefined;
        const isExplicitTenant = !!propTenantId;

        const result = (useMyTenant && !isExplicitTenant)
          ? await systemContainer.userGroupRepository.getMyTenantGroups({ search: query, page: 1, pageSize: 20 })
          : await systemContainer.userGroupRepository.getAll({
            search: query,
            page: 1,
            pageSize: 20,
            tenantId: groupSearchTenantId,
          });

        return (result.items || []).map((g) => ({
          value: g.id,
          label: language === "ar" ? g.nameAr : g.nameEn,
        }));
      } catch {
        return [];
      }
    },
    [useMyTenant, propTenantId, contextTenantId, language]
  );

  // ============ Config Base (Fields, Actions, Initial Values) ============
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<Admin>> => ({
      createFields: [
        {
          name: "roleIds",
          label: t("admin.roles") || "Roles",
          type: "multi-select" as const,
          placeholder: t("admin.role.selectRolesPlaceholder") || "Select roles...",
          searchPlaceholder: t("admin.role.searchRoles") || "Search roles...",
          required: false, // Optional - validated by backend (at least one role OR group)
          onServerSearch: handleRoleSearch,
          searchType: "server" as const,
          noResultsText: t("roles.noRolesFound") || "No roles found",
          requiredPermission: SYSTEM_PERMISSIONS.ADMINS_ASSIGN_ROLES,
        },
        {
          name: "userGroupIds",
          label: t("admin.groups") || "Groups",
          type: "multi-select" as const,
          placeholder: t("userGroups.selectPlaceholder") || "Select groups...",
          searchPlaceholder: t("userGroups.search") || "Search groups...",
          required: false, // Optional - validated by backend (at least one role OR group)
          onServerSearch: handleGroupSearch,
          searchType: "server" as const,
          noResultsText: t("userGroups.emptyStateTitle") || "No groups found",
          requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_VIEW,
        },
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
          name: "email",
          label: t("admin.email") || "Email",
          type: "text" as const,
          placeholder: t("admin.emailPlaceholder") || "admin@example.com",
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
          name: "email",
          label: t("admin.email") || "Email",
          type: "text" as const,
          placeholder: t("admin.emailPlaceholder") || "admin@example.com",
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
          requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        roleIds: [] as string[], // At least one role OR group required
        userGroupIds: [] as string[], // At least one role OR group required
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        notes: "",
        // tenantId is added at create time from options
      },
      editInitialValues: (admin: Admin) => ({
        id: admin.id,
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        phoneNumber: admin.phoneNumber || "",
        email: admin.email || "",
        notes: admin.notes || "",
        isActive: admin.isActive,
      }),
      getItemDisplayName: (admin: Admin) => admin.displayName || admin.username,
      enableBulkActions: false,
      deleteService: async (id: string) => {
        await adminRepository.delete(id);
      },
      permissions: {
        canCreate: SYSTEM_PERMISSIONS.ADMINS_CREATE,
        canUpdate: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
        canDelete: SYSTEM_PERMISSIONS.ADMINS_DELETE,
      },
    }),
    [t, adminRepository]
  );

  return {
    vm,
    getConfigBase,
    handleDelete,
    handleToggleActive,
    handleAssignRole,
    handleRemoveRole,
    handleResetPassword,
    handleImpersonate: (id: string) => startImpersonation(id),
    handleTransfer: (
      id: string,
      request: import("../../domain/entities/AdminRequests").TransferAdminRequest
    ) => transferMutation.mutate({ id, request }),
    handleTransferProtection: (targetAdminId: string) =>
      transferProtectionMutation.mutate({ targetAdminId }),
    handleBulkActivate: (ids: string[]) => bulkActivateMutation.mutate(ids),
    handleBulkDeactivate: (ids: string[]) => bulkDeactivateMutation.mutate(ids),
    handleBulkDelete: (ids: string[]) => bulkDeleteMutation.mutate(ids),

    isTogglingActive: toggleActiveMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isImpersonating: isImpersonationLoading,
    isTransferring: transferMutation.isPending,
    isTransferringProtection: transferProtectionMutation.isPending,
    t,
  };
}
