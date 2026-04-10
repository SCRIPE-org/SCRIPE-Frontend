"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";

export function useTemplatesViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { templatesRepository } = ecosystemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["templates", page, pageSize, search],
    queryFn: () => templatesRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => templatesRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setCreateDialogOpen(false);
      toast.success(t("templates.createSuccess") || "Template created");
    },
    onError: () => toast.error(t("templates.createError") || "Failed to create template"),
  });

  const applyMutation = useMutation({
    mutationFn: (id: string) => templatesRepository.apply(id),
    onSuccess: () => {
      toast.success(t("templates.applySuccess") || "Template applied");
    },
    onError: () => toast.error(t("templates.applyError") || "Failed to apply template"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templatesRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success(t("templates.deleteSuccess") || "Template deleted");
    },
    onError: () => toast.error(t("templates.deleteError") || "Failed to delete template"),
  });

  const handleSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);
  const handleCreate = useCallback((data: Record<string, unknown>) => { createMutation.mutate(data); }, [createMutation]);
  const handleApply = useCallback((id: string) => { applyMutation.mutate(id); }, [applyMutation]);
  const handleDelete = useCallback((id: string) => { deleteMutation.mutate(id); }, [deleteMutation]);
  const handleView = useCallback((tpl: any) => { setSelectedTemplate(tpl); setViewDialogOpen(true); }, []);

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading, error, page, pageSize, search,
    setPage, setPageSize, handleSearch, refetch,
    handleCreate, handleApply, handleDelete, handleView,
    isCreating: createMutation.isPending,
    isApplying: applyMutation.isPending,
    applyingId: applyMutation.variables,
    createDialogOpen, setCreateDialogOpen,
    viewDialogOpen, setViewDialogOpen,
    selectedTemplate,
  };
}
