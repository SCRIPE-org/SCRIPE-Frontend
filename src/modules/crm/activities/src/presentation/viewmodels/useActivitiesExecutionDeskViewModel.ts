"use client";

import { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type { CrmActivity, SalesActivityKind } from "../../domain/entities/CrmActivityEntity";
import {
  type ExecutionDeskAccountSummary,
  type ActivitiesState,
  fetchAggregatedActivities,
} from "../utils/activitiesExecutionDeskHelpers";

export type { ExecutionDeskAccountSummary, ActivitiesState };

export function useActivitiesExecutionDeskViewModel(currentLanguage: string) {
  const isRtl = currentLanguage === "ar";
  const [accounts, setAccounts] = useState<ExecutionDeskAccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [activitiesState, setActivitiesState] = useState<ActivitiesState>({
    stage: "loading",
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    error: null,
  });

  const [search, setSearch] = useState<string>("");
  const [activityKindFilter, setActivityKindFilter] = useState<SalesActivityKind | "ALL">("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [selectedActivityForFollowUp, setSelectedActivityForFollowUp] = useState<CrmActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewItem, setViewItem] = useState<CrmActivity | null>(null);
  const [, startTransition] = useTransition();

  const accountsMap = useMemo(() => {
    const map = new Map<string, ExecutionDeskAccountSummary>();
    accounts.forEach((acc) => map.set(acc.id, acc));
    return map;
  }, [accounts]);

  const selectedAccountName = useMemo(() => {
    if (selectedAccountId === "all") return "";
    const acc = accountsMap.get(selectedAccountId);
    return acc ? (isRtl && acc.nameAr ? acc.nameAr : acc.nameEn) : "";
  }, [selectedAccountId, accountsMap, isRtl]);

  const loadActivities = useCallback(
    async (
      pageToLoad = 1,
      accId = selectedAccountId,
      kind = activityKindFilter,
      searchTerm = search,
      sizeToLoad = 20
    ) => {
      setActivitiesState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const container = getCrmContainer();
        if (!container.activityRepository) throw new Error("Activities repository not configured");
        const activeKind = kind !== "ALL" ? kind : undefined;

        if (accId === "all") {
          const res = await fetchAggregatedActivities(
            container.activityRepository,
            accounts,
            activeKind,
            searchTerm,
            pageToLoad,
            sizeToLoad
          );
          startTransition(() => {
            setActivitiesState({
              stage: "success",
              items: res.items,
              totalCount: res.totalCount,
              page: pageToLoad,
              pageSize: sizeToLoad,
              error: null,
            });
          });
        } else {
          const res = await container.activityRepository.getActivities({
            accountId: accId,
            activityKind: activeKind,
            page: pageToLoad,
            pageSize: sizeToLoad,
          });
          let items = res.items ?? [];
          if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            items = items.filter(
              (a) =>
                a.summary.toLowerCase().includes(term) ||
                (a.bodyText && a.bodyText.toLowerCase().includes(term)) ||
                a.actorDisplaySnapshot.toLowerCase().includes(term)
            );
          }
          startTransition(() => {
            setActivitiesState({
              stage: "success",
              items,
              totalCount: searchTerm.trim() ? items.length : (res.totalCount ?? items.length),
              page: res.page ?? pageToLoad,
              pageSize: res.pageSize ?? sizeToLoad,
              error: null,
            });
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load CRM activities";
        startTransition(() => {
          setActivitiesState((prev) => ({ ...prev, stage: "failed", error: msg }));
        });
      }
    },
    [selectedAccountId, activityKindFilter, search, accounts]
  );

  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const container = getCrmContainer();
      if (!container.accountRepository) return;
      const res = await container.accountRepository.getAccounts({ page: 1, pageSize: 50 });
      if (res.items && res.items.length > 0) {
        const mapped: ExecutionDeskAccountSummary[] = res.items.map((acc) => ({
          id: acc.id,
          nameEn: acc.partyLegalNameEn,
          nameAr: acc.partyLegalNameAr ?? null,
          commercialTierCode: acc.commercialTierCode ?? null,
          preferredCurrencyCode: acc.preferredCurrencyCode ?? null,
        }));
        setAccounts(mapped);
        setSelectedAccountId(mapped[0].id);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (!isLoadingAccounts) {
      loadActivities(1, selectedAccountId, activityKindFilter, search);
    }
  }, [selectedAccountId, activityKindFilter, search, isLoadingAccounts, loadActivities]);

  const handleCreateActivity = useCallback(
    async (data: {
      activityKind: SalesActivityKind;
      summary: string;
      bodyText?: string;
      containsPii?: boolean;
      occurredAtUtc?: string;
      accountId?: string;
    }): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        const targetAccId =
          data.accountId || (selectedAccountId !== "all" ? selectedAccountId : accounts[0]?.id);
        await container.activityRepository.createActivity({
          activityKind: data.activityKind,
          summary: data.summary,
          bodyText: data.bodyText,
          accountId: targetAccId,
          containsPii: data.containsPii ?? false,
          occurredAtUtc: data.occurredAtUtc,
        });
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
    async (
      activityId: string,
      data: {
        title: string;
        description?: string;
        assigneeUserId: string;
        dueAtUtc?: string;
      }
    ): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        await container.activityRepository.createFollowUp(activityId, data);
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

  return {
    accounts,
    accountsMap,
    selectedAccountId,
    selectedAccountName,
    isLoadingAccounts,
    selectAccountId: setSelectedAccountId,
    activitiesState,
    search,
    activityKindFilter,
    handleSearchChange: setSearch,
    handleActivityKindFilterChange: setActivityKindFilter,
    isCreateOpen,
    setIsCreateOpen,
    isFollowUpOpen,
    setIsFollowUpOpen,
    selectedActivityForFollowUp,
    openFollowUpForActivity: (act: CrmActivity) => {
      setSelectedActivityForFollowUp(act);
      setIsFollowUpOpen(true);
    },
    openHeaderFollowUp: () => {
      setSelectedActivityForFollowUp(activitiesState.items[0] || null);
      setIsFollowUpOpen(true);
    },
    isSubmitting,
    submitError,
    handleCreateActivity,
    handleCreateFollowUp,
    refresh: () => loadActivities(activitiesState.page, selectedAccountId, activityKindFilter, search),
    items: activitiesState.items,
    loading: activitiesState.stage === "loading",
    pagination: {
      page: activitiesState.page,
      currentPage: activitiesState.page,
      pageSize: activitiesState.pageSize,
      itemsCount: activitiesState.totalCount,
      pagesCount: Math.max(1, Math.ceil(activitiesState.totalCount / activitiesState.pageSize)),
      totalCount: activitiesState.totalCount,
      totalPages: Math.max(1, Math.ceil(activitiesState.totalCount / activitiesState.pageSize)),
      hasNextPage: activitiesState.page * activitiesState.pageSize < activitiesState.totalCount,
      hasPreviousPage: activitiesState.page > 1,
      onPageChange: (p: number) => loadActivities(p, selectedAccountId, activityKindFilter, search),
      onPageSizeChange: (s: number) =>
        loadActivities(1, selectedAccountId, activityKindFilter, search, s),
    },
    searchValue: search,
    selectedItems,
    setSelectedItems,
    viewItem,
    setViewItem,
  };
}