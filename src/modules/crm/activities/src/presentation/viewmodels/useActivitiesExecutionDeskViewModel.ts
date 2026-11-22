"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type { CrmActivity, SalesActivityKind } from "../../domain/entities/CrmActivityEntity";
import {
  type ExecutionDeskAccountSummary,
  type ActivitiesState,
  fetchAggregatedActivities,
  executeCreateDeskActivity,
  executeCreateDeskFollowUp,
} from "../utils/activitiesExecutionDeskHelpers";
import {
  type ActivityDueBucket,
  filterActivitiesByDueAndContact,
  fetchScopedAccountActivities,
  buildActivitiesPagination,
} from "../utils/activitiesFilteringHelpers";
import { useActivitiesDeskFiltersState } from "./useActivitiesDeskFiltersState";

/** Re-exported Execution Desk account summary, state, and due-bucket filter types. */
export type { ExecutionDeskAccountSummary, ActivitiesState, ActivityDueBucket };

/** ViewModel hook for CRM Activities Execution Desk powered by TanStack Query v5. */
export function useActivitiesExecutionDeskViewModel(currentLanguage: string) {
  const isRtl = currentLanguage === "ar";
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const filters = useActivitiesDeskFiltersState(isRtl);
  const {
    urlCreateParam, accounts, selectedAccountId, isLoadingAccounts,
    search, activityKindFilter, dueFilter, contactResolvedIds,
  } = filters;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [completedActivityIds, setCompletedActivityIds] = useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(urlCreateParam);
  const didAutoOpenCreateRef = useRef(urlCreateParam);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [selectedActivityForFollowUp, setSelectedActivityForFollowUp] = useState<CrmActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewItem, setViewItem] = useState<CrmActivity | null>(null);

  useEffect(() => {
    if (urlCreateParam && !didAutoOpenCreateRef.current) {
      didAutoOpenCreateRef.current = true;
      setIsCreateOpen(true);
    }
  }, [urlCreateParam]);

  const activeKind = activityKindFilter !== "ALL" ? activityKindFilter : undefined;
  const activitiesQuery = useQuery<{ items: CrmActivity[]; totalCount: number; page?: number; pageSize?: number }>(
    {
      queryKey: qk.crm.activities(tenantId, {
        desk: true,
        selectedAccountId,
        activeKind,
        search: search.trim() || undefined,
        page,
        pageSize,
        accountsCount: accounts.length,
      }),
      queryFn: async () => {
        const repo = getCrmContainer().activityRepository;
        if (!repo) throw new Error("Activities repository not configured");
        return selectedAccountId === "all"
          ? fetchAggregatedActivities(repo, accounts, activeKind, search, page, pageSize)
          : fetchScopedAccountActivities(repo.getActivities.bind(repo), selectedAccountId, activeKind, search, page, pageSize);
      },
      enabled: !isLoadingAccounts,
      staleTime: 20_000,
    },
    safeQueryClient
  );

  const itemsRaw = activitiesQuery.data?.items ?? [];
  const totalCount = activitiesQuery.data?.totalCount ?? 0;
  const currentPage = activitiesQuery.data?.page ?? page;
  const currentSize = activitiesQuery.data?.pageSize ?? pageSize;
  const errorMsg = activitiesQuery.error instanceof Error ? activitiesQuery.error.message : null;
  const activitiesState: ActivitiesState = {
    stage: isLoadingAccounts || activitiesQuery.isLoading ? "loading" : activitiesQuery.isError ? "failed" : "success",
    items: itemsRaw,
    totalCount,
    page: currentPage,
    pageSize: currentSize,
    error: errorMsg,
  };

  const invalidateDesk = useCallback(
    () => safeQueryClient.invalidateQueries({ queryKey: qk.crm.activities(tenantId) }),
    [safeQueryClient, tenantId]
  );

  const handleCreateActivity = useCallback(
    async (data: {
      activityKind: SalesActivityKind; summary: string; bodyText?: string;
      containsPii?: boolean; occurredAtUtc?: string; accountId?: string;
    }): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await executeCreateDeskActivity(getCrmContainer().activityRepository, selectedAccountId, accounts, data);
        setIsCreateOpen(false);
        setPage(1);
        await invalidateDesk();
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to log activity");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedAccountId, accounts, invalidateDesk]
  );

  const handleCreateFollowUp = useCallback(
    async (activityId: string, data: { title: string; description?: string; assigneeUserId: string; dueAtUtc?: string }): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await executeCreateDeskFollowUp(getCrmContainer().activityRepository, activityId, data);
        setIsFollowUpOpen(false);
        setSelectedActivityForFollowUp(null);
        await invalidateDesk();
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to schedule follow-up");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [invalidateDesk]
  );

  const filteredItems = filterActivitiesByDueAndContact(itemsRaw, dueFilter, contactResolvedIds, completedActivityIds);

  const handleCompleteActivity = useCallback(async (activity: CrmActivity) => {
    setCompletedActivityIds((prev) => ({ ...prev, [activity.activityId]: true }));
    if (!activity.workItemRefId) return;
    try {
      await getCrmContainer().activityRepository?.completeFollowUpWorkItem?.(activity.workItemRefId);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to complete follow-up");
    }
  }, []);

  return {
    accounts: filters.accounts, accountsMap: filters.accountsMap,
    selectedAccountId: filters.selectedAccountId, selectedAccountName: filters.selectedAccountName,
    isLoadingAccounts, selectAccountId: filters.setSelectedAccountId, activitiesState, search, activityKindFilter,
    dueFilter, handleDueFilterChange: filters.setDueFilter,
    contactFilterId: filters.contactFilterId, contactDisplayName: filters.contactDisplayName,
    clearContactFilter: filters.clearContactFilter, completedActivityIds, handleCompleteActivity,
    handleSearchChange: filters.setSearch, handleActivityKindFilterChange: filters.setActivityKindFilter,
    isCreateOpen, setIsCreateOpen, isFollowUpOpen, setIsFollowUpOpen,
    selectedActivityForFollowUp,
    closeFollowUpModal: () => { setIsFollowUpOpen(false); setSelectedActivityForFollowUp(null); },
    openFollowUpForActivity: (act: CrmActivity) => { setSelectedActivityForFollowUp(act); setIsFollowUpOpen(true); },
    openHeaderFollowUp: () => {
      setSelectedActivityForFollowUp(filteredItems[0] || itemsRaw[0] || null);
      setIsFollowUpOpen(true);
    },
    isSubmitting, submitError, handleCreateActivity, handleCreateFollowUp,
    refresh: () => activitiesQuery.refetch().then(() => undefined),
    items: filteredItems, loading: activitiesState.stage === "loading",
    pagination: buildActivitiesPagination(
      currentPage, currentSize, totalCount,
      (p) => setPage(p),
      (s) => { setPageSize(s); setPage(1); }
    ),
    searchValue: search, selectedItems, setSelectedItems, viewItem, setViewItem,
  };
}
