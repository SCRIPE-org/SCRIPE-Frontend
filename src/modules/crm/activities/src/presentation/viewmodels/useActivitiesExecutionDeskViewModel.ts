"use client";

import { useState, useEffect, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";

export interface ExecutionDeskAccountSummary {
  readonly id: string;
  readonly nameEn: string;
  readonly nameAr?: string | null;
  readonly commercialTierCode?: string | null;
  readonly preferredCurrencyCode?: string | null;
}

export function useActivitiesExecutionDeskViewModel(currentLanguage: string) {
  const [accounts, setAccounts] = useState<ExecutionDeskAccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const container = getCrmContainer();
      if (!container.accountRepository) {
        return;
      }
      const res = await container.accountRepository.getAccounts({ page: 1, pageSize: 20 });
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
        setSelectedAccountName(
          currentLanguage === "ar" && mapped[0].nameAr
            ? mapped[0].nameAr
            : mapped[0].nameEn
        );
      }
    } catch {
      // Fallback gracefully
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const selectAccount = useCallback(
    (account: ExecutionDeskAccountSummary) => {
      setSelectedAccountId(account.id);
      setSelectedAccountName(
        currentLanguage === "ar" && account.nameAr
          ? account.nameAr
          : account.nameEn
      );
    },
    [currentLanguage]
  );

  return {
    accounts,
    selectedAccountId,
    selectedAccountName,
    isLoadingAccounts,
    selectAccount,
    refreshAccounts: fetchAccounts,
  };
}
