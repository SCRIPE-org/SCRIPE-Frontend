"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";

export function useComplianceViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { complianceRepository } = complianceContainer;
  const queryClient = useQueryClient();

  // ── Retention Policies ──────────────────────────────────────────
  const retentionQuery = useQuery({
    queryKey: ["compliance", "retention", page, pageSize, search],
    queryFn: () => complianceRepository.getRetentionPolicies({ page, pageSize, search: search || undefined }),
  });

  // ── DSR Requests ────────────────────────────────────────────────
  const dsrQuery = useQuery({
    queryKey: ["compliance", "dsr", page, pageSize, search],
    queryFn: () => complianceRepository.getDsrList({ page, pageSize, search: search || undefined }),
  });

  // ── Consent Log ─────────────────────────────────────────────────
  const consentQuery = useQuery({
    queryKey: ["compliance", "consent", page, pageSize, search],
    queryFn: () => complianceRepository.getConsentLog({ page, pageSize, search: search || undefined }),
  });

  // ── DPA List ────────────────────────────────────────────────────
  const dpaQuery = useQuery({
    queryKey: ["compliance", "dpa", page, pageSize, search],
    queryFn: () => complianceRepository.getDpaList({ page, pageSize, search: search || undefined }),
  });

  // ── Evidence Frameworks ─────────────────────────────────────────
  const evidenceQuery = useQuery({
    queryKey: ["compliance", "evidence-frameworks"],
    queryFn: () => complianceRepository.getEvidenceFrameworks(),
  });

  // ── Encryption Status ───────────────────────────────────────────
  const encryptionQuery = useQuery({
    queryKey: ["compliance", "encryption-status"],
    queryFn: () => complianceRepository.getEncryptionStatus(),
  });

  // ── Mutations ───────────────────────────────────────────────────
  const createDsrMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => complianceRepository.createDsr(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "dsr"] }),
  });

  const reviewDsrMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      complianceRepository.reviewDsr(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "dsr"] }),
  });

  const upsertRetentionMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => complianceRepository.upsertRetentionPolicy(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "retention"] }),
  });

  const deleteRetentionMutation = useMutation({
    mutationFn: (id: string) => complianceRepository.deleteRetentionPolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "retention"] }),
  });

  const acceptDpaMutation = useMutation({
    mutationFn: (id: string) => complianceRepository.acceptDpa(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "dpa"] }),
  });

  const generateEvidenceMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => complianceRepository.generateEvidence(data),
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    // Pagination & search
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    handleSearch,

    // Tab queries
    retention: {
      items: (retentionQuery.data?.items as unknown[]) ?? [],
      totalCount: retentionQuery.data?.totalCount ?? 0,
      isLoading: retentionQuery.isLoading,
      error: retentionQuery.error,
      refetch: retentionQuery.refetch,
    },
    dsr: {
      items: (dsrQuery.data?.items as unknown[]) ?? [],
      totalCount: dsrQuery.data?.totalCount ?? 0,
      isLoading: dsrQuery.isLoading,
      error: dsrQuery.error,
      refetch: dsrQuery.refetch,
    },
    consent: {
      items: (consentQuery.data?.items as unknown[]) ?? [],
      totalCount: consentQuery.data?.totalCount ?? 0,
      isLoading: consentQuery.isLoading,
      error: consentQuery.error,
      refetch: consentQuery.refetch,
    },
    dpa: {
      items: (dpaQuery.data?.items as unknown[]) ?? [],
      totalCount: dpaQuery.data?.totalCount ?? 0,
      isLoading: dpaQuery.isLoading,
      error: dpaQuery.error,
      refetch: dpaQuery.refetch,
    },
    evidence: {
      frameworks: evidenceQuery.data,
      isLoading: evidenceQuery.isLoading,
      error: evidenceQuery.error,
    },
    encryption: {
      status: encryptionQuery.data,
      isLoading: encryptionQuery.isLoading,
      error: encryptionQuery.error,
    },

    // Mutations
    createDsr: createDsrMutation.mutateAsync,
    reviewDsr: reviewDsrMutation.mutateAsync,
    upsertRetention: upsertRetentionMutation.mutateAsync,
    deleteRetention: deleteRetentionMutation.mutateAsync,
    acceptDpa: acceptDpaMutation.mutateAsync,
    generateEvidence: generateEvidenceMutation.mutateAsync,
    isGeneratingEvidence: generateEvidenceMutation.isPending,
  };
}
