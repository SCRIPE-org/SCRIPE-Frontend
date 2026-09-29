"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import {
  useCustomFieldsFormFields,
  getCustomFieldsExtension,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";
import {
  assertSelectCustomFieldValuesValid,
  CustomFieldValidationError,
} from "@modules/custom-fields/custom-field";
import { TENANT_PLAN_ENTITY_TYPE_KEY } from "./useTenantPlanCreateViewModel";
import type { UpdateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";

/**
 * React hook/ViewModel orchestrating state and data flows for tenant plan edit view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantPlanEditViewModel(planId: string) {
  const router = useRouter();
  const { tenantPlanRepository } = entitlementsContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // ─── Custom Fields ───────────────────────────────────────
  // planId is always known here (it's a required param), so this always
  // fetches definitions merged with this plan's stored values.
  const customFieldsQuery = useCustomFieldsFormFields(TENANT_PLAN_ENTITY_TYPE_KEY, planId);

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = (name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  const saveCustomFieldValues = async (ownerId: string) => {
    // D5 (final whole-branch review, I3 follow-up): reject a stale/invalid
    // Select value client-side, with the real localized reason, BEFORE it
    // ever reaches saveValues and comes back as a 422 -- see
    // assertSelectCustomFieldValuesValid's own doc comment
    // (renderCustomFieldControl.tsx) for why this is the right integration
    // point. Throws CustomFieldValidationError, which submit's own catch
    // block below distinguishes from a genuine API failure so it can show
    // the specific reason, not the generic fallback.
    assertSelectCustomFieldValuesValid(customFieldsQuery.fieldConfigs, customFieldValues, t);

    const decoded: Record<string, unknown> = {};
    for (const fc of customFieldsQuery.fieldConfigs) {
      const key = decodeCustomFieldName(fc.name);
      if (key === null) continue;
      const raw = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
      decoded[key] = raw === "" ? null : raw;
    }
    if (Object.keys(decoded).length === 0) return;
    await getCustomFieldsExtension()?.saveValues(TENANT_PLAN_ENTITY_TYPE_KEY, ownerId, decoded);
  };

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<UpdateTenantPlanRequest>>({});

  const { data: plan, isLoading: isFetching } = useQuery({
    queryKey: ["entitlements", "tenant-plans", planId],
    queryFn: () => tenantPlanRepository.getById(planId),
  });

  const [prevPlan, setPrevPlan] = useState(plan);
  if (prevPlan !== plan) {
    setPrevPlan(plan);
    if (plan) {
      setForm({
        name: plan.name,
        displayNameEn: plan.displayNameEn || "",
        displayNameAr: plan.displayNameAr || "",
        description: plan.description || "",
        tagline: plan.tagline || "",
        isActive: plan.isActive,
        isPublic: plan.isPublic,
        badgeText: plan.badgeText || "",
        color: plan.color || "",
        iconName: plan.iconName || "",
        maxSubscribers: plan.maxSubscribers,
        maxUsers: plan.maxUsers,
        allowMonthly: plan.allowMonthly,
        allowYearly: plan.allowYearly,
        allowLifetime: plan.allowLifetime,
        allowTrial: plan.allowTrial,
        isSelfServiceEnabled: plan.isSelfServiceEnabled,
        isContactSalesOnly: plan.isContactSalesOnly,
        trialDays: plan.trialDays,
        gracePeriodDays: plan.gracePeriodDays,
        tierLevel: plan.tierLevel,
        sortOrder: plan.sortOrder,
      });
    }
  }

  const updateForm = (updates: Partial<UpdateTenantPlanRequest>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!form.name || form.name.trim() === "") {
        showError({
          title: t("common.error"),
          description: t("entitlements.tenantPlans.missingRequired"),
        });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  // No onSuccess here -- success side effects (invalidate, toast, navigate)
  // only fire from submit() once saveCustomFieldValues has also settled, so
  // a custom-field save failure can never be masked by an immediate redirect
  // away from the wizard.
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!form.name) throw new Error("Name is required");
      return tenantPlanRepository.update(planId, form as UpdateTenantPlanRequest);
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error"),
        description: err?.message || "Failed to update plan.",
      });
    },
  });

  // isPending alone would flip back to false the instant the entity mutation
  // settles, re-enabling Save while saveCustomFieldValues is still in flight
  // right after it -- this stays true for the whole orchestrated submit.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      try {
        await updateMutation.mutateAsync();
      } catch {
        return; // updateMutation's onError already toasted
      }
      try {
        await saveCustomFieldValues(planId);
      } catch (err) {
        showError({
          title: t("common.error"),
          description:
            err instanceof CustomFieldValidationError
              ? err.message
              : t("entitlements.tenantPlans.customFieldsSaveError"),
        });
        return; // the plan itself was updated -- don't pretend the whole save succeeded
      }
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans"] });
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans", planId] });
      success({
        title: t("entitlements.tenantPlans.updated"),
        description: t("entitlements.tenantPlans.updatedDesc"),
      });
      router.push(`/entitlements/tenant-plans/${planId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    form,
    updateForm,
    submit,
    isSubmitting,
    isFetching,
    error: updateMutation.error,
    originalPlan: plan,
    customFieldConfigs: customFieldsQuery.fieldConfigs,
    customFieldsLoading: customFieldsQuery.isLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields: customFieldsQuery.refetch,
  };
}
