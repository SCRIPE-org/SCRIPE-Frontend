// UI-EXCEPTION: compact studio layout
/**
 * RecycleBinView
 *
 * Pure UI view for the Recycle Bin page.
 * Uses a SINGLE GenericCrudView with tab-based filtering.
 * Tabs are rendered above the table — switching tabs swaps the data,
 * NOT the component, preventing mount/unmount freezes.
 *
 * @module recycle-bin/presentation
 */
"use client";

import { useMemo, useState } from "react";
import { useRecycleBinViewModel, type TabType } from "../viewmodels/useRecycleBinViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction, BulkAction } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { RotateCcw } from "lucide-react";
import { format } from "date-fns";
import type { DeletedItem } from "../../domain/entities/DeletedItem";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { cn } from "@core/common/utils";
import { CascadeRestoreDialog } from "../components/CascadeRestoreDialog";
import { useModuleLocales } from "@core/hooks/use-module-locales";

/**
 * Presentation UI component rendering the recycle bin view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RecycleBinView() {
  useModuleLocales(() => import("../../../locales"), "recycle-bin");

  const vm = useRecycleBinViewModel();
  const { t, direction } = useI18n();

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "tenants", label: t("recycleBin.tabs.tenants"), count: vm.tabCounts.tenants },
    { key: "admins", label: t("recycleBin.tabs.admins"), count: vm.tabCounts.admins },
    { key: "users", label: t("recycleBin.tabs.users"), count: vm.tabCounts.users },
    { key: "roles", label: t("recycleBin.tabs.roles"), count: vm.tabCounts.roles },
    {
      key: "userGroups",
      label: t("recycleBin.tabs.userGroups") || "User Groups",
      count: vm.tabCounts.userGroups,
    },
  ];

  // ============ Columns ============
  const config: CrudConfig<DeletedItem> = useMemo(
    () => ({
      enableBulkActions: true,
      titleKey: "recycleBin.title",
      subtitleKey: "recycleBin.description",
      resource: "recycle_bin",
      columns: [
        {
          key: "name",
          label: t("recycleBin.columns.name"),
          sortable: true,
          render: (_val: unknown, item: DeletedItem) => item.name,
        },
        {
          key: "email",
          label: t("recycleBin.columns.email"),
          render: (_val: unknown, item: DeletedItem) => item.email ?? "—",
        },
        {
          key: "tenantName",
          label: t("recycleBin.columns.tenant"),
          render: (_val: unknown, item: DeletedItem) => item.tenantName ?? "—",
        },
        {
          key: "deletedAt",
          label: t("recycleBin.columns.deletedAt"),
          render: (_val: unknown, item: DeletedItem) =>
            item.deletedAt ? format(item.deletedAt, "MMM d, yyyy HH:mm") : "—",
        },
        {
          key: "daysUntilPermanent",
          label: t("recycleBin.columns.daysRemaining"),
          render: (_val: unknown, item: DeletedItem) => {
            const days = item.daysUntilPermanent;
            if (days <= 1) {
              return (
                <Badge variant="destructive" className="text-xs">
                  {t("recycleBin.permanent")}
                </Badge>
              );
            }
            if (days <= 7) {
              return (
                <Badge
                  variant="destructive"
                  className="border-orange-500/20 bg-orange-500/15 text-xs text-orange-600 hover:bg-orange-500/20"
                >
                  {t("recycleBin.daysLeft", { days })}
                </Badge>
              );
            }
            return (
              <Badge variant="secondary" className="text-xs">
                {t("recycleBin.daysLeft", { days })}
              </Badge>
            );
          },
        },
      ],
      createFields: [],
      editFields: [],
      hideAddButton: true,
      hideActionsColumn: !vm.canRestore,
      getActions: (): CrudAction<DeletedItem>[] => {
        if (!vm.canRestore) return [];
        return [
          {
            label: t("recycleBin.restore"),
            onClick: (item: DeletedItem) =>
              vm.handleRestore(item.entityType.toLowerCase(), item.id),
            variant: "ghost" as const,
            icon: <RotateCcw className="h-4 w-4" />,
            loading: vm.isRestoring,
            confirmTitle: t("recycleBin.confirmRestore") || "Confirm Restore",
            confirmDescription:
              t("recycleBin.confirmRestoreDesc") || "Are you sure you want to restore {name}?",
            confirmVariant: "default" as const,
            confirmButtonText: t("recycleBin.restore") || "Restore",
          },
        ];
      },
      bulkActions: vm.canRestore
        ? [
            {
              label: t("recycleBin.bulkRestore") || "Restore Selected",
              onClick: async (selectedIds: string[]) => vm.handleBulkRestore(selectedIds),
              variant: "default" as const,
              icon: <RotateCcw className="h-4 w-4" />,
              requiresConfirmation: true,
              confirmTitle: t("recycleBin.confirmBulkRestore") || "Bulk Restore",
              confirmDescription:
                t("recycleBin.confirmBulkRestoreDesc") ||
                "Are you sure you want to restore {count} items?",
              minItems: 1,
            } satisfies BulkAction,
          ]
        : [],
      permissions: {
        canView: SYSTEM_PERMISSIONS.RECYCLE_BIN_VIEW,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      },
    }),
    [t, vm.canRestore, vm.isRestoring, vm.handleRestore, vm.handleBulkRestore]
  );

  // Selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Single stable viewModel object for GenericCrudView
  const crudVm = useMemo(
    () => ({
      items: vm.currentItems,
      loading: vm.isLoading,
      error: vm.error,
      pagination: {
        itemsCount: vm.filteredCount,
        pageSize: vm.pageSize,
        page: vm.page,
        pagesCount: vm.pagesCount,
      },
      page: vm.page,
      pageSize: vm.pageSize,
      searchValue: vm.searchValue,
      handleSearchChange: vm.handleSearchChange,
      changePage: vm.changePage,
      changePageSize: vm.changePageSize,
      isCreateModalOpen: false,
      setIsCreateModalOpen: () => {},
      isEditModalOpen: false,
      setIsEditModalOpen: () => {},
      editingItem: null,
      openEditModal: () => {},
      closeEditModal: () => {},
      viewModalOpen: false,
      setViewModalOpen: () => {},
      viewItem: null,
      openViewModal: () => {},
      closeViewModal: () => {},
      selectedItems,
      setSelectedItems,
      createItem: async () => {},
      updateItem: async () => {},
      deleteItem: async () => {},
      refreshItems: vm.refreshItems,
      refresh: vm.refreshItems,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    }),
    [
      vm.currentItems,
      vm.isLoading,
      vm.error,
      vm.filteredCount,
      vm.pageSize,
      vm.page,
      vm.pagesCount,
      vm.searchValue,
      vm.handleSearchChange,
      vm.changePage,
      vm.changePageSize,
      vm.refreshItems,
      selectedItems,
    ]
  );

  return (
    <div className="space-y-6" dir={direction}>
      {/* Tab Switcher — NOT inside GenericCrudView, just plain buttons */}
      <div className="grid w-full grid-cols-5 gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setSelectedItems([]); // Clear selection on tab change
              vm.setActiveTab(tab.key);
            }}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
              vm.activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none",
                  vm.activeTab === tab.key
                    ? "bg-primary/15 text-primary"
                    : "bg-muted-foreground/15 text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Single GenericCrudView — data swaps, component stays mounted */}
      <GenericCrudView viewModel={crudVm} config={config} />

      <CascadeRestoreDialog
        open={vm.restoreDialog.open}
        onOpenChange={(v) => vm.setRestoreDialog((s) => ({ ...s, open: v }))}
        onConfirm={vm.confirmRestore}
        isPending={vm.restoreDialog.isPending}
        itemName={
          vm.restoreDialog.ids.length > 1
            ? `${vm.restoreDialog.ids.length} groups`
            : "the selected group"
        }
      />
    </div>
  );
}
