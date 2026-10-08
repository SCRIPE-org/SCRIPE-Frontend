// FILE-EXCEPTION: rule bypass for existing large file
"use client";

/**
 * Audit ViewModel (Orchestrator)
 *
 * Manages audit log list, enterprise filtering, server pagination,
 * real-time SignalR coordination, hub activity metrics, and detail drawer state.
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
 * auditKeys
 */
export const auditKeys = {
  all: (tenantId: string | null) => ["audit", tenantId ?? "system"] as const,
  logs: (params: AuditFilterParams, tenantId: string | null) =>
    [...auditKeys.all(tenantId), "logs", params] as const,
  hubSummary: (tenantId: string | null) =>
    [...auditKeys.all(tenantId), "hub-summary"] as const,
  detail: (id: string, tenantId: string | null) =>
    [...auditKeys.all(tenantId), "detail", id] as const,
  analytics: (tenantId: string | null) => [...auditKeys.all(tenantId), "analytics"] as const,
  topUsers: (tenantId: string | null) => [...auditKeys.all(tenantId), "top-users"] as const,
};

// ─── Date Presets ────────────────────────────────────────────────────
/**
 * DatePreset
 */
export type DatePreset = "all" | "today" | "24h" | "7d" | "30d" | "custom";

function getDateRangeFromPreset(preset: DatePreset): { dateFrom: string; dateTo: string } {
  const now = new Date();
  switch (preset) {
    case "today": {
      const startOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
      );
      return { dateFrom: startOfDay.toISOString(), dateTo: "" };
    }
    case "24h": {
      const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return { dateFrom: past24h.toISOString(), dateTo: "" };
    }
    case "7d": {
      const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { dateFrom: past7d.toISOString(), dateTo: "" };
    }
    case "30d": {
      const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { dateFrom: past30d.toISOString(), dateTo: "" };
    }
    case "all":
    default:
      return { dateFrom: "", dateTo: "" };
  }
}

// ─── Filter State ────────────────────────────────────────────────────
/**
 * AuditFilterState
 */
export interface AuditFilterState {
  page: number;
  pageSize: number;
  eventType: string;
  username: string;
  entityType: string;
  search: string;
  correlationId: string;
  datePreset: DatePreset;
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
  datePreset: "all",
  dateFrom: "",
  dateTo: "",
  isSuccess: undefined,
};

/**
 * Filter state management with debounced text search and preset date ranges.
 */
export function useAuditFilterViewModel() {
  const [filters, setFilters] = useState<AuditFilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search input (300ms)
  const searchFilter = filters.search;
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchFilter);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchFilter]);

  const updateFilter = useCallback(
    <K extends keyof AuditFilterState>(key: K, value: AuditFilterState[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        // Reset page to 1 when changing filters (except page)
        if (key !== "page") {
          next.page = 1;
        }
        // If manually editing dateFrom or dateTo, switch preset to custom
        if ((key === "dateFrom" || key === "dateTo") && prev.datePreset !== "custom") {
          next.datePreset = "custom";
        }
        return next;
      });
    },
    []
  );

  const setDatePreset = useCallback((preset: DatePreset) => {
    if (preset === "custom") {
      setFilters((prev) => ({ ...prev, datePreset: "custom", page: 1 }));
      return;
    }
    const { dateFrom, dateTo } = getDateRangeFromPreset(preset);
    setFilters((prev) => ({
      ...prev,
      datePreset: preset,
      dateFrom,
      dateTo,
      page: 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setDebouncedSearch("");
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.eventType) count++;
    if (filters.username) count++;
    if (filters.entityType) count++;
    if (debouncedSearch) count++;
    if (filters.correlationId) count++;
    if (filters.datePreset !== "all" || filters.dateFrom || filters.dateTo) count++;
    if (filters.isSuccess !== undefined) count++;
    return count;
  }, [filters, debouncedSearch]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    updateFilter,
    setDatePreset,
    resetFilters,
    setPage,
    setPageSize,
    apiParams,
    hasActiveFilters,
    activeFilterCount,
  };
}

// ─── Detail ViewModel ────────────────────────────────────────────────
/**
 * useAuditDetailViewModel
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
 * useAuditViewModel
 */
export function useAuditViewModel() {
  const tenantId = useCurrentTenantId();
  const filterVM = useAuditFilterViewModel();
  const repo = monitoringContainer.auditRepository;

  // Main Audit Log Query
  const logsQuery = useQuery({
    queryKey: auditKeys.logs(filterVM.apiParams, tenantId),
    queryFn: () => repo.getLogs(filterVM.apiParams),
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 15 * 1000,
  });

  // Hub Summary Query (Real-time activity stats: today, yesterday, module count)
  const hubSummaryQuery = useQuery({
    queryKey: auditKeys.hubSummary(tenantId),
    queryFn: () => repo.getHubSummary(),
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const detailQuery = useAuditDetailViewModel(selectedLogId, tenantId);

  const openDetail = useCallback((id: string) => setSelectedLogId(id), []);
  const closeDetail = useCallback(() => setSelectedLogId(null), []);

  const refetchAll = useCallback(async () => {
    await Promise.all([logsQuery.refetch(), hubSummaryQuery.refetch()]);
  }, [logsQuery, hubSummaryQuery]);

  const isRefetching = logsQuery.isRefetching || hubSummaryQuery.isRefetching;

  // Quick cross-investigation helpers from Detail Drawer
  const quickFilterByUser = useCallback(
    (username: string) => {
      filterVM.updateFilter("username", username);
      closeDetail();
    },
    [filterVM, closeDetail]
  );

  const quickFilterByCorrelationId = useCallback(
    (correlationId: string) => {
      filterVM.updateFilter("correlationId", correlationId);
      closeDetail();
    },
    [filterVM, closeDetail]
  );

  // Derived KPI metrics
  const totalEvents = logsQuery.data?.totalCount ?? 0;
  const todayActionCount = hubSummaryQuery.data?.todayActionCount ?? 0;
  const yesterdayActionCount = hubSummaryQuery.data?.yesterdayActionCount ?? 0;
  const todayModuleCount = hubSummaryQuery.data?.todayModuleCount ?? 0;

  const todayTrendPercentage = useMemo(() => {
    if (yesterdayActionCount <= 0) return 0;
    return Math.round(((todayActionCount - yesterdayActionCount) / yesterdayActionCount) * 100);
  }, [todayActionCount, yesterdayActionCount]);

  // Count failed events in the current result set
  const failedEventsCount = !logsQuery.data?.items
    ? 0
    : logsQuery.data.items.filter((item) => !item.isSuccess).length;

  return {
    // Filter & Pagination
    filters: filterVM.filters,
    updateFilter: filterVM.updateFilter,
    setDatePreset: filterVM.setDatePreset,
    resetFilters: filterVM.resetFilters,
    setPage: filterVM.setPage,
    setPageSize: filterVM.setPageSize,
    hasActiveFilters: filterVM.hasActiveFilters,
    activeFilterCount: filterVM.activeFilterCount,

    // Data Queries
    logs: logsQuery,
    hubSummary: hubSummaryQuery,
    isRefetching,
    refetchAll,

    // Detail Drawer
    selectedLogId,
    detail: detailQuery,
    openDetail,
    closeDetail,
    quickFilterByUser,
    quickFilterByCorrelationId,

    // Computed KPIs
    kpis: {
      totalEvents,
      todayActionCount,
      yesterdayActionCount,
      todayTrendPercentage,
      todayModuleCount,
      failedEventsCount,
    },
  };
}
