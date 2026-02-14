"use client";

/**
 * Audit ViewModel (Orchestrator)
 *
 * Manages audit log list, filtering, pagination, and detail retrieval.
 * Reuses dashboard repository for API calls.
 */
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { getSystemContainer } from "@modules/system/di";
import type { AuditLogFilterParams } from "@modules/system/dashboard/src/domain/interfaces/IDashboardRepository";

// ─── Query keys ──────────────────────────────────────────────────────
export const auditKeys = {
  all: ["audit"] as const,
  logs: (params: AuditLogFilterParams) => [...auditKeys.all, "logs", params] as const,
  detail: (id: string) => [...auditKeys.all, "detail", id] as const,
};

// ─── Filter ViewModel ────────────────────────────────────────────────
export interface AuditFilterState {
  page: number;
  pageSize: number;
  eventType: string;
  username: string;
  entityType: string;
  search: string;
  correlationId: string;
  dateFrom: string;
  dateTo: string;
  isSuccess: boolean | undefined;
}

const defaultFilters: AuditFilterState = {
  page: 1,
  pageSize: 20,
  eventType: "",
  username: "",
  entityType: "",
  search: "",
  correlationId: "",
  dateFrom: "",
  dateTo: "",
  isSuccess: undefined,
};

export function useAuditFilterViewModel() {
  const [filters, setFilters] = useState<AuditFilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search input (300ms)
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [filters.search]);

  const updateFilter = useCallback(
    <K extends keyof AuditFilterState>(key: K, value: AuditFilterState[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === "page" ? (value as number) : 1,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setDebouncedSearch("");
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const apiParams = useMemo<AuditLogFilterParams>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      eventType: filters.eventType || undefined,
      username: filters.username || undefined,
      entityType: filters.entityType || undefined,
      search: debouncedSearch || undefined,
      correlationId: filters.correlationId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      isSuccess: filters.isSuccess,
    }),
    [
      filters.page,
      filters.pageSize,
      filters.eventType,
      filters.username,
      filters.entityType,
      debouncedSearch,
      filters.correlationId,
      filters.dateFrom,
      filters.dateTo,
      filters.isSuccess,
    ]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      filters.eventType !== "" ||
      filters.username !== "" ||
      filters.entityType !== "" ||
      filters.search !== "" ||
      filters.correlationId !== "" ||
      filters.dateFrom !== "" ||
      filters.dateTo !== "" ||
      filters.isSuccess !== undefined
    );
  }, [filters]);

  return { filters, updateFilter, resetFilters, setPage, apiParams, hasActiveFilters };
}

// ─── Detail ViewModel ────────────────────────────────────────────────
export function useAuditDetailViewModel(id: string | null) {
  const repo = getSystemContainer().dashboardRepository;

  return useQuery({
    queryKey: auditKeys.detail(id ?? ""),
    queryFn: () => repo.getAuditLogDetail(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Orchestrator ────────────────────────────────────────────────────
export function useAuditViewModel() {
  const filterVM = useAuditFilterViewModel();
  const repo = getSystemContainer().dashboardRepository;

  const logsQuery = useQuery({
    queryKey: auditKeys.logs(filterVM.apiParams),
    queryFn: () => repo.getAuditLogs(filterVM.apiParams),
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 15 * 1000,
  });

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const detailQuery = useAuditDetailViewModel(selectedLogId);

  const openDetail = useCallback((id: string) => setSelectedLogId(id), []);
  const closeDetail = useCallback(() => setSelectedLogId(null), []);

  return {
    // Filter
    filters: filterVM.filters,
    updateFilter: filterVM.updateFilter,
    resetFilters: filterVM.resetFilters,
    setPage: filterVM.setPage,
    hasActiveFilters: filterVM.hasActiveFilters,
    // Data
    logs: logsQuery,
    // Detail
    selectedLogId,
    detail: detailQuery,
    openDetail,
    closeDetail,
  };
}
