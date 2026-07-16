"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pluginsContainer } from "@modules/plugins/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { PluginDefinition } from "@modules/plugins/core";
import type {
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
} from "../../domain/interfaces/IDefinitionsRepository";

const QUERY_KEY = ["plugins", "definitions"];

/**
 * React hook/ViewModel orchestrating state and data flows for definitions view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useDefinitionsViewModel() {
  const queryClient = useQueryClient();
  const { definitionsRepository } = pluginsContainer;
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();

  // ── Form State ──────────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<PluginDefinition | null>(null);

  const openCreateForm = () => {
    setEditingDefinition(null);
    setIsFormOpen(true);
  };

  const openEditForm = (def: PluginDefinition) => {
    setEditingDefinition(def);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDefinition(null);
  };

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const {
    data: definitions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => definitionsRepository.getAll(),
    staleTime: 2 * 60_000,
  });

  // ── Create Mutation ─────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateDefinitionRequest) => definitionsRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defCreate") || "Definition created" });
      closeForm();
    },
    onError: () => error({ title: t("plugins.definitionsError") || "Failed to create definition" }),
  });

  // ── Update Mutation ─────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateDefinitionRequest) => definitionsRepository.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defEdit") || "Definition updated" });
      closeForm();
    },
    onError: () => error({ title: t("plugins.definitionsError") || "Failed to update definition" }),
  });

  // ── Publish Mutation ────────────────────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defPublish") || "Plugin published" });
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Deprecate Mutation ──────────────────────────────────────────────────────
  const deprecateMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.deprecate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defDeprecate") || "Plugin deprecated" });
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Delete Mutation ─────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defDelete") || "Definition deleted" });
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Derived Stats ──────────────────────────────────────────────────────────
  const stats = {
    total: definitions.length,
    published: definitions.filter((d) => d.isPublished).length,
    draft: definitions.filter((d) => d.isDraft).length,
    pending: definitions.filter((d) => d.isInReview).length,
    deprecated: definitions.filter((d) => d.isDeprecated).length,
    tier1: definitions.filter((d) => d.isTier1).length,
    tier2: definitions.filter((d) => d.isTier2).length,
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFormSubmit = (data: CreateDefinitionRequest) => {
    if (editingDefinition) {
      updateMutation.mutate({ ...data, id: editingDefinition.id });
    } else {
      createMutation.mutate(data);
    }
  };

  return {
    // Data
    definitions,
    isLoading,
    isError,
    refetch,
    stats,

    // Form
    isFormOpen,
    editingDefinition,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,

    // Actions
    publish: (id: string) => publishMutation.mutate(id),
    deprecate: (id: string) => deprecateMutation.mutate(id),
    deleteDefinition: (id: string) => deleteMutation.mutate(id),
    isPublishing: publishMutation.isPending,
    isDeprecating: deprecateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
