"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "@modules/marketplace/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { AppCategory } from "../../domain/entities/AppCategory";
import type { CategoryFormData } from "../components/CategoryFormDialog";

const QUERY_KEY = ["marketplace", "categories"];

/**
 * React hook/ViewModel orchestrating state and data flows for categories view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useCategoriesViewModel() {
  const queryClient = useQueryClient();
  const { categoriesRepository } = marketplaceContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  // ── Form State ──────────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AppCategory | null>(null);

  const openCreateForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const openEditForm = (cat: AppCategory) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  // ── Query ───────────────────────────────────────────────────────────────────
  const categoriesQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => categoriesRepository.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  // ── Create Mutation ─────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoriesRepository.create(data),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.categoryCreated") || "Category created" });
      closeForm();
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // ── Update Mutation ─────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      categoriesRepository.update(id, data),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.categoryUpdated") || "Category updated" });
      closeForm();
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // ── Delete Mutation ─────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesRepository.delete(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.categoryDeleted") || "Category deleted" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFormSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const categories = categoriesQuery.data ?? [];

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    stats: {
      total: categories.length,
      active: categories.filter((c) => c.isActive).length,
    },

    // Form
    isFormOpen,
    editingCategory,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,

    // Actions
    delete: (id: string) => deleteMutation.mutate(id),
    isDeleting: deleteMutation.isPending,
  };
}
