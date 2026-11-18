"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCrmContainer } from "@modules/crm/di";
import type { SalesActivityKind } from "../../domain/entities/CrmActivityEntity";
import type { ExecutionDeskAccountSummary } from "../utils/activitiesExecutionDeskHelpers";
import {
  type ActivityDueBucket,
  fetchExecutionDeskAccounts,
  resolveContactActivityFilter,
} from "../utils/activitiesFilteringHelpers";

/** Manages account/contact URL scoping, filters, and account directory loading for Activities Execution Desk. */
export function useActivitiesDeskFiltersState(isRtl: boolean) {
  const searchParams = useSearchParams();
  const urlAccountParam = searchParams?.get("account") || "";
  const urlContactParam = searchParams?.get("contact") || "";
  const urlCreateParam = searchParams?.get("create") === "1";

  const [accounts, setAccounts] = useState<ExecutionDeskAccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(urlAccountParam || "all");
  const [contactFilterId, setContactFilterId] = useState<string | null>(urlContactParam || null);
  const [contactResolvedIds, setContactResolvedIds] = useState<string[]>(
    urlContactParam ? [urlContactParam] : []
  );
  const [contactDisplayName, setContactDisplayName] = useState<string | null>(null);
  const [dueFilter, setDueFilter] = useState<ActivityDueBucket>("all");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [search, setSearch] = useState<string>("");
  const [activityKindFilter, setActivityKindFilter] = useState<SalesActivityKind | "ALL">("ALL");

  const [prevUrlKey, setPrevUrlKey] = useState(`${urlAccountParam}:${urlContactParam}`);
  const currentUrlKey = `${urlAccountParam}:${urlContactParam}`;
  if (currentUrlKey !== prevUrlKey) {
    setPrevUrlKey(currentUrlKey);
    if (urlAccountParam) setSelectedAccountId(urlAccountParam);
    if (urlContactParam) {
      setContactFilterId(urlContactParam);
      setContactResolvedIds([urlContactParam]);
    }
  }

  useEffect(() => {
    let active = true;
    setIsLoadingAccounts(true);
    void fetchExecutionDeskAccounts(
      getCrmContainer().accountRepository?.getAccounts.bind(getCrmContainer().accountRepository)
    )
      .then((mapped) => {
        if (active && mapped.length > 0) setAccounts(mapped);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoadingAccounts(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!contactFilterId) return;
    let active = true;
    const container = getCrmContainer();
    void resolveContactActivityFilter(
      container.contactRepository?.getContactById.bind(container.contactRepository),
      contactFilterId,
      isRtl
    ).then((info) => {
      if (!active) return;
      setContactResolvedIds(info.ids);
      setContactDisplayName(info.displayName);
      if (!urlAccountParam && info.primaryAccountId) {
        setSelectedAccountId(info.primaryAccountId);
      }
    });
    return () => {
      active = false;
    };
  }, [contactFilterId, isRtl, urlAccountParam]);

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

  const clearContactFilter = useCallback(() => {
    setContactFilterId(null);
    setContactResolvedIds([]);
    setContactDisplayName(null);
  }, []);

  return {
    urlCreateParam,
    accounts,
    accountsMap,
    selectedAccountId,
    setSelectedAccountId,
    selectedAccountName,
    contactFilterId,
    contactResolvedIds,
    contactDisplayName,
    clearContactFilter,
    dueFilter,
    setDueFilter,
    isLoadingAccounts,
    search,
    setSearch,
    activityKindFilter,
    setActivityKindFilter,
  };
}
