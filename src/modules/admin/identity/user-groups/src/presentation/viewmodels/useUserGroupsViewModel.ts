/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE-EXCEPTION: file length
/**
 * User Groups List ViewModel
 *
 * Orchestrates the user groups list page.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { identityContainer } from "@modules/identity/di";
import type { UserGroupRole } from "../../domain/entities/UserGroup";
import type {
  CreateUserGroupRequest,
  UpdateUserGroupRequest,
} from "../../domain/entities/UserGroupRequests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveBilingualLabel } from "@core/common/utils";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useSessionAuthorizationSync } from "@core/hooks/use-session-authorization-sync";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { isSudoCancelledError } from "@core/store/useSudoStore";
import { useCallback, useMemo, useRef, useState } from "react";

/**
 * React hook/ViewModel orchestrating state and data flows for group keys.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export const userGroupKeys = {
  all: ["user-groups"] as const,
  lists: () => [...userGroupKeys.all] as const,
  list: (filters: Record<string, unknown>) => [...userGroupKeys.all, "list", filters] as const,
  detail: (id: string) => [...userGroupKeys.all, "detail", id] as const,
};

// Flat list-item shape expected by GenericCrudView (must have { id: string })
/**
 * Interface defining property specifications, keys types, and structural contract rules for user group list item.
 */
export interface UserGroupListItem {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  tenantId: string;
  tenantName?: string;
  isActive: boolean;
  memberCount: number;
  roleCount: number;
  createdAt: string;
  roles?: UserGroupRole[];
  rowVersion?: string | null;
}

