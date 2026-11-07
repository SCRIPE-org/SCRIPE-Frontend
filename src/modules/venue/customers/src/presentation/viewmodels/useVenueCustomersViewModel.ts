"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { getVenueContainer } from "@modules/venue/di";
import type { CustomerSummary } from "@modules/venue";
import type { CustomerReservationSummary } from "@/modules/venue/booking/src/domain/interfaces/IBookingService";
import { mapVenueError } from "@modules/venue";

export function useVenueCustomersViewModel() {
  const { t, language, direction } = useI18n();
  const isRtl = language === "ar";
  const searchParams = useSearchParams();
  const partyIdParam = searchParams.get("partyId");

  const { customerRepository, bookingRepository } = useMemo(() => {
    const c = getVenueContainer();
    return {
      customerRepository: c.customerRepository,
      bookingRepository: c.bookingRepository,
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Customer Booking History state
  const [customerBookings, setCustomerBookings] = useState<CustomerReservationSummary[]>([]);
  const [customerBookingsLoading, setCustomerBookingsLoading] = useState(false);
  const [customerBookingsError, setCustomerBookingsError] = useState<string | null>(null);

  // New Customer Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newType, setNewType] = useState<"Person" | "Organization">("Person");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const customerCreateIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);

  // Debounce search query input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCustomerBookings = useCallback(
    async (partyId: string) => {
      if (!bookingRepository?.getCustomerReservations) {
        setCustomerBookings([]);
        return;
      }
      setCustomerBookingsLoading(true);
      setCustomerBookingsError(null);
      try {
        const res = await bookingRepository.getCustomerReservations(partyId, 1, 50);
        setCustomerBookings(res.items);
      } catch (err) {
        setCustomerBookingsError(mapVenueError(err, language).message);
        setCustomerBookings([]);
      } finally {
        setCustomerBookingsLoading(false);
      }
    },
    [bookingRepository, language]
  );

  const fetchCustomers = useCallback(
    async (query = "", pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        let items: CustomerSummary[] = [];
        let total = 0;
        let totalP = 1;
        let hasPrev = false;
        let hasNext = false;

        if (customerRepository.searchPaged) {
          const res = await customerRepository.searchPaged(query, pageNum, pageSize);
          items = res.items;
          total = res.totalCount;
          totalP = res.totalPages;
          hasPrev = res.hasPreviousPage;
          hasNext = res.hasNextPage;
        } else {
          items = await customerRepository.search(query);
          total = items.length;
          totalP = Math.ceil(total / pageSize) || 1;
          hasPrev = pageNum > 1;
          hasNext = pageNum < totalP;
        }

        setCustomers(items);
        setTotalCount(total);
        setPage(pageNum);
        setTotalPages(totalP);
        setHasPreviousPage(hasPrev);
        setHasNextPage(hasNext);

        if (partyIdParam && !selectedCustomer) {
          const match = items.find((c) => c.id === partyIdParam);
          if (match) {
            setSelectedCustomer(match);
            setDetailDrawerOpen(true);
            void fetchCustomerBookings(match.id);
          } else {
            try {
              const direct = await customerRepository.getById(partyIdParam);
              if (direct) {
                setSelectedCustomer(direct);
                setDetailDrawerOpen(true);
                void fetchCustomerBookings(direct.id);
              }
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
    [customerRepository, pageSize, partyIdParam, selectedCustomer, fetchCustomerBookings, language]
  );

  // Trigger search whenever debouncedQuery changes (resets to page 1)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      void fetchCustomers("", 1);
    } else {
      void fetchCustomers(debouncedQuery, 1);
    }
  }, [debouncedQuery]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || (totalPages > 0 && newPage > totalPages)) return;
      void fetchCustomers(debouncedQuery, newPage);
    },
    [debouncedQuery, fetchCustomers, totalPages]
  );

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      handlePageChange(page + 1);
    }
  }, [hasNextPage, handlePageChange, page]);

  const handlePrevPage = useCallback(() => {
    if (hasPreviousPage) {
      handlePageChange(page - 1);
    }
  }, [hasPreviousPage, handlePageChange, page]);

  const handleSelectCustomer = useCallback(
    (customer: CustomerSummary | null) => {
      setSelectedCustomer(customer);
      if (customer) {
        setDetailDrawerOpen(true);
        void fetchCustomerBookings(customer.id);
      } else {
        setDetailDrawerOpen(false);
        setCustomerBookings([]);
      }
    },
    [fetchCustomerBookings]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
    void fetchCustomers(searchQuery, 1);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    void fetchCustomers("", 1);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const displayName = newName.trim();
      const phone = newPhone.trim() || undefined;
      const fingerprint = JSON.stringify([displayName, newType, phone]);
      if (customerCreateIntentRef.current?.fingerprint !== fingerprint) {
        customerCreateIntentRef.current = { fingerprint, key: crypto.randomUUID() };
      }
      const created = await customerRepository.create(displayName, newType, phone, {
        idempotencyKey: customerCreateIntentRef.current.key,
      });
      customerCreateIntentRef.current = null;
      setCreateOpen(false);
      setNewName("");
      setNewPhone("");
      handleSelectCustomer(created);
      await fetchCustomers(debouncedQuery, 1);
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
    setSelectedCustomer: handleSelectCustomer,
    detailDrawerOpen,
    setDetailDrawerOpen,
    customerBookings,
    customerBookingsLoading,
    customerBookingsError,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    createOpen,
    setCreateOpen,
    newName,
    setNewName,
    newPhone,
    setNewPhone,
    newType,
    setNewType,
    createLoading,
    createError,
    handleSearch,
    handleResetSearch,
    handleCreateCustomer,
  };
}
