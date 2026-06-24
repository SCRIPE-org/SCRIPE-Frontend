"use client";

/**
 * Audit ViewModel (Orchestrator)
 *
 * Manages audit log list, filtering, pagination, and detail retrieval.
 * Uses dedicated auditRepository — NOT the dashboard repository.
 */
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { monitoringContainer } from "@modules/monitoring/di";
import type { AuditFilterParams } from "../../domain/entities/AuditEntities";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";

// ─── Query keys ──────────────────────────────────────────────────────
// Include tenantId so TanStack Query caches per-tenant
/**
 * Exported constant defining parameters and fields for audit keys configurations.
 */
export const auditKeys = {
  all: (tenantId: string | null) => ["audit", tenantId ?? "system"] as const,
  logs: (params: AuditFilterParams, tenantId: string | null) =>
    [...auditKeys.all(tenantId), "logs", params] as const,
  detail: (id: string, tenantId: string | null) =>
    [...auditKeys.all(tenantId), "detail", id] as const,
  analytics: (tenantId: string | null) => [...auditKeys.all(tenantId), "analytics"] as const,
  topUsers: (tenantId: string | null) => [...auditKeys.all(tenantId), "top-users"] as const,
};

// ─── Filter ViewModel ────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for audit filter state.
 */
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

/**
 * React hook/ViewModel orchestrating state and data flows for audit filter view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
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

  const apiParams = useMemo<AuditFilterParams>(
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
/**
 * React hook/ViewModel orchestrating state and data flows for audit detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useAuditDetailViewModel(id: string | null, tenantId: string | null) {
  const repo = monitoringContainer.auditRepository;

  return useQuery({
    queryKey: auditKeys.detail(id ?? "", tenantId),
    queryFn: () => repo.getLogDetail(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Orchestrator ────────────────────────────────────────────────────
/**
 * React hook/ViewModel orchestrating state and data flows for audit view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useAuditViewModel() {
  const tenantId = useCurrentTenantId();
  const filterVM = useAuditFilterViewModel();
  const repo = monitoringContainer.auditRepository;

  const logsQuery = useQuery({
    queryKey: auditKeys.logs(filterVM.apiParams, tenantId),
    queryFn: () => repo.getLogs(filterVM.apiParams),
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 15 * 1000,
  });

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const detailQuery = useAuditDetailViewModel(selectedLogId, tenantId);

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
