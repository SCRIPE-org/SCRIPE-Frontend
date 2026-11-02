"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmContact,
  CreateContactInput,
} from "../../domain/models/crm-contact.types";

export interface ContactsState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmContact[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

export function useContactsViewModel(initialSearch?: string, initialAccountId?: string) {
  const [state, setState] = useState<ContactsState>({
    stage: "loading",
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    error: null,
  });

  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [accountId, setAccountId] = useState<string | undefined>(initialAccountId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSetIsCreateOpen = useCallback((open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setSubmitError(null);
    }
  }, []);

  const loadContacts = useCallback(
    async (pageToLoad = 1, searchQuery?: string, accId?: string) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const container = getCrmContainer();
        const result = await container.contactRepository.getContacts({
          page: pageToLoad,
          pageSize: 20,
          search: searchQuery,
          accountId: accId,
        });

        startTransition(() => {
          setState({
            stage: "success",
            items: result.items ?? [],
            totalCount: result.totalCount ?? 0,
            page: result.page ?? pageToLoad,
            pageSize: result.pageSize ?? 20,
            error: null,
          });
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load commercial contacts";
        startTransition(() => {
          setState((prev) => ({
            ...prev,
            stage: "failed",
            error: message,
          }));
        });
      }
    },
    []
  );

  useEffect(() => {
    loadContacts(1, search, accountId);
  }, [loadContacts, search, accountId]);

  const handleSearchChange = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const handleAccountFilterChange = useCallback((accId: string | undefined) => {
    setAccountId(accId);
  }, []);

  const handleCreateContact = useCallback(
    async (input: CreateContactInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        await container.contactRepository.createContact(input);
        setIsCreateOpen(false);
        await loadContacts(1, search, accountId);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create commercial contact";
        setSubmitError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadContacts, search, accountId]
  );

  const refresh = useCallback(() => {
    return loadContacts(state.page, search, accountId);
  }, [loadContacts, state.page, search, accountId]);

  return {
    state,
    search,
    accountId,
    isCreateOpen,
    isSubmitting,
    submitError,
    setIsCreateOpen: handleSetIsCreateOpen,
    handleSearchChange,
    handleAccountFilterChange,
    handleCreateContact,
    refresh,
  };
}
