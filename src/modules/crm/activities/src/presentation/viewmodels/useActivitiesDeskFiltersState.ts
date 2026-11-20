"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type { SalesActivityKind } from "../../domain/entities/CrmActivityEntity";
import type { ExecutionDeskAccountSummary } from "../utils/activitiesExecutionDeskHelpers";
import {
  type ActivityDueBucket,
  fetchExecutionDeskAccounts,
  resolveContactActivityFilter,
} from "../utils/activitiesFilteringHelpers";

/** Manages account/contact URL scoping, filters, and account directory loading for Activities Execution Desk. */
export function useActivitiesDeskFiltersState(isRtl: boolean) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const searchParams = useSearchParams();
  const urlAccountParam = searchParams?.get("account") || "";
  const urlContactParam = searchParams?.get("contact") || "";
  const urlCreateParam = searchParams?.get("create") === "1";

  const [selectedAccountId, setSelectedAccountId] = useState<string>(urlAccountParam || "all");
  const [contactFilterId, setContactFilterId] = useState<string | null>(urlContactParam || null);
  const [dueFilter, setDueFilter] = useState<ActivityDueBucket>("all");
  const [search, setSearch] = useState<string>("");
  const [activityKindFilter, setActivityKindFilter] = useState<SalesActivityKind | "ALL">("ALL");

  useEffect(() => {
    if (urlAccountParam) setSelectedAccountId(urlAccountParam);
  }, [urlAccountParam]);

  useEffect(() => {
    if (urlContactParam) setContactFilterId(urlContactParam);
  }, [urlContactParam]);

  const accountsQuery = useQuery<ExecutionDeskAccountSummary[]>(
    {
      queryKey: qk.crm.accounts(tenantId, { page: 1, pageSize: 50, desk: true }),
      queryFn: () =>
        fetchExecutionDeskAccounts(
          getCrmContainer().accountRepository?.getAccounts.bind(getCrmContainer().accountRepository)
        ),
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const contactScopeQuery = useQuery<{ ids: string[]; displayName: string | null; primaryAccountId: string | null }>(
    {
      queryKey: [...qk.crm.contactDetail(tenantId, contactFilterId || ""), "activityFilter", isRtl ? "ar" : "en"],
      queryFn: () =>
        resolveContactActivityFilter(
          getCrmContainer().contactRepository?.getContactById.bind(getCrmContainer().contactRepository),
          contactFilterId!,
          isRtl
        ),
      enabled: Boolean(contactFilterId),
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const contactScopeData = contactScopeQuery.data;
  useEffect(() => {
    if (!urlAccountParam && contactScopeData?.primaryAccountId) {
      setSelectedAccountId(contactScopeData.primaryAccountId);
    }
  }, [urlAccountParam, contactScopeData]);

  const accounts = accountsQuery.data ?? [];
  const accountsMap = new Map<string, ExecutionDeskAccountSummary>();
  accounts.forEach((acc) => accountsMap.set(acc.id, acc));

  const selectedAcc = selectedAccountId === "all" ? undefined : accountsMap.get(selectedAccountId);
  const selectedAccountName = selectedAcc ? (isRtl && selectedAcc.nameAr ? selectedAcc.nameAr : selectedAcc.nameEn) : "";

  const clearContactFilter = useCallback(() => {
    setContactFilterId(null);
  }, []);

  const contactResolvedIds = contactFilterId
    ? (contactScopeData?.ids ?? [contactFilterId])
    : [];

  return {
    urlCreateParam,
    accounts,
    accountsMap,
    selectedAccountId,
    setSelectedAccountId,
    selectedAccountName,
    contactFilterId,
    contactResolvedIds,
    contactDisplayName: contactFilterId ? (contactScopeData?.displayName ?? null) : null,
    clearContactFilter,
    dueFilter,
    setDueFilter,
    isLoadingAccounts: accountsQuery.isLoading,
    search,
    setSearch,
    activityKindFilter,
    setActivityKindFilter,
  };
}
