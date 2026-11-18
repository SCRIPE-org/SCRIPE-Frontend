"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
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

export type { ExecutionDeskAccountSummary, ActivitiesState, ActivityDueBucket };

export function useActivitiesExecutionDeskViewModel(currentLanguage: string) {
  const isRtl = currentLanguage === "ar";
  const filters = useActivitiesDeskFiltersState(isRtl);
  const {
    urlCreateParam, accounts, selectedAccountId, isLoadingAccounts,
    search, activityKindFilter, dueFilter, contactResolvedIds,
  } = filters;

  const [completedActivityIds, setCompletedActivityIds] = useState<Record<string, boolean>>({});
  const [activitiesState, setActivitiesState] = useState<ActivitiesState>({
    stage: "loading", items: [], totalCount: 0, page: 1, pageSize: 20, error: null,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(urlCreateParam);
  const didAutoOpenCreateRef = useRef(urlCreateParam);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [selectedActivityForFollowUp, setSelectedActivityForFollowUp] = useState<CrmActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewItem, setViewItem] = useState<CrmActivity | null>(null);
  const [, startTransition] = useTransition();

  const [prevCreateParam, setPrevCreateParam] = useState(urlCreateParam);
  if (urlCreateParam !== prevCreateParam) {
    setPrevCreateParam(urlCreateParam);
    if (urlCreateParam && !didAutoOpenCreateRef.current) {
      didAutoOpenCreateRef.current = true;
      setIsCreateOpen(true);
    }
  }

  const loadActivities = useCallback(
    async (pageToLoad = 1, accId = selectedAccountId, kind = activityKindFilter, searchTerm = search, sizeToLoad = 20) => {
      setActivitiesState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const container = getCrmContainer();
        if (!container.activityRepository) throw new Error("Activities repository not configured");
        const activeKind = kind !== "ALL" ? kind : undefined;
        const res =
          accId === "all"
            ? await fetchAggregatedActivities(container.activityRepository, accounts, activeKind, searchTerm, pageToLoad, sizeToLoad)
            : await fetchScopedAccountActivities(
                container.activityRepository.getActivities.bind(container.activityRepository),
                accId, activeKind, searchTerm, pageToLoad, sizeToLoad
              );
        startTransition(() => {
          setActivitiesState({
            stage: "success",
            items: res.items,
            totalCount: res.totalCount,
            page: "page" in res && typeof res.page === "number" ? res.page : pageToLoad,
            pageSize: "pageSize" in res && typeof res.pageSize === "number" ? res.pageSize : sizeToLoad,
            error: null,
          });
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load CRM activities";
        startTransition(() => {
          setActivitiesState((prev) => ({ ...prev, stage: "failed", error: msg }));
        });
      }
    },
    [selectedAccountId, activityKindFilter, search, accounts]
  );

  useEffect(() => {
    if (!isLoadingAccounts) loadActivities(1, selectedAccountId, activityKindFilter, search);
  }, [selectedAccountId, activityKindFilter, search, isLoadingAccounts, loadActivities]);

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
        await loadActivities(1, selectedAccountId, activityKindFilter, search);
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to log activity");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedAccountId, accounts, activityKindFilter, search, loadActivities]
  );

  const handleCreateFollowUp = useCallback(
    async (activityId: string, data: { title: string; description?: string; assigneeUserId: string; dueAtUtc?: string }): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await executeCreateDeskFollowUp(getCrmContainer().activityRepository, activityId, data);
        setIsFollowUpOpen(false);
        setSelectedActivityForFollowUp(null);
        await loadActivities(activitiesState.page, selectedAccountId, activityKindFilter, search);
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to schedule follow-up");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [activitiesState.page, selectedAccountId, activityKindFilter, search, loadActivities]
  );

  const filteredItems = useMemo(
    () => filterActivitiesByDueAndContact(activitiesState.items, dueFilter, contactResolvedIds, completedActivityIds),
    [activitiesState.items, dueFilter, contactResolvedIds, completedActivityIds]
  );

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
      setSelectedActivityForFollowUp(filteredItems[0] || activitiesState.items[0] || null);
      setIsFollowUpOpen(true);
    },
    isSubmitting, submitError, handleCreateActivity, handleCreateFollowUp,
    refresh: () => loadActivities(activitiesState.page, selectedAccountId, activityKindFilter, search),
    items: filteredItems, loading: activitiesState.stage === "loading",
    pagination: buildActivitiesPagination(
      activitiesState.page, activitiesState.pageSize, activitiesState.totalCount,
      (p) => loadActivities(p, selectedAccountId, activityKindFilter, search),
      (s) => loadActivities(1, selectedAccountId, activityKindFilter, search, s)
    ),
    searchValue: search, selectedItems, setSelectedItems, viewItem, setViewItem,
  };
}
