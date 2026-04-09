/**
 * RecycleBin ViewModel
 *
 * Handles all state management for the RecycleBin view.
 * Uses useQuery for fetching grouped data + custom restore mutation.
 * Provides tab management, client-side pagination, and search.
 *
 * SOLID: Single Responsibility - data fetching, tab state, pagination, restore action
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permission";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { DeletedItem } from "../../domain/entities/DeletedItem";
import type { DeletedItemsGrouped } from "../../domain/interfaces/IRecycleBinRepository";

export type TabType = "tenants" | "admins" | "users" | "roles" | "userGroups";

const RECYCLE_BIN_QUERY_KEY = ["recycle-bin"] as const;
const DEFAULT_PAGE_SIZE = 10;

export function useRecycleBinViewModel() {
  const { recycleBinRepository } = ecosystemContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const permissions = usePermissions();
  const { success, error: toastError } = useEnhancedToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("tenants");

  // Per-tab pagination state
  const [tabPages, setTabPages] = useState<Record<TabType, number>>({
    tenants: 1,
    admins: 1,
    users: 1,
    roles: 1,
    userGroups: 1,
  });

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Search state
  const [searchValue, setSearchValue] = useState("");

  // Restore dialog state
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; entityType: string; ids: string[]; isPending: boolean }>({
    open: false,
    entityType: "",
    ids: [],
    isPending: false,
  });

  // ============ Data Fetching ============
  const { data, isLoading, error } = useQuery<DeletedItemsGrouped>({
    queryKey: [...RECYCLE_BIN_QUERY_KEY],
    queryFn: () => recycleBinRepository.getAll(),
  });

  // ============ Restore Mutation ============
  const restoreMutation = useMutation({
    mutationFn: ({ entityType, id, restoreAdmins }: { entityType: string; id: string; restoreAdmins?: boolean }) =>
      recycleBinRepository.restore(entityType, id, restoreAdmins),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...RECYCLE_BIN_QUERY_KEY] });
      success({
        title: t("recycleBin.restored"),
        description: t("recycleBin.restoredDesc"),
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // ============ Bulk Restore Mutation ============
  const bulkRestoreMutation = useMutation({
    mutationFn: (items: { entityType: string; id: string; restoreAdmins?: boolean }[]) =>
      recycleBinRepository.bulkRestore(items),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [...RECYCLE_BIN_QUERY_KEY] });
      success({
        title: t("recycleBin.restored"),
        description: (
          t("recycleBin.bulkRestoredDesc") || "{count} items restored successfully"
        ).replace("{count}", String(count)),
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // ============ Computed Data ============
  const tabCounts = useMemo(
    () => ({
      tenants: data?.tenants?.length ?? 0,
      admins: data?.admins?.length ?? 0,
      users: data?.users?.length ?? 0,
      roles: data?.roles?.length ?? 0,
      userGroups: data?.userGroups?.length ?? 0,
    }),
    [data]
  );

  const totalCount = data?.totalCount ?? 0;

  // All items for the active tab (before search/pagination)
  const allTabItems: DeletedItem[] = useMemo(() => {
    if (!data) return [];
    return data[activeTab] ?? [];
  }, [data, activeTab]);

  // Filtered by search
  const filteredItems: DeletedItem[] = useMemo(() => {
    if (!searchValue.trim()) return allTabItems;
    const q = searchValue.toLowerCase();
    return allTabItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.tenantName?.toLowerCase().includes(q)
    );
  }, [allTabItems, searchValue]);

  // Client-side pagination
  const currentPage = tabPages[activeTab];
  const pagesCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems: DeletedItem[] = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // ============ Pagination handlers ============
  const changePage = useCallback(
    (page: number) => {
      setTabPages((prev) => ({ ...prev, [activeTab]: page }));
    },
    [activeTab]
  );

  const changePageSize = useCallback(
    (size: number) => {
      setPageSize(size);
      // Reset all tabs to page 1 when page size changes
      setTabPages({ tenants: 1, admins: 1, users: 1, roles: 1, userGroups: 1 });
    },
    []
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearchValue(""); // Clear search when switching tabs
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      // Reset page to 1 when searching
      setTabPages((prev) => ({ ...prev, [activeTab]: 1 }));
    },
    [activeTab]
  );

  // ============ Permissions ============
  const canRestore = permissions.has(SYSTEM_PERMISSIONS.RECYCLE_BIN_RESTORE);

  // ============ Handlers ============

  const triggerRestore = useCallback((entityType: string, id: string) => {
    if (entityType.toLowerCase() === "usergroup" || entityType.toLowerCase() === "usergroups") {
      setRestoreDialog({ open: true, entityType, ids: [id], isPending: false });
    } else {
      restoreMutation.mutate({ entityType, id });
    }
  }, [restoreMutation]);

  const triggerBulkRestore = useCallback((ids: string[]) => {
    if (ids.length === 0) return;

    // Determine entity type from the first item (all selected items should be of the same type via the active tab)
    const firstItem = allTabItems.find((ci) => ci.id === ids[0]);
    if (!firstItem) return;

    if (firstItem.entityType.toLowerCase() === "usergroup" || firstItem.entityType.toLowerCase() === "usergroups") {
      setRestoreDialog({ open: true, entityType: firstItem.entityType, ids, isPending: false });
    } else {
      const items = ids
        .map((id) => {
          const item = allTabItems.find((ci) => ci.id === id);
          return item ? { entityType: item.entityType.toLowerCase(), id: item.id } : null;
        })
        .filter((i): i is { entityType: string; id: string } => i !== null);
      if (items.length > 0) {
        bulkRestoreMutation.mutate(items);
      }
    }
  }, [allTabItems, bulkRestoreMutation]);

  const confirmRestore = useCallback(async (restoreAdmins: boolean) => {
    setRestoreDialog(s => ({ ...s, isPending: true }));
    try {
      if (restoreDialog.ids.length === 1) {
        await restoreMutation.mutateAsync({ entityType: restoreDialog.entityType, id: restoreDialog.ids[0], restoreAdmins });
      } else {
        const items = restoreDialog.ids.map(id => ({ entityType: restoreDialog.entityType, id, restoreAdmins }));
        await bulkRestoreMutation.mutateAsync(items);
      }
      setRestoreDialog({ open: false, entityType: "", ids: [], isPending: false });
    } catch (err: any) {
      toastError({ title: t("common.error"), description: err.message });
      setRestoreDialog(s => ({ ...s, isPending: false }));
    }
  }, [restoreDialog, restoreMutation, bulkRestoreMutation, toastError, t]);

  const handleRestore = useCallback(
    (entityType: string, id: string) => triggerRestore(entityType, id),
    [triggerRestore]
  );

  const handleBulkRestore = useCallback(
    (ids: string[]) => triggerBulkRestore(ids),
    [triggerBulkRestore]
  );

  return {
    // Data
    currentItems: paginatedItems,
    isLoading,
    error: error ? (error as Error).message : null,
    totalCount,

    // Tabs
    activeTab,
    setActiveTab: handleTabChange,
    tabCounts,

    // Search
    searchValue,
    handleSearchChange,

    // Pagination
    page: currentPage,
    pageSize,
    pagesCount,
    filteredCount: filteredItems.length,
    changePage,
    changePageSize,

    // Restore
    canRestore,
    isRestoring: restoreMutation.isPending,
    handleRestore,

    // Bulk Restore
    isBulkRestoring: bulkRestoreMutation.isPending,
    handleBulkRestore,

    // Dialog state
    restoreDialog,
    setRestoreDialog,
    confirmRestore,

    // Refresh
    refreshItems: () => queryClient.invalidateQueries({ queryKey: [...RECYCLE_BIN_QUERY_KEY] }),

    // i18n
    t,
  };
}
