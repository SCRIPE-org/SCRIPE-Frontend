"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmAccount360,
  UpdateAccountInput,
} from "../../domain/models/crm-account.types";

/**
 * State snapshot for CRM account 360-degree detailed profile.
 */
export interface AccountDetailState {
  stage: "idle" | "loading" | "success" | "failed";
  account: CrmAccount360 | null;
  error: string | null;
}

/**
 * Presentation ViewModel hook for loading and editing a single Account 360 profile.
 * Fetches connected contacts, active deals, and financial information.
 *
 * @param accountId - Encrypted or raw account ID string.
 * @returns State, update handler, and edit dialog controls.
 */
export function useAccountDetailViewModel(accountId: string) {
  const [state, setState] = useState<AccountDetailState>({
    stage: "loading",
    account: null,
    error: null,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const loadAccount = useCallback(async () => {
    if (!accountId) return;
    setState((prev) => ({ ...prev, stage: "loading", error: null }));
    try {
      const container = getCrmContainer();
      const result = await container.accountRepository.getAccountById(accountId);

      startTransition(() => {
        setState({
          stage: "success",
          account: result,
          error: null,
        });
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load account 360 profile";
      startTransition(() => {
        setState({
          stage: "failed",
          account: null,
          error: message,
        });
      });
    }
  }, [accountId]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleUpdateAccount = useCallback(
    async (input: Omit<UpdateAccountInput, "id">): Promise<boolean> => {
      if (!state.account) return false;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        await container.accountRepository.updateAccount({
          id: accountId,
          ...input,
          rowVersion: state.account.rowVersion,
        });
        setIsEditOpen(false);
        await loadAccount();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update account details";
        setSubmitError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [accountId, state.account, loadAccount]
  );

  return {
    state,
    isEditOpen,
    isSubmitting,
    submitError,
    setIsEditOpen,
    handleUpdateAccount,
    refresh: loadAccount,
  };
}
