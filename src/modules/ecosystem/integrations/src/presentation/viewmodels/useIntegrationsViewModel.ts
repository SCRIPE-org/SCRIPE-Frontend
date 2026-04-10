"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";

export function useIntegrationsViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configTarget, setConfigTarget] = useState<string | null>(null);

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { integrationsRepository } = ecosystemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["integrations", page, pageSize, search],
    queryFn: () => integrationsRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ type, enabled }: { type: string; enabled: boolean }) =>
      integrationsRepository.toggle(type, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success(t("integrations.toggleSuccess") || "Integration updated");
    },
    onError: () => {
      toast.error(t("integrations.toggleError") || "Failed to update integration");
    },
  });

  const testMutation = useMutation({
    mutationFn: (type: string) => integrationsRepository.testConnection(type),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t("integrations.testSuccess") || "Connection test passed");
      } else {
        toast.error(result.message || t("integrations.testFailed") || "Connection test failed");
      }
    },
    onError: () => {
      toast.error(t("integrations.testError") || "Failed to test connection");
    },
  });

  const handleToggle = useCallback((type: string, enabled: boolean) => {
    toggleMutation.mutate({ type, enabled });
  }, [toggleMutation]);

  const handleTest = useCallback((type: string) => {
    testMutation.mutate(type);
  }, [testMutation]);

  const handleConfigure = useCallback((type: string) => {
    setConfigTarget(type);
    setConfigDialogOpen(true);
  }, []);

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
    // Mutations
    handleToggle,
    handleTest,
    handleConfigure,
    isToggling: toggleMutation.isPending,
    isTesting: testMutation.isPending,
    testingType: testMutation.variables,
    // Config dialog
    configDialogOpen,
    setConfigDialogOpen,
    configTarget,
  };
}
