"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { MoneyInvoice } from "../../domain/entities/Money";
import { aggregateReceivablesByCurrency } from "../components/receivables/receivablesFormatters";

/**
 * Filter tab options for client-side refinement on the loaded receivables page.
 */
export type ReceivablesStatusFilter = "all" | "outstanding" | "paid" | "partiallyPaid";

const DEFAULT_PAGE_SIZE = 100;

function filterInvoices(
  invoices: MoneyInvoice[],
  statusFilter: ReceivablesStatusFilter,
  searchQuery: string,
  initialReservationId?: string | null
): MoneyInvoice[] {
  let list = invoices;

  if (initialReservationId) {
    list = list.filter((i) => i.reservationId === initialReservationId);
  }

  if (statusFilter === "outstanding") {
    list = list.filter((i) => i.outstandingAmount > 0);
  } else if (statusFilter === "paid") {
    list = list.filter(
      (i) => i.status === "Paid" || (i.outstandingAmount === 0 && i.paidAmount > 0)
    );
  } else if (statusFilter === "partiallyPaid") {
    list = list.filter(
      (i) => i.status === "PartiallyPaid" || (i.outstandingAmount > 0 && i.paidAmount > 0)
    );
  }

  const trimmedSearch = searchQuery.trim().toLowerCase();
  if (trimmedSearch) {
    list = list.filter(
      (i) =>
        i.invoiceNumber?.toLowerCase().includes(trimmedSearch) ||
        (i.payerPartyId && i.payerPartyId.toLowerCase().includes(trimmedSearch)) ||
        (i.reservationId && i.reservationId.toLowerCase().includes(trimmedSearch))
    );
  }

  return list;
}

/**
 * ViewModel hook for Venue Customer Receivables & Invoices.
 * Mediates between the Venue DI moneyRepository and GenericCrudView presentation.
 */
export function useReceivablesViewModel(
  canView: boolean,
  fallbackError: string,
  initialReservationId?: string | null
) {
  const { moneyRepository } = getVenueContainer();
  const [rawItems, setRawItems] = useState<MoneyInvoice[] | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReceivablesStatusFilter>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const load = useCallback(
    async (targetPage = page, targetPageSize = pageSize) => {
      setError(null);
      setIsFetching(true);
      try {
        const filter = initialReservationId ? { reservationId: initialReservationId } : undefined;
        const pageRes = await moneyRepository.getInvoices(targetPage, targetPageSize, filter);
        setRawItems(pageRes.items ?? []);
        setTotalCount(pageRes.totalCount ?? pageRes.items?.length ?? 0);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : fallbackError);
      } finally {
        setIsFetching(false);
      }
    },
    [fallbackError, initialReservationId, moneyRepository, page, pageSize]
  );

  useEffect(() => {
    if (!canView) return;
    const timer = setTimeout(() => {
      void load(page, pageSize);
    }, 0);
    return () => clearTimeout(timer);
  }, [canView, load, page, pageSize]);

  const loadedItems = rawItems ?? [];
  const currencyTotals = aggregateReceivablesByCurrency(loadedItems);
  const filteredItems = filterInvoices(
    loadedItems,
    statusFilter,
    searchQuery,
    initialReservationId
  );
  const totalOutstandingCount = loadedItems.filter((i) => i.outstandingAmount > 0).length;
  const loadedCount = loadedItems.length;
  const pagesCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasActiveFilters = Boolean(
    searchQuery.trim() || statusFilter !== "all" || initialReservationId
  );

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const refresh = () => load(page, pageSize);

  return {
    // GenericCrudView & backward-compatible data properties
    items: filteredItems,
    rawItems,
    filteredItems,
    error,
    loading: canView && ((rawItems === null && error === null) || isFetching),
    load,
    refresh,
    refreshItems: refresh,
    searchQuery,
    setSearchQuery,
    searchValue: searchQuery,
    handleSearchChange: setSearchQuery,
    statusFilter,
    setStatusFilter,
    resetFilters,
    hasActiveFilters,
    currencyTotals,
    totalOutstandingCount,
    totalCount,
    loadedCount,
    isPartial: totalCount > loadedCount || filteredItems.length !== loadedCount,

    // GenericCrudView pagination & adapter compatibility
    pagination: {
      page,
      currentPage: page,
      pageSize,
      itemsCount: totalCount,
      pagesCount,
      totalCount,
      totalPages: pagesCount,
      hasNextPage: page < pagesCount,
      hasPreviousPage: page > 1,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
      pageSizeOptions: [25, 50, 100],
    },
    changePage: handlePageChange,
    changePageSize: handlePageSizeChange,
    selectedItems,
    setSelectedItems,
    isCreateModalOpen: false,
    setIsCreateModalOpen: () => {},
    isEditModalOpen: false,
    setIsEditModalOpen: () => {},
    viewModalOpen: false,
    setViewModalOpen: () => {},
    editingItem: null,
    viewItem: null,
    openEditModal: () => {},
    closeEditModal: () => {},
    openViewModal: () => {},
    closeViewModal: () => {},
  };
}
