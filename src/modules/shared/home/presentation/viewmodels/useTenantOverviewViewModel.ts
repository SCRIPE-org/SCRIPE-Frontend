"use client";

import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { identityContainer } from "@modules/admin/identity/di";
import { useOverviewViewModel } from "./useOverviewViewModel";
import { usePresentationMode } from "./usePresentationMode";
import { buildTenantOverviewLiveData } from "./tenantOverviewMapper";

export function useTenantOverviewViewModel() {
  const { t } = useI18n();
  const contextTenantId = useCurrentTenantId();
  const { activeTenantId: adminTenantId, activeTenantName, isImpersonating } = useAdminContext();
  const tenantId = contextTenantId || adminTenantId;
  const { isPresentationMode, togglePresentationMode } = usePresentationMode();

  const overviewVm = useOverviewViewModel(true);

  // Fetch Tenant Stats from Identity API
  const statsQuery = useQuery({
    queryKey: ["tenant", "overview-stats", tenantId],
    queryFn: () => identityContainer.tenantRepository.getStats(tenantId!),
    enabled: !!tenantId,
    staleTime: 60 * 1000,
    retry: 1,
  });

  // Fetch Tenant Profile Details
  const detailsQuery = useQuery({
    queryKey: ["tenant", "overview-details", tenantId],
    queryFn: () => identityContainer.tenantRepository.getById(tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const refetchAll = useCallback(() => {
    overviewVm.refetchAll();
    if (tenantId) {
      statsQuery.refetch();
      detailsQuery.refetch();
    }
  }, [overviewVm, tenantId, statsQuery, detailsQuery]);

  const summaryData = overviewVm.summary.data;
  const statsData = statsQuery.data;
  const detailsData = detailsQuery.data;
  const recentActivityData = overviewVm.recentActivity.data;
  const liveData = useMemo(() => {
    return buildTenantOverviewLiveData({
      summary: summaryData,
      stats: statsData,
      details: detailsData,
      recentActivity: recentActivityData,
      activeTenantName,
      t,
    });
  }, [
    activeTenantName,
    detailsData,
    recentActivityData,
    summaryData,
    statsData,
    t,
  ]);

  const effectiveData = isPresentationMode ? TENANT_MOCK_DATA : liveData;

  return {
    data: effectiveData,
    isPresentationMode,
    togglePresentationMode,
    isImpersonating,
    overviewVm,
    refetchAll,
    isRefreshing: overviewVm.summary.isRefetching || statsQuery.isRefetching,
    hasDashboardPermission: overviewVm.hasDashboardPermission,
  };
}
