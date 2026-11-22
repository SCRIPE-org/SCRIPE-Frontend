"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { CustomerSummary } from "@modules/venue";
import type { getVenueContainer } from "@modules/venue/di";
import { getIntentKey } from "./clickToBookIntents";

interface UseClickToBookCustomerProps {
  open: boolean;
  customerRepository: ReturnType<typeof getVenueContainer>["customerRepository"];
  tRef: MutableRefObject<(key: string, params?: Record<string, string | number>) => string>;
  onCustomerCreated: (customer: CustomerSummary) => void;
  setSubmitting: (value: boolean) => void;
}

/**
 * Sub-hook managing customer search debounce, quick-add creation, and duplicate checks.
 */
export function useClickToBookCustomer({
  open,
  customerRepository,
  tRef,
  onCustomerCreated,
  setSubmitting,
}: UseClickToBookCustomerProps) {
  const [customerSearch, setCustomerSearchState] = useState("");
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState(false);
  const [customerResults, setCustomerResults] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickAddError, setQuickAddError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const quickAddIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const searchRequestIdRef = useRef(0);

  const setCustomerSearch = useCallback((value: string) => {
    setCustomerSearchState(value);
    if (value.trim().length < 2) {
      searchRequestIdRef.current++;
      setCustomerResults([]);
      setCustomerSearchError(false);
      setCustomerSearching(false);
    }
  }, []);

  // Race-safe debounced customer search
  useEffect(() => {
    const trimmed = customerSearch.trim();
    if (!open || !trimmed || trimmed.length < 2) {
      searchRequestIdRef.current++;
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    const timer = setTimeout(async () => {
      setCustomerSearching(true);
      setCustomerSearchError(false);
      try {
        const results = await customerRepository.search(trimmed);
        if (searchRequestIdRef.current === requestId) {
          setCustomerResults(results);
        }
      } catch {
        if (searchRequestIdRef.current === requestId) {
          setCustomerSearchError(true);
        }
      } finally {
        if (searchRequestIdRef.current === requestId) {
          setCustomerSearching(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [customerRepository, customerSearch, open]);

  const resetCustomerState = useCallback(
    (initialCustomer: CustomerSummary | null, initialCustomerId?: string | null) => {
      setCustomerSearchState("");
      setCustomerSearching(false);
      setCustomerSearchError(false);
      setCustomerResults([]);
      setSelectedCustomer(initialCustomer);
      if (!initialCustomer && initialCustomerId) {
        customerRepository
          .getById(initialCustomerId)
          .then((customer) => {
            setSelectedCustomer(customer);
          })
          .catch(() => {});
      }
      setQuickAddOpen(false);
      setQuickName("");
      setQuickPhone("");
      setQuickEmail("");
      setQuickAddError(null);
      setDuplicateWarning(null);
    },
    [customerRepository],
  );

  const handleQuickAddCustomer = async () => {
    const trimmedName = quickName.trim();
    if (!trimmedName) {
      setQuickAddError(tRef.current("operationsCalendar.clickToBook.customer.nameRequired"));
      return;
    }

    const duplicate = customerResults.find(
      (c) =>
        c.displayName.toLowerCase() === trimmedName.toLowerCase() ||
        (quickPhone && (c.phone === quickPhone || c.phone?.includes(quickPhone))),
    );
    if (duplicate && !duplicateWarning) {
      setDuplicateWarning(
        tRef.current("operationsCalendar.clickToBook.customer.duplicateWarningWithName", {
          name: duplicate.displayName,
        }),
      );
      return;
    }

    setQuickAddError(null);
    setSubmitting(true);
    try {
      const fingerprint = JSON.stringify([
        trimmedName,
        "Person",
        quickPhone.trim() || null,
        quickEmail.trim() || null,
      ]);
      const idempotencyKey = getIntentKey(quickAddIntentRef, fingerprint);
      const created = await customerRepository.create(
        trimmedName,
        "Person",
        quickPhone.trim() || undefined,
        {
          idempotencyKey,
          email: quickEmail.trim() || undefined,
        },
      );
      setSelectedCustomer(created);
      setQuickAddOpen(false);
      setQuickName("");
      setQuickPhone("");
      setQuickEmail("");
      setDuplicateWarning(null);
      onCustomerCreated(created);
    } catch (err) {
      setQuickAddError(
        err instanceof Error
          ? err.message
          : tRef.current("operationsCalendar.clickToBook.customer.createFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    customerSearch,
    setCustomerSearch,
    customerSearching,
    customerSearchError,
    customerResults,
    selectedCustomer,
    setSelectedCustomer,
    quickAddOpen,
    setQuickAddOpen,
    quickName,
    setQuickName,
    quickPhone,
    setQuickPhone,
    quickEmail,
    setQuickEmail,
    quickAddError,
    duplicateWarning,
    resetCustomerState,
    handleQuickAddCustomer,
  };
}
