/**
 * RecycleBin ViewModel
 *
 * Handles all state management for the RecycleBin view.
 * Uses useQuery for fetching grouped data + custom restore mutation.
 * Provides tab management and filtered items for GenericCrudView.
 *
 * SOLID: Single Responsibility - data fetching, tab state, restore action
 */
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemContainer } from '@modules/system/di';
import { useI18n } from '@core/providers/i18n-provider';
import { usePermissions } from '@core/hooks/use-permission';
import { useEnhancedToast } from '@core/hooks/use-enhanced-toast';
import { SYSTEM_PERMISSIONS } from '@core/common/types/permissions';
import type { DeletedItem } from '../../domain/entities/DeletedItem';
import type { DeletedItemsGrouped } from '../../domain/interfaces/IRecycleBinRepository';

export type TabType = 'tenants' | 'admins' | 'users' | 'roles';

const RECYCLE_BIN_QUERY_KEY = ['recycle-bin'] as const;

export function useRecycleBinViewModel() {
      const { recycleBinRepository } = systemContainer;
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const permissions = usePermissions();
      const { success, error: toastError } = useEnhancedToast();

      // Tab state
      const [activeTab, setActiveTab] = useState<TabType>('tenants');

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
                        title: t('recycleBin.restored'),
                        description: t('recycleBin.restoredDesc'),
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t('common.error'),
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
                        title: t('recycleBin.restored'),
                        description: (t('recycleBin.bulkRestoredDesc') || '{count} items restored successfully').replace('{count}', String(count)),
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t('common.error'),
                        description: err.message,
                  });
            },
      });

      // ============ Computed Data ============
      const tabCounts = useMemo(() => ({
            tenants: data?.tenants?.length ?? 0,
            admins: data?.admins?.length ?? 0,
            users: data?.users?.length ?? 0,
            roles: data?.roles?.length ?? 0,
      }), [data]);

      const totalCount = data?.totalCount ?? 0;

      const currentItems: DeletedItem[] = useMemo(() => {
            if (!data) return [];
            return data[activeTab] ?? [];
      }, [data, activeTab]);

      // ============ Permissions ============
      const canRestore = permissions.has(SYSTEM_PERMISSIONS.RECYCLE_BIN_RESTORE);

      // ============ Handlers ============
      const handleRestore = (entityType: string, id: string) =>
            restoreMutation.mutate({ entityType, id });

      const handleBulkRestore = (ids: string[]) => {
            // Map selected IDs to items with entityType from currentItems
            const items = ids
                  .map(id => {
                        const item = currentItems.find(ci => ci.id === id);
                        return item ? { entityType: item.entityType.toLowerCase(), id: item.id } : null;
                  })
                  .filter((i): i is { entityType: string; id: string } => i !== null);
            if (items.length > 0) {
                  bulkRestoreMutation.mutate(items);
            }
      };

      return {
            // Data
            currentItems,
            isLoading,
            error: error ? (error as Error).message : null,
            totalCount,

            // Tabs
            activeTab,
            setActiveTab,
            tabCounts,

            // Restore
            canRestore,
            isRestoring: restoreMutation.isPending,
            handleRestore,

            // Bulk Restore
            isBulkRestoring: bulkRestoreMutation.isPending,
            handleBulkRestore,

            // i18n
            t,
      };
}
