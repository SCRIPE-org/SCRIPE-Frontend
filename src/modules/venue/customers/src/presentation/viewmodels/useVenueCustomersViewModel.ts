"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { getVenueContainer } from "@modules/venue/di";
import type { CustomerSummary } from "@modules/venue";
import { mapVenueError } from "@modules/venue";

export function useVenueCustomersViewModel() {
  const { t, language, direction } = useI18n();
  const isRtl = language === "ar";
  const searchParams = useSearchParams();
  const partyIdParam = searchParams.get("partyId");

  const { customerRepository } = useMemo(() => getVenueContainer(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Customer Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"Person" | "Organization">("Person");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const customerCreateIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);

  const fetchCustomers = useCallback(
    async (query = "") => {
      setLoading(true);
      setError(null);
      try {
        const results = await customerRepository.search(query);
        setCustomers(results);

        if (partyIdParam && !selectedCustomer) {
          const match = results.find((c) => c.id === partyIdParam);
          if (match) {
            setSelectedCustomer(match);
          } else {
            try {
              const direct = await customerRepository.getById(partyIdParam);
              setSelectedCustomer(direct);
            } catch {
              // Ignore direct fetch failure
            }
          }
        }
      } catch (err) {
        setError(mapVenueError(err, language).message);
      } finally {
        setLoading(false);
      }
    },
    [customerRepository, language, partyIdParam, selectedCustomer]
  );

  useEffect(() => {
    void fetchCustomers("");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchCustomers(searchQuery);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    void fetchCustomers("");
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const displayName = newName.trim();
      const fingerprint = JSON.stringify([displayName, newType]);
      if (customerCreateIntentRef.current?.fingerprint !== fingerprint) {
        customerCreateIntentRef.current = { fingerprint, key: crypto.randomUUID() };
      }
      const created = await customerRepository.create(displayName, newType, undefined, {
        idempotencyKey: customerCreateIntentRef.current.key,
      });
      customerCreateIntentRef.current = null;
      setCreateOpen(false);
      setNewName("");
      setSelectedCustomer(created);
      await fetchCustomers(searchQuery);
    } catch (err) {
      setCreateError(mapVenueError(err, language).message);
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    t,
    language,
    direction,
    isRtl,
    searchQuery,
    setSearchQuery,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    loading,
    error,
    createOpen,
    setCreateOpen,
    newName,
    setNewName,
    newType,
    setNewType,
    createLoading,
    createError,
    handleSearch,
    handleResetSearch,
    handleCreateCustomer,
  };
}
