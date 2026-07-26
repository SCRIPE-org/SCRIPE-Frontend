"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "@modules/marketplace/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * React hook/ViewModel orchestrating state and data flows for submissions view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useSubmissionsViewModel() {
  const queryClient = useQueryClient();
  const { submissionsRepository } = marketplaceContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["marketplace", "submissions"] });

  const submissionsQuery = useQuery({
    queryKey: ["marketplace", "submissions", page, statusFilter],
    queryFn: () => submissionsRepository.getAll({ page, pageSize: 20, status: statusFilter }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => submissionsRepository.approve(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.submissions.approved") });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      submissionsRepository.reject(id, notes),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.submissions.rejected") });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  const revisionsMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      submissionsRepository.requestRevisions(id, notes),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.submissions.revisionsRequested") });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  const data = submissionsQuery.data;
  return {
    submissions: data?.items ?? [],
    pagination: {
      page,
      pageSize: 20,
      totalCount: data?.totalCount ?? 0,
      totalPages: data?.totalPages ?? 1,
    },
    isLoading: submissionsQuery.isLoading,
    error: submissionsQuery.error,
    setPage,
    setStatusFilter,
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
    requestRevisions: revisionsMutation.mutate,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
