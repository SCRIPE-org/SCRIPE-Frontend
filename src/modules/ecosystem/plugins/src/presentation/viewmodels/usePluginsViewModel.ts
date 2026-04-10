"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { toast } from "sonner";

export function usePluginsViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { pluginsRepository } = ecosystemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["plugins", page, pageSize, search],
    queryFn: () => pluginsRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  // ── Install ──────────────────────────────────────────
  const installMutation = useMutation({
    mutationFn: (manifestJson: string) => pluginsRepository.install(manifestJson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
      toast.success("Plugin installed successfully");
    },
    onError: () => {
      toast.error("Failed to install plugin");
    },
  });

  // ── Enable ───────────────────────────────────────────
  const enableMutation = useMutation({
    mutationFn: (id: string) => pluginsRepository.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
      toast.success("Plugin enabled");
    },
    onError: () => {
      toast.error("Failed to enable plugin");
    },
  });

  // ── Disable ──────────────────────────────────────────
  const disableMutation = useMutation({
    mutationFn: (id: string) => pluginsRepository.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
      toast.success("Plugin disabled");
    },
    onError: () => {
      toast.error("Failed to disable plugin");
    },
  });

  // ── Uninstall ────────────────────────────────────────
  const uninstallMutation = useMutation({
    mutationFn: (id: string) => pluginsRepository.uninstall(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
      toast.success("Plugin uninstalled");
    },
    onError: () => {
      toast.error("Failed to uninstall plugin");
    },
  });

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
    install: installMutation.mutateAsync,
    enable: enableMutation.mutateAsync,
    disable: disableMutation.mutateAsync,
    uninstall: uninstallMutation.mutateAsync,
    isInstalling: installMutation.isPending,
    isEnabling: enableMutation.isPending,
    isDisabling: disableMutation.isPending,
    isUninstalling: uninstallMutation.isPending,
  };
}
