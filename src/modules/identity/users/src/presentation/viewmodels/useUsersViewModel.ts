/**
 * Users ViewModel
 *
 * Handles all state management for the Users view using the generic CRUD pattern.
 * Uses useCrudViewModel for standard CRUD + custom operations for toggle active and unlock.
 *
 * NOTE: No create operation — users self-register via UserAuthController.
 */
"use client";

import { useCallback } from "react";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { UsersEntity } from "../../domain/entities/UsersEntity";
import type { UpdateUserModel } from "../../data/models/UsersModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

export function useUsersViewModel() {
  const { usersRepository } = identityContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  const queryKey = ["users"];

  // ============ Core CRUD ViewModel ============
  // No create (users self-register). Update + Delete only.
  const vm = useCrudViewModel<UsersEntity, never, UpdateUserModel>(queryKey, {
    getAll: async (params) => {
      const res = await usersRepository.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
      return {
        items: res.items || [],
        pagination: {
          itemsCount: res.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.ceil((res.totalCount || 0) / params.pageSize),
        },
      };
    },
    update: async (id, data) => {
      await usersRepository.update(id, data);
      success({
        title: t("users.updated") || "User Updated",
        description: t("users.updatedDesc") || "User profile updated successfully.",
      });
      return {} as UsersEntity;
    },
    delete: async (id) => {
      await usersRepository.delete(id);
      success({
        title: t("users.deleted") || "User Deleted",
        description: t("users.deletedDesc") || "User has been deleted successfully.",
      });
    },
  });

  // ============ Toggle Active Status ============
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersRepository.setActive(id, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey });
      success({
        title: isActive
          ? t("users.activated") || "User Activated"
          : t("users.deactivated") || "User Deactivated",
        description: isActive
          ? t("users.activatedDesc") || "User has been activated."
          : t("users.deactivatedDesc") || "User has been deactivated.",
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // ============ Unlock Account ============
  const unlockMutation = useMutation({
    mutationFn: (id: string) => usersRepository.unlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({
        title: t("users.unlocked") || "Account Unlocked",
        description: t("users.unlockedDesc") || "User account has been unlocked.",
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // ============ Bulk Operations ============
  const bulkActivateMutation = useMutation({
    mutationFn: (ids: string[]) => usersRepository.bulkActivate(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      success({
        title: t("users.bulkActivated") || "Bulk Activated",
        description: `${count} ${t("users.usersActivated") || "users activated"}.`,
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: (ids: string[]) => usersRepository.bulkDeactivate(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      success({
        title: t("users.bulkDeactivated") || "Bulk Deactivated",
        description: `${count} ${t("users.usersDeactivated") || "users deactivated"}.`,
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => usersRepository.bulkDelete(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      success({
        title: t("users.bulkDeleted") || "Bulk Deleted",
        description: `${count} ${t("users.usersDeleted") || "users deleted"}.`,
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // ============ Handler Functions ============
  const handleToggleActive = useCallback(
    (id: string, isActive: boolean) => toggleActiveMutation.mutateAsync({ id, isActive }),
    [toggleActiveMutation]
  );

  const handleUnlock = useCallback(
    (id: string) => unlockMutation.mutateAsync(id),
    [unlockMutation]
  );

  const handleBulkActivate = useCallback(
    (ids: string[]) => bulkActivateMutation.mutate(ids),
    [bulkActivateMutation]
  );

  const handleBulkDeactivate = useCallback(
    (ids: string[]) => bulkDeactivateMutation.mutate(ids),
    [bulkDeactivateMutation]
  );

  const handleBulkDelete = useCallback(
    (ids: string[]) => bulkDeleteMutation.mutate(ids),
    [bulkDeleteMutation]
  );

  // ============ Config Base ============
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<UsersEntity>> => ({
      // No createFields — users self-register
      editFields: [
        {
          name: "firstName",
          label: t("users.columns.firstName") || "First Name",
          type: "text" as const,
          placeholder: t("users.placeholders.firstName") || "Enter first name",
        },
        {
          name: "lastName",
          label: t("users.columns.lastName") || "Last Name",
          type: "text" as const,
          placeholder: t("users.placeholders.lastName") || "Enter last name",
        },
        {
          name: "middleName",
          label: t("users.columns.middleName") || "Middle Name",
          type: "text" as const,
          placeholder: t("users.placeholders.middleName") || "Enter middle name",
        },
        {
          name: "country",
          label: t("users.columns.country") || "Country",
          type: "text" as const,
          placeholder: t("users.placeholders.country") || "Enter country",
        },
        {
          name: "government",
          label: t("users.columns.government") || "Governorate",
          type: "text" as const,
          placeholder: t("users.placeholders.government") || "Enter governorate",
        },
        {
          name: "city",
          label: t("users.columns.city") || "City",
          type: "text" as const,
          placeholder: t("users.placeholders.city") || "Enter city",
        },
        {
          name: "notes",
          label: t("users.columns.notes") || "Notes",
          type: "textarea" as const,
          placeholder: t("users.placeholders.notes") || "Optional notes...",
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      editInitialValues: (user: UsersEntity) => ({
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        middleName: user.middleName || "",
        country: user.country || "",
        government: user.government || "",
        city: user.city || "",
        notes: "",
      }),
      getItemDisplayName: (user: UsersEntity) => user.displayName,
      enableBulkActions: true,
      deleteService: async (id: string) => {
        await usersRepository.delete(id);
      },
      permissions: {
        canUpdate: SYSTEM_PERMISSIONS.USERS_UPDATE,
        canDelete: SYSTEM_PERMISSIONS.USERS_DELETE,
      },
    }),
    [t, usersRepository]
  );

  return {
    vm,
    getConfigBase,
    handleToggleActive,
    handleUnlock,
    handleBulkActivate,
    handleBulkDeactivate,
    handleBulkDelete,
    isTogglingActive: toggleActiveMutation.isPending,
    isUnlocking: unlockMutation.isPending,
    t,
  };
}
