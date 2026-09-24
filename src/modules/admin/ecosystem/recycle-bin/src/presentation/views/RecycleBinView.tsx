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
import { Tabs, TabsList, TabsTrigger } from "@core/ui/tabs";
import { RotateCcw } from "lucide-react";
import { formatUtc } from "@core/common/utils";
import type { DeletedItem } from "../../domain/entities/DeletedItem";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
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
    { key: "userGroups", label: t("recycleBin.tabs.userGroups"), count: vm.tabCounts.userGroups },
  ];

  // ============ Columns ============
  const canRestore = vm.canRestore;
  const isRestoring = vm.isRestoring;
  const handleRestore = vm.handleRestore;
  const handleBulkRestore = vm.handleBulkRestore;

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
            item.deletedAt ? formatUtc(item.deletedAt, "MMM d, yyyy HH:mm") : "—",
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
              // "pending" is the badge primitive's own warning-strong tier —
              // the fourth ramp step (ok → warn → high → critical), not a
              // second amber. A badge is a reading, so it never gets a
              // hand-invented hover.
              return (
                <Badge variant="pending" className="text-xs">
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
      hideActionsColumn: !canRestore,
      getActions: (): CrudAction<DeletedItem>[] => {
        if (!canRestore) return [];
        return [
          {
            label: t("recycleBin.restore"),
            onClick: (item: DeletedItem) =>
              handleRestore(item.entityType.toLowerCase(), item.id),
            variant: "ghost" as const,
            icon: <RotateCcw className="h-4 w-4" aria-hidden="true" />,
            loading: isRestoring,
            confirmTitle: t("recycleBin.confirmRestore"),
            confirmDescription: t("recycleBin.confirmRestoreDesc"),
            confirmVariant: "default" as const,
            confirmButtonText: t("recycleBin.restore"),
          },
        ];
      },
      bulkActions: canRestore
        ? [
            {
              label: t("recycleBin.bulkRestore"),
              onClick: async (selectedIds: string[]) => handleBulkRestore(selectedIds),
              variant: "default" as const,
              icon: <RotateCcw className="h-4 w-4" aria-hidden="true" />,
              requiresConfirmation: true,
              confirmTitle: t("recycleBin.confirmBulkRestore"),
              confirmDescription: t("recycleBin.confirmBulkRestoreDesc"),
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
    [t, canRestore, isRestoring, handleRestore, handleBulkRestore]
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
    [vm, selectedItems]
  );

  return (
    <div className="space-y-6" dir={direction}>
      {/* Tab Switcher — NOT inside GenericCrudView, and GenericCrudView is
          never rendered inside a TabsContent, so switching the active tab
          swaps the data, not the mounted component (no unmount/remount
          freeze). The Tabs primitive gives the trigger row real tablist
          semantics and keyboard nav for free instead of hand-rolled buttons. */}
      <Tabs
        value={vm.activeTab}
        onValueChange={(value) => {
          setSelectedItems([]); // Clear selection on tab change
          vm.setActiveTab(value as TabType);
        }}
      >
        <TabsList variant="pill" className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
              {tab.label}
              {tab.count > 0 && (
                <Badge
                  variant={vm.activeTab === tab.key ? "default" : "secondary"}
                  className="h-5 min-w-[20px] px-1.5 text-[11px] leading-none"
                >
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Single GenericCrudView — data swaps, component stays mounted */}
      <GenericCrudView viewModel={crudVm} config={config} />

      <CascadeRestoreDialog
        open={vm.restoreDialog.open}
        onOpenChange={(v) => vm.setRestoreDialog((s) => ({ ...s, open: v }))}
        onConfirm={vm.confirmRestore}
        isPending={vm.restoreDialog.isPending}
        itemName={
          vm.restoreDialog.ids.length > 1
            ? t("recycleBin.groupsCount", { count: vm.restoreDialog.ids.length })
            : t("recycleBin.selectedGroup")
        }
      />
    </div>
  );
}
