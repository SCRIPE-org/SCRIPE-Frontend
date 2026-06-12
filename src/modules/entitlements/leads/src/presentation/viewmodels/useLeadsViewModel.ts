"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { LeadStatus } from "../../domain/entities/PlatformLead";

const QUERY_KEYS = {
  list: (page: number, pageSize: number, status?: LeadStatus, search?: string) =>
    ["leads", "list", page, pageSize, status, search],
  detail: (id: string) => ["leads", "detail", id],
};

export function useLeadsViewModel() {
  const { leadsRepository } = entitlementsContainer;
  const queryClient = useQueryClient();

  // ── Filters & Pagination ──
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // ── List Query ──
  const listQuery = useQuery({
    queryKey: QUERY_KEYS.list(page, pageSize, statusFilter, search || undefined),
    queryFn: () =>
      leadsRepository.getAll({
        page,
        pageSize,
        status: statusFilter,
        search: search || undefined,
      }),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // ── Detail Query (when a row is selected) ──
  const detailQuery = useQuery({
    queryKey: QUERY_KEYS.detail(selectedLeadId ?? ""),
    queryFn: () => leadsRepository.getById(selectedLeadId!),
    enabled: !!selectedLeadId,
    staleTime: 60 * 1000,
  });

  // ── Update Status Mutation ──
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: LeadStatus;
      notes?: string;
    }) => leadsRepository.updateStatus({ id, status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  // ── Handlers ──
  const handleStatusFilterChange = useCallback((status: LeadStatus | undefined) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSelectLead = useCallback((id: string | null) => {
    setSelectedLeadId(id);
  }, []);

  const handleUpdateStatus = useCallback(
    async (id: string, status: LeadStatus, notes?: string) => {
      await updateStatusMutation.mutateAsync({ id, status, notes });
    },
    [updateStatusMutation]
  );

  return {
    // List
    leads: listQuery.data?.items ?? [],
    totalCount: listQuery.data?.totalCount ?? 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    page,
    pageSize,

    // Filters
    statusFilter,
    search,

    // Detail
    selectedLeadId,
    selectedLead: detailQuery.data,
    isLoadingDetail: detailQuery.isLoading,

    // Mutation state
    isUpdatingStatus: updateStatusMutation.isPending,

    // Handlers
    handleStatusFilterChange,
    handleSearchChange,
    handlePageChange,
    handleSelectLead,
    handleUpdateStatus,
  };
}
