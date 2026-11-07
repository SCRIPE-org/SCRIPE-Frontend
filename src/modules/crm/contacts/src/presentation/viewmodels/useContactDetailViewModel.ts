"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmContactContext,
  UpdateContactInput,
} from "../../domain/models/crm-contact.types";

/**
 * State contract for the single contact detail and stakeholder view.
 */
export interface ContactDetailState {
  stage: "idle" | "loading" | "success" | "failed";
  contact: CrmContactContext | null;
  error: string | null;
}

/**
 * ViewModel hook orchestrating single contact context retrieval and stakeholder updates.
 * @param contactId - Unique contact identifier.
 * @returns State and mutation methods for the contact detail view.
 */
export function useContactDetailViewModel(contactId: string) {
  const [state, setState] = useState<ContactDetailState>({
    stage: "loading",
    contact: null,
    error: null,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [accountOptions, setAccountOptions] = useState<
    Array<{ id: string; displayName: string }>
  >([]);
  const [, startTransition] = useTransition();

  const loadContact = useCallback(async () => {
    if (!contactId) return;
    setState((prev) => ({ ...prev, stage: "loading", error: null }));
    try {
      const container = getCrmContainer();
      const [result, accountsRes] = await Promise.all([
        container.contactRepository.getContactById(contactId),
        container.accountRepository
          .getAccounts({ page: 1, pageSize: 50 })
          .catch(() => ({ items: [] })),
      ]);

      startTransition(() => {
        setState({
          stage: "success",
          contact: result,
          error: null,
        });
        setAccountOptions(
          (accountsRes?.items || []).map((a) => ({
            id: a.id,
            displayName:
              a.partyLegalNameEn ||
              a.partyLegalNameAr ||
              "Commercial Account",
          }))
        );
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load contact context";
      startTransition(() => {
        setState({
          stage: "failed",
          contact: null,
          error: message,
        });
      });
    }
  }, [contactId]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const handleUpdateContact = useCallback(
    async (input: Omit<UpdateContactInput, "id">): Promise<boolean> => {
      if (!state.contact) return false;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        await container.contactRepository.updateContact({
          id: contactId,
          ...input,
          rowVersion: state.contact.rowVersion,
        });
        setIsEditOpen(false);
        await loadContact();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update contact details";
        setSubmitError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [contactId, state.contact, loadContact]
  );

  return {
    state,
    isEditOpen,
    isSubmitting,
    submitError,
    accountOptions,
    setIsEditOpen,
    handleUpdateContact,
    refresh: loadContact,
  };
}
