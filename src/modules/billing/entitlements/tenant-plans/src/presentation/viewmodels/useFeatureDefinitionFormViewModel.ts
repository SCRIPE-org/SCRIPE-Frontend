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
import {
  useCustomFieldsFormFields,
  getCustomFieldsExtension,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";
import {
  assertSelectCustomFieldValuesValid,
  CustomFieldValidationError,
} from "@modules/custom-fields/custom-field/src/presentation/renderCustomFieldControl";
import type {
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
} from "../../domain/entities/TenantPlanRequests";

/**
 * Registered in the backend's EntitlementsEntityTypeCatalog -- must match
 * exactly, and matches useTenantFeatureDefinitionsViewModel's configBase.entityTypeKey
 * (that screen's own modal never actually mounts Custom Fields, since Create/
 * Edit both navigate here instead; this is the real integration point).
 */
export const TENANT_FEATURE_DEFINITION_ENTITY_TYPE_KEY = "entitlements.tenant-feature-definition";

/**
 * React hook/ViewModel orchestrating state and data flows for feature definition form view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useFeatureDefinitionFormViewModel(featureId?: string) {
  const { t } = useI18n();
  const router = useRouter();
  const { success, error: showError } = useEnhancedToast();
  const { tenantPlanRepository } = entitlementsContainer;
  const queryClient = useQueryClient();
  const isEditMode = !!featureId;

  // ─── Custom Fields ───────────────────────────────────────
  // No ownerId in create mode (definitions only); keyed by featureId once
  // editing an existing record (definitions merged with their stored values).
  const customFieldsQuery = useCustomFieldsFormFields(
    TENANT_FEATURE_DEFINITION_ENTITY_TYPE_KEY,
    isEditMode ? featureId : undefined
  );

  // Keyed by the field's namespaced name (e.g. "__cf__nationality"), holding
  // only values the user has actively edited this session -- an untouched
  // field falls back to its fetched defaultValue at save time (see
  // saveCustomFieldValues below) rather than being seeded into this state,
  // so a mid-session refetch (the inline-add trigger) can never clobber an
  // in-progress edit.
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = useCallback((name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Full-resubmit, matching GenericCrudView's own contract: every currently
  // known custom field's effective value (edited-this-session or the fetched
  // default) is sent, not just the ones the user touched -- saveValues is a
  // full-replace of the owner's value set, so omitting an untouched field
  // here would silently clear it.
  const saveCustomFieldValues = useCallback(
    async (ownerId: string) => {
      // D5 (final whole-branch review, I3 follow-up): reject a stale/invalid
      // Select value client-side, with the real localized reason, BEFORE it
      // ever reaches saveValues and comes back as a 422 -- see
      // assertSelectCustomFieldValuesValid's own doc comment
      // (renderCustomFieldControl.tsx) for why this is the right integration
      // point. Throws CustomFieldValidationError, which handleSubmit's own
      // catch block below distinguishes from a genuine API failure so it can
      // show the specific reason, not the generic fallback.
      assertSelectCustomFieldValuesValid(customFieldsQuery.fieldConfigs, customFieldValues, t);

      const decoded: Record<string, unknown> = {};
      for (const fc of customFieldsQuery.fieldConfigs) {
        const key = decodeCustomFieldName(fc.name);
        if (key === null) continue;
        const raw = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
        decoded[key] = raw === "" ? null : raw;
      }
      if (Object.keys(decoded).length === 0) return;
      await getCustomFieldsExtension()?.saveValues(
        TENANT_FEATURE_DEFINITION_ENTITY_TYPE_KEY,
        ownerId,
        decoded
      );
    },
    [customFieldsQuery.fieldConfigs, customFieldValues, t]
  );

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
    if (!form.key.trim()) e.key = t("validation.required");
    if (!form.valueType) e.valueType = t("validation.required");
    return e;
  }, [form.key, form.valueType, t]);

  const isValid = Object.keys(errors).length === 0;

  // ── Create mutation ──
  // No onSuccess here -- success side effects (invalidate, toast, navigate)
  // only fire from handleSubmit once saveCustomFieldValues has also
  // settled, so a custom-field save failure can never be masked by an
  // immediate redirect away from the form.
  const createMutation = useMutation({
    mutationFn: async (data: CreateFeatureDefinitionRequest) => {
      return tenantPlanRepository.createFeatureDefinition(data);
    },
    onError: () => {
      showError({
        title: t("common.error"),
        description: t("entitlements.featureDefinitions.createFailed"),
      });
    },
  });

  // ── Update mutation ──
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateFeatureDefinitionRequest) => {
      return tenantPlanRepository.updateFeatureDefinition(featureId!, data);
    },
    onError: () => {
      showError({
        title: t("common.error"),
        description: t("entitlements.featureDefinitions.updateFailed"),
      });
    },
  });

  // isPending alone would flip back to false the instant the entity mutation
  // settles, re-enabling Save while saveCustomFieldValues is still in flight
  // right after it -- this stays true for the whole orchestrated submit.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSaving = isSubmitting;

  const handleSubmit = useCallback(async () => {
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

    setIsSubmitting(true);
    try {
      let ownerId: string;
      if (isEditMode) {
        try {
          await updateMutation.mutateAsync(payload as UpdateFeatureDefinitionRequest);
        } catch {
          return; // updateMutation's onError already toasted
        }
        ownerId = featureId!;
      } else {
        try {
          ownerId = await createMutation.mutateAsync(payload);
        } catch {
          return; // createMutation's onError already toasted
        }
      }

      try {
        await saveCustomFieldValues(ownerId);
      } catch (err) {
        showError({
          title: t("common.error"),
          description:
            err instanceof CustomFieldValidationError
              ? err.message
              : t("entitlements.featureDefinitions.customFieldsSaveError"),
        });
        return; // the definition itself was saved -- don't pretend the whole save succeeded
      }

      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-feature-definitions"] });
      success({
        title: t(
          isEditMode ? "entitlements.featureDefinitions.updated" : "entitlements.featureDefinitions.created"
        ),
        description: t(
          isEditMode
            ? "entitlements.featureDefinitions.updatedDesc"
            : "entitlements.featureDefinitions.createdDesc"
        ),
      });
      router.push("/entitlements/tenant-feature-definitions");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    form,
    isValid,
    isSaving,
    isEditMode,
    featureId,
    createMutation,
    updateMutation,
    saveCustomFieldValues,
    queryClient,
    success,
    showError,
    t,
    router,
  ]);

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
    customFieldConfigs: customFieldsQuery.fieldConfigs,
    customFieldsLoading: customFieldsQuery.isLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields: customFieldsQuery.refetch,
  };
}
