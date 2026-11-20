"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type { CrmContactContext, UpdateContactInput } from "../../domain/models/crm-contact.types";

/** State contract for the single contact detail and stakeholder view. */
export interface ContactDetailState {
  stage: "idle" | "loading" | "success" | "failed";
  contact: CrmContactContext | null;
  error: string | null;
}

/**
 * ViewModel hook orchestrating single contact context retrieval and stakeholder updates
 * powered by TanStack Query v5.
 */
export function useContactDetailViewModel(contactId: string) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const detailQuery = useQuery<CrmContactContext>(
    {
      queryKey: qk.crm.contactDetail(tenantId, contactId),
      queryFn: () => getCrmContainer().contactRepository.getContactById(contactId),
      enabled: Boolean(contactId),
      staleTime: 30_000,
    },
    safeQueryClient
  );

  const accountsQuery = useQuery<Array<{ id: string; displayName: string }>>(
    {
      queryKey: qk.crm.accounts(tenantId, { page: 1, pageSize: 50, lookup: "contactDetail" }),
      queryFn: async () => {
        const repo = getCrmContainer().accountRepository;
        if (typeof repo?.getAccounts !== "function") return [];
        const res = await repo.getAccounts({ page: 1, pageSize: 50 }).catch(() => null);
        return (res?.items ?? []).map((a) => ({
          id: a.id,
          displayName: a.partyLegalNameEn || a.partyLegalNameAr || "Commercial Account",
        }));
      },
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const currentContact = detailQuery.data ?? null;
  const errorMsg = detailQuery.error instanceof Error ? detailQuery.error.message : null;
  const state: ContactDetailState = {
    stage: detailQuery.isLoading ? "loading" : detailQuery.isError ? "failed" : "success",
    contact: currentContact,
    error: errorMsg,
  };

  const handleUpdateContact = useCallback(
    async (input: Omit<UpdateContactInput, "id">): Promise<boolean> => {
      if (!currentContact) return false;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await getCrmContainer().contactRepository.updateContact({
          id: contactId,
          ...input,
          rowVersion: currentContact.rowVersion,
        });
        setIsEditOpen(false);
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.contactDetail(tenantId, contactId) });
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.contacts(tenantId) });
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to update contact details");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [contactId, currentContact, safeQueryClient, tenantId]
  );

  return {
    state,
    isEditOpen,
    isSubmitting,
    submitError,
    accountOptions: accountsQuery.data ?? [],
    setIsEditOpen,
    handleUpdateContact,
    refresh: () => detailQuery.refetch().then(() => undefined),
  };
}
