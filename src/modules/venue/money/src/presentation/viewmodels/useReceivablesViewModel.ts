"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { MoneyInvoice } from "../../domain/entities/Money";

export type ReceivablesStatusFilter = "all" | "outstanding" | "paid" | "partiallyPaid";

export function useReceivablesViewModel(canView: boolean, fallbackError: string) {
  const { moneyRepository } = getVenueContainer();
  const [items, setItems] = useState<MoneyInvoice[] | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReceivablesStatusFilter>("all");

  const load = useCallback(async () => {
    setError(null);
    try {
      const pageRes = await moneyRepository.getInvoices(1, 100);
      setItems(pageRes.items ?? []);
      setTotalCount(pageRes.totalCount ?? pageRes.items?.length ?? 0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : fallbackError);
    }
  }, [fallbackError, moneyRepository]);

  useEffect(() => {
    if (!canView) return;
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [canView, load]);

  // Currency-isolated totals: Never sum different currencies together!
  // Remove unsafe fallback assumptions: Missing currencyCode is classified as UNSPECIFIED, never defaulted to SAR or EGP.
  const currencyTotals = useMemo(() => {
    const totals: Record<
      string,
      { total: number; paid: number; outstanding: number; count: number }
    > = {};

    for (const inv of items ?? []) {
      const trimmed = inv.currencyCode?.trim();
      const code = trimmed ? trimmed.toUpperCase() : "UNSPECIFIED";
      if (!totals[code]) {
        totals[code] = { total: 0, paid: 0, outstanding: 0, count: 0 };
      }
      totals[code].total += inv.effectiveTotalAmount ?? inv.totalAmount ?? 0;
      totals[code].paid += inv.paidAmount ?? 0;
      totals[code].outstanding += inv.outstandingAmount ?? 0;
      totals[code].count += 1;
    }

    return totals;
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = items ?? [];
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.invoiceNumber?.toLowerCase().includes(q) ||
          (i.payerPartyId && i.payerPartyId.toLowerCase().includes(q)) ||
          (i.reservationId && i.reservationId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, searchQuery, statusFilter]);

  const totalOutstandingCount = useMemo(() => {
    return (items ?? []).filter((i) => i.outstandingAmount > 0).length;
  }, [items]);

  return {
    items,
    filteredItems,
    error,
    loading: items === null && error === null,
    load,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currencyTotals,
    totalOutstandingCount,
    totalCount,
    loadedCount: items?.length ?? 0,
    isPartial: totalCount > (items?.length ?? 0) || filteredItems.length !== (items?.length ?? 0),
  };
}

