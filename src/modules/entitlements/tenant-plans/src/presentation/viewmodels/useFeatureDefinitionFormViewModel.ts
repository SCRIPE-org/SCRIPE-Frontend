/**
 * ViewModel for FeatureDefinitionFormView
 *
 * Uses proper getFeatureDefinitionById for edit/view mode —
 * NEVER fetches the full list to find a single item.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
} from "../../domain/entities/TenantPlanRequests";

export function useFeatureDefinitionFormViewModel(featureId?: string) {
  const { t } = useI18n();
  const router = useRouter();
  const { success, error: showError } = useEnhancedToast();
  const { tenantPlanRepository } = entitlementsContainer;
  const queryClient = useQueryClient();
  const isEditMode = !!featureId;

  // ── Load existing feature via GET by ID ──
  const { data: existingFeature, isLoading: isLoadingFeature } = useQuery({
    queryKey: ["entitlements", "tenant-feature-definitions", featureId],
    queryFn: () => tenantPlanRepository.getFeatureDefinitionById(featureId!),
    enabled: isEditMode,
  });

  // ── Form state ──
  const [form, setForm] = useState<{
    key: string;
    displayNameEn: string;
    displayNameAr: string;
    valueType: string;
    defaultValue: string;
    category: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>({
    key: "",
    displayNameEn: "",
    displayNameAr: "",
    valueType: "",
    defaultValue: "",
    category: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  // Hydrate form when the entity arrives from the API
  const [prevIsEditMode, setPrevIsEditMode] = useState(isEditMode);
  const [prevExistingFeature, setPrevExistingFeature] = useState(existingFeature);
  if (isEditMode !== prevIsEditMode || existingFeature !== prevExistingFeature) {
    setPrevIsEditMode(isEditMode);
    setPrevExistingFeature(existingFeature);
    if (isEditMode && existingFeature) {
      setForm({
        key: existingFeature.key ?? "",
        displayNameEn: existingFeature.displayNameEn ?? "",
        displayNameAr: existingFeature.displayNameAr ?? "",
        valueType: existingFeature.valueType ?? "",
        defaultValue: existingFeature.defaultValue ?? "",
        category: existingFeature.category ?? "",
        description: existingFeature.description ?? "",
        sortOrder: existingFeature.sortOrder ?? 0,
        isActive: existingFeature.isActive ?? true,
      });
    }
  }

  const updateField = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // ── Validation ──
  const errors = useMemo(() => {
    const e: Partial<Record<string, string>> = {};
    if (!form.key.trim()) e.key = t("validation.required") || "Required";
    if (!form.valueType) e.valueType = t("validation.required") || "Required";
    return e;
  }, [form.key, form.valueType, t]);

  const isValid = Object.keys(errors).length === 0;

  // ── Create mutation ──
  const createMutation = useMutation({
    mutationFn: async (data: CreateFeatureDefinitionRequest) => {
      return tenantPlanRepository.createFeatureDefinition(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-feature-definitions"] });
      success({
        title: t("entitlements.featureDefinitions.created") || "Feature Created",
        description:
          t("entitlements.featureDefinitions.createdDesc") ||
          "Feature definition created successfully.",
      });
      router.push("/entitlements/tenant-feature-definitions");
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description:
          t("entitlements.featureDefinitions.createFailed") || "Failed to create feature.",
      });
    },
  });

  // ── Update mutation ──
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateFeatureDefinitionRequest) => {
      return tenantPlanRepository.updateFeatureDefinition(featureId!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-feature-definitions"] });
      success({
        title: t("entitlements.featureDefinitions.updated") || "Feature Updated",
        description:
          t("entitlements.featureDefinitions.updatedDesc") || "Feature definition updated.",
      });
      router.push("/entitlements/tenant-feature-definitions");
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description:
          t("entitlements.featureDefinitions.updateFailed") || "Failed to update feature.",
      });
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = useCallback(() => {
    if (!isValid || isSaving) return;
    const payload = {
      key: form.key.trim(),
      displayNameEn: form.displayNameEn.trim() || undefined,
      displayNameAr: form.displayNameAr.trim() || undefined,
      valueType: form.valueType,
      defaultValue: form.defaultValue.trim() || undefined,
      category: form.category.trim() || undefined,
      description: form.description.trim() || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };

    if (isEditMode) {
      updateMutation.mutate(payload as UpdateFeatureDefinitionRequest);
    } else {
      createMutation.mutate(payload);
    }
  }, [form, isValid, isSaving, isEditMode, createMutation, updateMutation]);

  return {
    form,
    errors,
    isValid,
    isEditMode,
    isLoadingFeature,
    isSaving,
    updateField,
    handleSubmit,
    t,
  };
}
