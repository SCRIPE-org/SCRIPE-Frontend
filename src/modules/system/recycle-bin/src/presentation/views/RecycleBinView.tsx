/**
 * RecycleBinView
 *
 * Pure UI view for the Recycle Bin page.
 * Uses GenericCrudView for table rendering with tab-based filtering.
 * Columns and actions defined here (JSX belongs in .tsx files).
 *
 * @module recycle-bin/presentation
 */
'use client';

import { useMemo, useState } from 'react';
import { useRecycleBinViewModel, type TabType } from '../viewmodels/useRecycleBinViewModel';
import { useI18n } from '@core/providers/i18n-provider';
import { GenericCrudView } from '@core/crud/components/generic-crud-view';
import type { CrudConfig, CrudAction, BulkAction } from '@core/crud/components/generic-crud-view';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@core/ui/tabs';
import { Badge } from '@core/ui/badge';
import { RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import type { DeletedItem } from '../../domain/entities/DeletedItem';
import { SYSTEM_PERMISSIONS } from '@core/common/types/permissions';

export function RecycleBinView() {
      const vm = useRecycleBinViewModel();
      const { t, direction } = useI18n();

      const tabs: { key: TabType; label: string; count: number }[] = [
            { key: 'tenants', label: t('recycleBin.tabs.tenants'), count: vm.tabCounts.tenants },
            { key: 'admins', label: t('recycleBin.tabs.admins'), count: vm.tabCounts.admins },
            { key: 'users', label: t('recycleBin.tabs.users'), count: vm.tabCounts.users },
            { key: 'roles', label: t('recycleBin.tabs.roles'), count: vm.tabCounts.roles },
      ];

      // ============ Columns (defined in View for JSX rendering) ============
      const config: CrudConfig<DeletedItem> = useMemo(() => ({
            enableBulkActions: true,
            titleKey: 'recycleBin.title',
            subtitleKey: 'recycleBin.description',
            resource: 'recycle_bin',
            columns: [
                  {
                        key: 'name',
                        label: t('recycleBin.columns.name'),
                        sortable: true,
                        render: (_val: unknown, item: DeletedItem) => item.name,
                  },
                  {
                        key: 'email',
                        label: t('recycleBin.columns.email'),
                        render: (_val: unknown, item: DeletedItem) => item.email ?? '—',
                  },
                  {
                        key: 'tenantName',
                        label: t('recycleBin.columns.tenant'),
                        render: (_val: unknown, item: DeletedItem) => item.tenantName ?? '—',
                  },
                  {
                        key: 'deletedAt',
                        label: t('recycleBin.columns.deletedAt'),
                        render: (_val: unknown, item: DeletedItem) =>
                              item.deletedAt ? format(item.deletedAt, 'MMM d, yyyy HH:mm') : '—',
                  },
                  {
                        key: 'daysUntilPermanent',
                        label: t('recycleBin.columns.daysRemaining'),
                        render: (_val: unknown, item: DeletedItem) => {
                              const days = item.daysUntilPermanent;
                              if (days <= 1) {
                                    return <Badge variant="destructive" className="text-xs">{t('recycleBin.permanent')}</Badge>;
                              }
                              if (days <= 7) {
                                    return (
                                          <Badge variant="destructive" className="text-xs bg-orange-500/15 text-orange-600 border-orange-500/20 hover:bg-orange-500/20">
                                                {t('recycleBin.daysLeft', { days })}
                                          </Badge>
                                    );
                              }
                              return <Badge variant="secondary" className="text-xs">{t('recycleBin.daysLeft', { days })}</Badge>;
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
                              label: t('recycleBin.restore'),
                              onClick: (item: DeletedItem) =>
                                    vm.handleRestore(item.entityType.toLowerCase(), item.id),
                              variant: 'ghost' as const,
                              icon: <RotateCcw className="h-4 w-4" />,
                              loading: vm.isRestoring,
                              confirmTitle: t('recycleBin.confirmRestore') || 'Confirm Restore',
                              confirmDescription: t('recycleBin.confirmRestoreDesc') || 'Are you sure you want to restore {name}?',
                        },
                  ];
            },
            bulkActions: vm.canRestore ? [
                  {
                        label: t('recycleBin.bulkRestore') || 'Restore Selected',
                        onClick: async (selectedIds: string[]) => vm.handleBulkRestore(selectedIds),
                        variant: 'default' as const,
                        icon: <RotateCcw className="h-4 w-4" />,
                        requiresConfirmation: true,
                        confirmTitle: t('recycleBin.confirmBulkRestore') || 'Bulk Restore',
                        confirmDescription: t('recycleBin.confirmBulkRestoreDesc') || 'Are you sure you want to restore {count} items?',
                        minItems: 1,
                  } satisfies BulkAction,
            ] : [],
            permissions: {
                  canView: SYSTEM_PERMISSIONS.RECYCLE_BIN_VIEW,
                  canCreate: false,
                  canUpdate: false,
                  canDelete: false,
            },
      }), [t, vm.canRestore, vm.isRestoring, vm.handleRestore, vm.handleBulkRestore]);

      // Selection state for bulk operations
      const [selectedItems, setSelectedItems] = useState<string[]>([]);

      // Build a lightweight viewModel shape that GenericCrudView expects
      const crudVm = useMemo(() => ({
            items: vm.currentItems,
            loading: vm.isLoading,
            error: vm.error,
            pagination: { itemsCount: vm.currentItems.length, pageSize: 100, page: 1, pagesCount: 1 },
            page: 1,
            pageSize: 100,
            searchValue: '',
            handleSearchChange: () => { },
            changePage: () => { },
            changePageSize: () => { },
            isCreateModalOpen: false,
            setIsCreateModalOpen: () => { },
            isEditModalOpen: false,
            setIsEditModalOpen: () => { },
            editingItem: null,
            openEditModal: () => { },
            closeEditModal: () => { },
            viewModalOpen: false,
            setViewModalOpen: () => { },
            viewItem: null,
            openViewModal: () => { },
            closeViewModal: () => { },
            selectedItems,
            setSelectedItems,
            createItem: async () => { },
            updateItem: async () => { },
            deleteItem: async () => { },
            refreshItems: vm.refreshItems,
            refresh: vm.refreshItems,
            isCreating: false,
            isUpdating: false,
            isDeleting: false,
      }), [vm.currentItems, vm.isLoading, vm.error, selectedItems]);

      return (
            <div className="space-y-6" dir={direction}>
                  <Tabs value={vm.activeTab} onValueChange={(v) => vm.setActiveTab(v as TabType)}>
                        <TabsList className="grid w-full grid-cols-4">
                              {tabs.map((tab) => (
                                    <TabsTrigger key={tab.key} value={tab.key} className="relative">
                                          {tab.label}
                                          {tab.count > 0 && (
                                                <Badge
                                                      variant="destructive"
                                                      className="absolute -top-1 ltr:-right-1 rtl:-left-1 h-5 min-w-5 px-1 text-[10px]"
                                                >
                                                      {tab.count}
                                                </Badge>
                                          )}
                                    </TabsTrigger>
                              ))}
                        </TabsList>

                        {tabs.map((tab) => (
                              <TabsContent key={tab.key} value={tab.key}>
                                    <GenericCrudView
                                          viewModel={{
                                                ...crudVm,
                                                items: vm.activeTab === tab.key ? vm.currentItems : [],
                                                pagination: {
                                                      itemsCount: vm.activeTab === tab.key ? vm.currentItems.length : 0,
                                                      pageSize: 100,
                                                      page: 1,
                                                      pagesCount: 1,
                                                },
                                          }}
                                          config={config}
                                    />
                              </TabsContent>
                        ))}
                  </Tabs>
            </div>
      );
}
