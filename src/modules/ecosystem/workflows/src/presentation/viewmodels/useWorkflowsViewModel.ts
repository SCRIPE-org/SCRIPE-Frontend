"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";

export function useWorkflowsViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { workflowsRepository } = ecosystemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["workflows", page, pageSize, search],
    queryFn: () => workflowsRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const startMutation = useMutation({
    mutationFn: (definitionId: string) => workflowsRepository.start(definitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success(t("workflows.startSuccess") || "Workflow started");
    },
    onError: () => {
      toast.error(t("workflows.startError") || "Failed to start workflow");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => workflowsRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setCreateDialogOpen(false);
      toast.success(t("workflows.createSuccess") || "Workflow created");
    },
    onError: () => {
      toast.error(t("workflows.createError") || "Failed to create workflow");
    },
  });

  const handleStart = useCallback((definitionId: string) => {
    startMutation.mutate(definitionId);
  }, [startMutation]);

  const handleCreate = useCallback((data: Record<string, unknown>) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    handleSearch,
    refetch,
    handleStart,
    handleCreate,
    isStarting: startMutation.isPending,
    startingId: startMutation.variables,
    isCreating: createMutation.isPending,
    createDialogOpen,
    setCreateDialogOpen,
  };
}