/**
 * React hook/ViewModel orchestrating state and data flows for user groups view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useUserGroupsViewModel(options?: { useMyTenant?: boolean; tenantId?: string }) {
  const repo = identityContainer.userGroupRepository;
  const { useMyTenant, tenantId } = options || {};
  const queryClient = useQueryClient();
  const syncSessionAuthorization = useSessionAuthorizationSync();
  const userTenantId = useAppStore((s) => s.user?.tenantId ?? null);
  const { success, error: toastError, info } = useEnhancedToast();
  const { t, language } = useI18n();
  const hydratedRowVersionsRef = useRef<Map<string, string | null | undefined>>(new Map());
  const hydratedEditRolesRef = useRef<UserGroupRole[]>([]);

  const syncAuthorizationSafely = useCallback(async () => {
    try {
      await syncSessionAuthorization(tenantId ?? null);
    } catch {
      // Best-effort session sync must not mask an already-committed backend mutation.
    }
  }, [syncSessionAuthorization, tenantId]);

  const handleMutationError = useCallback(
    (err: unknown) => {
      if (isSudoCancelledError(err)) {
        info({
          title: t("profile.sudo.cancelledTitle"),
          description: t("profile.sudo.cancelledDescription"),
        });
        return;
      }
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("common.error"),
      });
    },
    [info, toastError, t]
  );

  // deferSuccessEffects: true -- this screen sets entityTypeKey (see
  // getConfigBase below), so GenericCrudView also saves custom-field values
  // after the user group itself is created/updated. Without this option,
  // useCrudViewModel's onCreateSuccess/onUpdateSuccess fired the toast and
  // closed the modal the instant createItem's own promise resolved -- before
  // the custom-field save even started -- and a subsequent save failure had
  // nowhere left to surface (design doc W0-1). Same pattern as
  // useAdminsViewModel/useUsersViewModel/useWorkItemViewModel.
  const rawVm = useCrudViewModel<UserGroupListItem, CreateUserGroupRequest, UpdateUserGroupRequest>(
    [...userGroupKeys.all, useMyTenant ? "current-tenant" : tenantId || "all"],
    {
      getAll: async (params) => {
        const payload = {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
          search: params.search as string | undefined,
          tenantId,
        };
        const result = useMyTenant
          ? await repo.getCurrentTenantGroups(payload)
          : await repo.getAll(payload);
        return {
          items: result.items.map((g) => ({
            id: g.id,
            nameEn: g.nameEn,
            nameAr: g.nameAr,
            code: g.code,
            descriptionEn: g.descriptionEn,
            descriptionAr: g.descriptionAr,
            tenantId: g.tenantId,
            tenantName: g.tenantName,
            isActive: g.isActive,
            memberCount: g.memberCount,
            roleCount: g.roleCount,
            createdAt: g.createdAt,
            ...(g.roles?.length ? { roles: g.roles } : {}),
            ...(g.rowVersion != null ? { rowVersion: g.rowVersion } : {}),
          })),
          pagination: {
            itemsCount: result.totalCount,
            page: result.page,
            pageSize: result.pageSize,
            pagesCount: result.totalPages,
          },
        };
      },
      create: async (data: CreateUserGroupRequest) => {
        const id = tenantId
          ? await repo.create({ ...data, tenantId })
          : useMyTenant
            ? await repo.createInCurrentTenant(data)
            : await repo.create(data);
        // Return a placeholder item — list will be refreshed
        return { id } as any;
      },
      update: async (id: string, data: UpdateUserGroupRequest) => {
        const resolvedRowVersion = data.rowVersion ?? hydratedRowVersionsRef.current.get(id);
        const payload: UpdateUserGroupRequest =
          resolvedRowVersion !== undefined ? { ...data, rowVersion: resolvedRowVersion } : data;
        await repo.update(id, payload);
        hydratedRowVersionsRef.current.delete(id);
        await syncAuthorizationSafely();
        return { id } as any;
      },
      delete: async (id: string) => {
        await repo.delete(id);
        await syncAuthorizationSafely();
      },
    },
    { deferSuccessEffects: true }
  );

  const openEditModal = useCallback(
    async (item: UserGroupListItem) => {
      try {
        const detail = await repo.getById(item.id);
        const resolvedRowVersion = detail.rowVersion ?? item.rowVersion ?? null;
        hydratedRowVersionsRef.current.set(item.id, resolvedRowVersion);
        hydratedEditRolesRef.current = detail.roles ?? [];
        rawVm.openEditModal({
          ...item,
          nameEn: detail.nameEn || item.nameEn,
          nameAr: detail.nameAr || item.nameAr,
          descriptionEn: detail.descriptionEn ?? item.descriptionEn,
          descriptionAr: detail.descriptionAr ?? item.descriptionAr,
          isActive: detail.isActive,
          roles: detail.roles,
          rowVersion: resolvedRowVersion,
        });
      } catch (err: unknown) {
        toastError({
          title: t("common.error"),
          description: err instanceof Error ? err.message : t("userGroups.failedToLoad"),
        });
      }
    },
    [repo, rawVm, toastError, t]
  );

  const vm = useMemo(
    () => ({
      ...rawVm,
      openEditModal,
    }),
    [rawVm, openEditModal]
  );

  // --- Cascade Dialog States ---
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ids: string[];
    isPending: boolean;
  }>({
    open: false,
    ids: [],
    isPending: false,
  });

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    ids: string[];
    isActive: boolean;
    isPending: boolean;
  }>({
    open: false,
    ids: [],
    isActive: false,
    isPending: false,
  });

  const triggerDelete = (ids: string[]) => setDeleteDialog({ open: true, ids, isPending: false });
  const triggerStatus = (ids: string[], isActive: boolean) =>
    setStatusDialog({ open: true, ids, isActive, isPending: false });

  const handleRoleSearch = async (query: string) => {
    try {
      const pageSize = query.trim() ? 20 : 100;
      const result =
        useMyTenant || (!tenantId && userTenantId)
          ? await identityContainer.roleRepository.getCurrentTenantRoles({
              search: query,
              page: 1,
              pageSize,
            })
          : await identityContainer.roleRepository.getAll({
              search: query,
              page: 1,
              pageSize,
              tenantId,
              strict: true,
            });
      const sorted = [...(result.items || [])]
        .sort((a, b) => {
          const priorityDiff =
            (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER);
          if (priorityDiff !== 0) return priorityDiff;
          const labelA = resolveBilingualLabel(a.nameEn, a.nameAr, language || "en");
          const labelB = resolveBilingualLabel(b.nameEn, b.nameAr, language || "en");
          return labelA.localeCompare(labelB) || a.code.localeCompare(b.code);
        })
        .map((r) => ({
          value: r.id,
          label: resolveBilingualLabel(r.nameEn, r.nameAr, language || "en"),
        }));
      if (!query.trim() && hydratedEditRolesRef.current.length > 0) {
        const seen = new Set(sorted.map((o) => o.value));
        for (const hr of hydratedEditRolesRef.current) {
          if (!seen.has(hr.roleId)) {
            sorted.push({
              value: hr.roleId,
              label: resolveBilingualLabel(hr.nameEn, hr.nameAr, language || "en"),
            });
          }
        }
      }
      return sorted;
    } catch {
      return [];
    }
  };

  function getConfigBase(t: any) {
    return {
      createFields: [
        {
          name: "roleIds",
          label: t("userGroups.roles"),
          type: "multi-select" as const,
          placeholder: t("roles.selectPlaceholder"),
          searchPlaceholder: t("roles.search"),
          required: true,
          onServerSearch: handleRoleSearch,
          searchType: "server" as const,
          noResultsText: t("roles.noResults"),
        },
        {
          name: "nameEn",
          label: t("userGroups.nameEn"),
          placeholder: t("userGroups.nameEnPlaceholder"),
          type: "text" as const,
          required: true,
        },
        {
          name: "nameAr",
          label: t("userGroups.nameAr"),
          placeholder: t("userGroups.nameArPlaceholder"),
          type: "text" as const,
          required: true,
        },
        {
          name: "code",
          label: t("userGroups.code"),
          placeholder: t("userGroups.codePlaceholder"),
          description: t("userGroups.codeHint"),
          type: "text" as const,
          required: true,
        },
        {
          name: "descriptionEn",
          label: t("userGroups.descriptionEn"),
          placeholder: t("userGroups.descEnPlaceholder"),
          type: "textarea" as const,
        },
        {
          name: "descriptionAr",
          label: t("userGroups.descriptionAr"),
          placeholder: t("userGroups.descArPlaceholder"),
          type: "textarea" as const,
        },
      ],
      editFields: [
        {
          name: "roleIds",
          label: t("userGroups.roles"),
          type: "multi-select" as const,
          placeholder: t("roles.selectPlaceholder"),
          searchPlaceholder: t("roles.search"),
          required: true,
          onServerSearch: handleRoleSearch,
          searchType: "server" as const,
          noResultsText: t("roles.noResults"),
        },
        {
          name: "nameEn",
          label: t("userGroups.nameEn"),
          placeholder: t("userGroups.nameEnPlaceholder"),
          type: "text" as const,
          required: true,
        },
        {
          name: "nameAr",
          label: t("userGroups.nameAr"),
          placeholder: t("userGroups.nameArPlaceholder"),
          type: "text" as const,
          required: true,
        },
        {
          name: "descriptionEn",
          label: t("userGroups.descriptionEn"),
          placeholder: t("userGroups.descEnPlaceholder"),
          type: "textarea" as const,
        },
        {
          name: "descriptionAr",
          label: t("userGroups.descriptionAr"),
          placeholder: t("userGroups.descArPlaceholder"),
          type: "textarea" as const,
        },
        { name: "isActive", label: t("common.status"), type: "switch" as const },
      ],
      createInitialValues: {
        nameEn: "",
        nameAr: "",
        code: "",
        descriptionEn: "",
        descriptionAr: "",
        roleIds: [] as string[],
      },
      editInitialValues: (item: any) => ({
        id: item.id,
        nameEn: item.nameEn,
        nameAr: item.nameAr,
        descriptionEn: item.descriptionEn ?? "",
        descriptionAr: item.descriptionAr ?? "",
        roleIds: item.roles?.map((r: any) => r.roleId) || [],
        isActive: item.isActive,
        ...(item.rowVersion != null ? { rowVersion: item.rowVersion } : {}),
      }),
      getItemDisplayName: (item: UserGroupListItem) => item.nameEn || item.code,
      deleteService: async (id: string) => {
        await repo.delete(id);
      },
      permissions: {
        view: "user_groups.view",
        create: "user_groups.create",
        update: "user_groups.update",
        delete: "user_groups.delete",
      },
    };
  }

  const handleToggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        if (isActive) {
          await repo.bulkActivate([id]);
        } else {
          await repo.bulkDeactivate([id]);
        }
        queryClient.invalidateQueries({ queryKey: userGroupKeys.lists() });
        await syncAuthorizationSafely();
        success({
          title: isActive
            ? t("userGroups.toggleActivatedTitle")
            : t("userGroups.toggleDeactivatedTitle"),
          description: isActive
            ? t("userGroups.toggleActivatedDesc")
            : t("userGroups.toggleDeactivatedDesc"),
        });
      } catch (err: unknown) {
        handleMutationError(err);
      }
    },
    [repo, queryClient, syncAuthorizationSafely, success, handleMutationError, t]
  );

  const bulkActivateMutation = useMutation({
    mutationFn: ({ ids, cascadeAdmins }: { ids: string[]; cascadeAdmins: boolean }) =>
      repo.bulkActivate(ids, cascadeAdmins),
    onSuccess: async (count) => {
      queryClient.invalidateQueries({ queryKey: userGroupKeys.lists() });
      await syncAuthorizationSafely();
      success({
        title: t("userGroups.bulkActivatedTitle"),
        description: t("userGroups.bulkActivatedDesc", { count }),
      });
    },
    onError: handleMutationError,
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: ({ ids, cascadeAdmins }: { ids: string[]; cascadeAdmins: boolean }) =>
      repo.bulkDeactivate(ids, cascadeAdmins),
    onSuccess: async (count) => {
      queryClient.invalidateQueries({ queryKey: userGroupKeys.lists() });
      await syncAuthorizationSafely();
      success({
        title: t("userGroups.bulkDeactivatedTitle"),
        description: t("userGroups.bulkDeactivatedDesc", { count }),
      });
    },
    onError: handleMutationError,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: ({ ids, cascadeAdmins }: { ids: string[]; cascadeAdmins: boolean }) =>
      repo.bulkDelete(ids, cascadeAdmins),
    onSuccess: async (count) => {
      queryClient.invalidateQueries({ queryKey: userGroupKeys.lists() });
      await syncAuthorizationSafely();
      success({
        title: t("userGroups.bulkDeletedTitle"),
        description: t("userGroups.bulkDeletedDesc", { count }),
      });
    },
    onError: handleMutationError,
  });

  const confirmDelete = async (cascadeAdmins: boolean) => {
    setDeleteDialog((s) => ({ ...s, isPending: true }));
    try {
      await bulkDeleteMutation.mutateAsync({ ids: deleteDialog.ids, cascadeAdmins });
      setDeleteDialog({ open: false, ids: [], isPending: false });
    } catch {
      // Mutation onError already handles error or Sudo cancellation toasts; keep dialog open.
      setDeleteDialog((s) => ({ ...s, isPending: false }));
    }
  };

  const confirmStatus = async (cascadeAdmins: boolean) => {
    setStatusDialog((s) => ({ ...s, isPending: true }));
    try {
      if (statusDialog.isActive) {
        await bulkActivateMutation.mutateAsync({ ids: statusDialog.ids, cascadeAdmins });
      } else {
        await bulkDeactivateMutation.mutateAsync({ ids: statusDialog.ids, cascadeAdmins });
      }
      setStatusDialog({ open: false, ids: [], isActive: false, isPending: false });
    } catch {
      // Mutation onError already handles error or Sudo cancellation toasts; keep dialog open.
      setStatusDialog((s) => ({ ...s, isPending: false }));
    }
  };

  return {
    vm,
    getConfigBase,
    handleToggleActive, // Kept for backwards compatibility if needed, though replaced mostly by triggerStatus
    handleBulkActivate: (ids: string[]) => triggerStatus(ids, true),
    handleBulkDeactivate: (ids: string[]) => triggerStatus(ids, false),
    handleBulkDelete: (ids: string[]) => triggerDelete(ids),
    triggerDelete,
    triggerStatus,
    deleteDialog,
    setDeleteDialog,
    statusDialog,
    setStatusDialog,
    confirmDelete,
    confirmStatus,
  };
}
