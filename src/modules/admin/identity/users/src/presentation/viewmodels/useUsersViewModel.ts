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
import type { UpdateUserRequest } from "../../domain/interfaces/IUsersRepository";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { qk } from "@core/common/query-keys";

/**
 * React hook/ViewModel orchestrating state and data flows for users view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useUsersViewModel() {
  const { usersRepository } = identityContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  const queryKey = [...qk.users.all];

  // ============ Core CRUD ViewModel ============
  // No create (users self-register). Update + Delete only.
  const vm = useCrudViewModel<UsersEntity, never, UpdateUserRequest>(
    queryKey,
    {
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
        // No manual success() here on purpose -- deferSuccessEffects (below) holds
        // the toast until GenericCrudView confirms the custom-field save (if any)
        // also succeeded; firing it here unconditionally would defeat that.
        return {} as UsersEntity;
      },
      delete: async (id) => {
        await usersRepository.delete(id);
        success({
          title: t("users.deleted"),
          description: t("users.deletedDesc"),
        });
      },
    },
    { deferSuccessEffects: true }
  );

  // ============ Toggle Active Status ============
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersRepository.setActive(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: qk.users.all });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { items?: Array<{ id: string; isActive: boolean }> };
        if (!data.items) return old;
        return { ...data, items: data.items.map((u) => (u.id === id ? { ...u, isActive } : u)) };
      });
      return { previous };
    },
    onError: (err: Error, __, context?: { previous: unknown }) => {
      if (context?.previous !== undefined) queryClient.setQueryData(queryKey, context.previous);
      toastError({ title: t("common.error"), description: err.message });
    },
    onSuccess: (_, { isActive }) => {
      success({
        title: isActive ? t("users.activated") : t("users.deactivated"),
        description: isActive ? t("users.activatedDesc") : t("users.deactivatedDesc"),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.users.all });
    },
  });

  // ============ Unlock Account ============
  const unlockMutation = useMutation({
    mutationFn: (id: string) => usersRepository.unlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.users.all });
      success({
        title: t("users.unlocked"),
        description: t("users.unlockedDesc"),
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error"), description: err.message });
    },
  });

  // ============ Bulk Operations ============
  const bulkActivateMutation = useMutation({
    mutationFn: (ids: string[]) => usersRepository.bulkActivate(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: qk.users.all });
      success({
        title: t("users.bulkActivated"),
        description: `${count} ${t("users.usersActivated")}.`,
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error"), description: err.message });
    },
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: (ids: string[]) => usersRepository.bulkDeactivate(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: qk.users.all });
      success({
        title: t("users.bulkDeactivated"),
        description: `${count} ${t("users.usersDeactivated")}.`,
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error"), description: err.message });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => usersRepository.bulkDelete(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: qk.users.all });
      success({
        title: t("users.bulkDeleted"),
        description: `${count} ${t("users.usersDeleted")}.`,
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error"), description: err.message });
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
          label: t("users.columns.firstName"),
          type: "text" as const,
          placeholder: t("users.placeholders.firstName"),
        },
        {
          name: "lastName",
          label: t("users.columns.lastName"),
          type: "text" as const,
          placeholder: t("users.placeholders.lastName"),
        },
        {
          name: "middleName",
          label: t("users.columns.middleName"),
          type: "text" as const,
          placeholder: t("users.placeholders.middleName"),
        },
        {
          name: "country",
          label: t("users.columns.country"),
          type: "text" as const,
          placeholder: t("users.placeholders.country"),
        },
        {
          name: "government",
          label: t("users.columns.government"),
          type: "text" as const,
          placeholder: t("users.placeholders.government"),
        },
        {
          name: "city",
          label: t("users.columns.city"),
          type: "text" as const,
          placeholder: t("users.placeholders.city"),
        },
        {
          name: "notes",
          label: t("users.columns.notes"),
          type: "textarea" as const,
          placeholder: t("users.placeholders.notes"),
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
