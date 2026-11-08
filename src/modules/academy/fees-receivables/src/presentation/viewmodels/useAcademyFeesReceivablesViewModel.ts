"use client";

import { useState, useCallback, useEffect } from "react";
import type { IAcademyFinanceRepository } from "../../domain/interfaces/IAcademyFinanceRepository";
import type {
  AcademyFeeReceivableItem,
  AcademyFeesSummaryByCurrency,
  FeesReceivablesFilters
} from "../../domain/entities/AcademyReceivable";

export function useAcademyFeesReceivablesViewModel(repository: IAcademyFinanceRepository) {
  const [items, setItems] = useState<AcademyFeeReceivableItem[]>([]);
  const [summaries, setSummaries] = useState<AcademyFeesSummaryByCurrency[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [asOfUtc, setAsOfUtc] = useState<string>("");
  const [blockedCapabilities, setBlockedCapabilities] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<AcademyFeeReceivableItem | null>(null);

  const [branchFilter, setBranchFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currencyFilter, setCurrencyFilter] = useState<string>("");
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceivables = useCallback(async (filters?: FeesReceivablesFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getFeesReceivables({
        branchId: filters?.branchId || branchFilter || undefined,
        programId: filters?.programId || programFilter || undefined,
        billingStatus: filters?.billingStatus || statusFilter || undefined,
        currencyCode: filters?.currencyCode || currencyFilter || undefined,
        overdueOnly: filters?.overdueOnly !== undefined ? filters.overdueOnly : overdueOnly || undefined,
        page: 1,
        pageSize: 100
      });

      setItems(data.items);
      setSummaries(data.summaries);
      setTotalCount(data.totalCount);
      setAsOfUtc(data.asOfUtc);
      setBlockedCapabilities(data.blockedCapabilities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fees & receivables.");
    } finally {
      setLoading(false);
    }
  }, [repository, branchFilter, programFilter, statusFilter, currencyFilter, overdueOnly]);

  const handleExportCsv = useCallback(() => {
    const url = repository.getExportUrl({
      branchId: branchFilter || undefined,
      programId: programFilter || undefined,
      billingStatus: statusFilter || undefined,
      currencyCode: currencyFilter || undefined,
      overdueOnly: overdueOnly || undefined
    });
    window.open(url, "_blank");
  }, [repository, branchFilter, programFilter, statusFilter, currencyFilter, overdueOnly]);

  useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);

  // Client-side quick search filter across athlete names and invoice numbers
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const athleteEn = item.athleteNameEn?.toLowerCase() || "";
    const athleteAr = item.athleteNameAr || "";
    const inv = item.financeInvoiceReference?.toLowerCase() || "";
    const prog = item.programNameEn.toLowerCase();
    return athleteEn.includes(q) || athleteAr.includes(q) || inv.includes(q) || prog.includes(q);
  });

  return {
    items: filteredItems,
    rawItems: items,
    summaries,
    totalCount,
    asOfUtc,
    blockedCapabilities,
    selectedItem,
    branchFilter,
    programFilter,
    statusFilter,
    currencyFilter,
    overdueOnly,
    searchQuery,
    loading,
    error,
    setSelectedItem,
    setBranchFilter,
    setProgramFilter,
    setStatusFilter,
    setCurrencyFilter,
    setOverdueOnly,
    setSearchQuery,
    fetchReceivables,
    handleExportCsv
  };
}
