"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type { CrmAccount360, UpdateAccountInput } from "../../domain/models/crm-account.types";

/** State snapshot for CRM account 360-degree detailed profile. */
export interface AccountDetailState {
  stage: "idle" | "loading" | "success" | "failed";
  account: CrmAccount360 | null;
  error: string | null;
}

/**
 * Presentation ViewModel hook for loading and editing a single Account 360 profile
 * powered by TanStack Query v5.
 */
export function useAccountDetailViewModel(accountId: string) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const detailQuery = useQuery<CrmAccount360>(
    {
      queryKey: qk.crm.accountDetail(tenantId, accountId),
      queryFn: () => getCrmContainer().accountRepository.getAccountById(accountId),
      enabled: Boolean(accountId),
      staleTime: 30_000,
    },
    safeQueryClient
  );

  const currentAccount = detailQuery.data ?? null;
  const errorMsg = detailQuery.error instanceof Error ? detailQuery.error.message : null;
  const state: AccountDetailState = {
    stage: detailQuery.isLoading ? "loading" : detailQuery.isError ? "failed" : "success",
    account: currentAccount,
    error: errorMsg,
  };

  const handleUpdateAccount = useCallback(
    async (input: Omit<UpdateAccountInput, "id">): Promise<boolean> => {
      if (!currentAccount) return false;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await getCrmContainer().accountRepository.updateAccount({
          id: accountId,
          ...input,
          rowVersion: currentAccount.rowVersion,
        });
        setIsEditOpen(false);
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.accountDetail(tenantId, accountId) });
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.accounts(tenantId) });
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to update account details");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [accountId, currentAccount, safeQueryClient, tenantId]
  );

  return {
    state,
    isEditOpen,
    isSubmitting,
    submitError,
    setIsEditOpen,
    handleUpdateAccount,
    refresh: () => detailQuery.refetch().then(() => undefined),
  };
}
