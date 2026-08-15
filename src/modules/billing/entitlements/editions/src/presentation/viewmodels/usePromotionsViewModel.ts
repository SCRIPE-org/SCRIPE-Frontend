/**
 * Promotions ViewModel — CRUD for edition promotions
 *
 * Manages the list, create, update, delete, and toggle
 * of promotions within the edition detail page.
 * Pure .ts — no JSX.
 */
"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { qk } from "@core/common/query-keys";
import type {
  EditionPromotionData,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../../domain/entities/EditionPromotion";
import { EditionPromotion } from "../../domain/entities/EditionPromotion";

// ── Form State ──

interface PromotionFormState {
  name: string;
  description: string;
  type: "Percentage" | "FixedAmount";
  discountValue: number;
  discountCurrency: string;
  durationDays: number;
  applicableCycle: string;
  promoCode: string;
  requiresCode: boolean;
  validFrom: string;
  validUntil: string;
  maxRedemptions: string; // string for input, parsed on submit
  firstTimeOnly: boolean;
}

const defaultForm: PromotionFormState = {
  name: "",
  description: "",
  type: "Percentage",
  discountValue: 0,
  discountCurrency: "USD",
  durationDays: 30,
  applicableCycle: "",
  promoCode: "",
  requiresCode: true,
  validFrom: "",
  validUntil: "",
  maxRedemptions: "",
  firstTimeOnly: false,
};

// ── ViewModel Result ──

/**
 * Interface defining property specifications, keys types, and structural contract rules for promotions view model result.
 */
export interface PromotionsViewModelResult {
  // Data
  promotions: EditionPromotion[];
  isLoading: boolean;
  error: Error | null;

  // Dialog
  showDialog: boolean;
  isEditing: boolean;
  editingId: string | null;
  openCreate: () => void;
  openEdit: (promo: EditionPromotion) => void;
  closeDialog: () => void;

  // Form
  form: PromotionFormState;
  setField: <K extends keyof PromotionFormState>(key: K, value: PromotionFormState[K]) => void;

  // Actions
  submit: () => void;
  isSubmitting: boolean;
  deletePromotion: (id: string) => void;
  isDeleting: boolean;
  toggleActive: (id: string, currentActive: boolean) => void;
  isToggling: boolean;
}

/**
 * React hook/ViewModel orchestrating state and data flows for promotions view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function usePromotionsViewModel(editionId: string): PromotionsViewModelResult {
  const { editionRepository } = entitlementsContainer;
  const queryClient = useQueryClient();
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  const queryKey = qk.editions.promotions(editionId);

  // ── Fetch promotions ──
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => editionRepository.getPromotions(editionId),
    enabled: !!editionId,
  });

  const promotions = (data ?? []).map((d: EditionPromotionData) => new EditionPromotion(d));

  // ── Dialog state ──
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromotionFormState>(defaultForm);

  const setField = useCallback(
    <K extends keyof PromotionFormState>(key: K, value: PromotionFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const openCreate = useCallback(() => {
    setForm(defaultForm);
    setEditingId(null);
    setShowDialog(true);
  }, []);

  const openEdit = useCallback((promo: EditionPromotion) => {
    setForm({
      name: promo.name,
      description: promo.description ?? "",
      type: promo.type,
      discountValue: promo.discountValue,
      discountCurrency: promo.discountCurrency ?? "USD",
      durationDays: promo.durationDays,
      applicableCycle: promo.applicableCycle ?? "",
      promoCode: promo.promoCode ?? "",
      requiresCode: promo.requiresCode,
      validFrom: promo.validFrom?.split("T")[0] ?? "",
      validUntil: promo.validUntil?.split("T")[0] ?? "",
      maxRedemptions: promo.maxRedemptions?.toString() ?? "",
      firstTimeOnly: promo.firstTimeOnly,
    });
    setEditingId(promo.id);
    setShowDialog(true);
  }, []);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setEditingId(null);
    setForm(defaultForm);
  }, []);

  // ── Invalidation ──
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // ── Create / Update ──
  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const updateData: UpdatePromotionRequest = {
          name: form.name || undefined,
          description: form.description || undefined,
          validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
          maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions) : undefined,
        };
        await editionRepository.updatePromotion(editionId, editingId, updateData);
      } else {
        const createData: CreatePromotionRequest = {
          name: form.name,
          description: form.description || undefined,
          type: form.type,
          discountValue: form.discountValue,
          discountCurrency: form.type === "FixedAmount" ? form.discountCurrency : undefined,
          durationDays: form.durationDays,
          applicableCycle: form.applicableCycle || undefined,
          promoCode: form.requiresCode ? form.promoCode.toUpperCase().trim() : undefined,
          requiresCode: form.requiresCode,
          validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
          validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
          maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions) : undefined,
          firstTimeOnly: form.firstTimeOnly,
        };
        await editionRepository.createPromotion(editionId, createData);
      }
    },
    onSuccess: () => {
      invalidate();
      closeDialog();
      success({
        title: editingId
          ? t("entitlements.promotions.updated")
          : t("entitlements.promotions.created"),
        description: editingId
          ? t("entitlements.promotions.updatedDesc")
          : t("entitlements.promotions.createdDesc"),
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // ── Delete ──
  const { mutate: deletePromotion, isPending: isDeleting } = useMutation({
    mutationFn: (promoId: string) => editionRepository.deletePromotion(editionId, promoId),
    onSuccess: () => {
      invalidate();
      success({
        title: t("entitlements.promotions.deleted"),
        description: t("entitlements.promotions.deletedDesc"),
      });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  // ── Toggle Active — optimistic update ──
  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      editionRepository.updatePromotion(editionId, id, { isActive: active }),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return (old as EditionPromotionData[]).map((p) =>
          p.id === id ? { ...p, isActive: active } : p
        );
      });
      return { previous };
    },
    onError: (err: Error, __, context?: { previous: unknown }) => {
      if (context?.previous !== undefined) queryClient.setQueryData(queryKey, context.previous);
      showError({ title: t("common.error"), description: err.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    promotions,
    isLoading,
    error: error as Error | null,
    showDialog,
    isEditing: !!editingId,
    editingId,
    openCreate,
    openEdit,
    closeDialog,
    form,
    setField,
    submit,
    isSubmitting,
    deletePromotion,
    isDeleting,
    toggleActive: (id: string, currentActive: boolean) =>
      toggleActive({ id, active: !currentActive }),
    isToggling,
  };
}
