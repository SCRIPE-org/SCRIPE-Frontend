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
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permission";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { DeletedItem } from "../../domain/entities/DeletedItem";
import type { DeletedItemsGrouped } from "../../domain/interfaces/IRecycleBinRepository";

export type TabType = "tenants" | "admins" | "users" | "roles";

const RECYCLE_BIN_QUERY_KEY = ["recycle-bin"] as const;
const DEFAULT_PAGE_SIZE = 10;

export function useRecycleBinViewModel() {
  const { recycleBinRepository } = systemContainer;
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
  });

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Search state
  const [searchValue, setSearchValue] = useState("");

  // ============ Data Fetching ============
  const { data, isLoading, error } = useQuery<DeletedItemsGrouped>({
    queryKey: [...RECYCLE_BIN_QUERY_KEY],
    queryFn: () => recycleBinRepository.getAll(),
  });

  // ============ Restore Mutation ============
  const restoreMutation = useMutation({
    mutationFn: ({ entityType, id }: { entityType: string; id: string }) =>
      recycleBinRepository.restore(entityType, id),
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
    mutationFn: (items: { entityType: string; id: string }[]) =>
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
      setTabPages({ tenants: 1, admins: 1, users: 1, roles: 1 });
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
  const handleRestore = useCallback(
    (entityType: string, id: string) => restoreMutation.mutate({ entityType, id }),
    [restoreMutation]
  );

  const handleBulkRestore = useCallback(
    (ids: string[]) => {
      const items = ids
        .map((id) => {
          const item = allTabItems.find((ci) => ci.id === id);
          return item ? { entityType: item.entityType.toLowerCase(), id: item.id } : null;
        })
        .filter((i): i is { entityType: string; id: string } => i !== null);
      if (items.length > 0) {
        bulkRestoreMutation.mutate(items);
      }
    },
    [allTabItems, bulkRestoreMutation]
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

    // Refresh
    refreshItems: () => queryClient.invalidateQueries({ queryKey: [...RECYCLE_BIN_QUERY_KEY] }),

    // i18n
    t,
  };
}
