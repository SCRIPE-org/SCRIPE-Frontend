"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { UpdateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";

/**
 * React hook/ViewModel managing logic, state, and repository queries for tenant plan edit view model.
 */
export function useTenantPlanEditViewModel(planId: string) {
  const router = useRouter();
  const { tenantPlanRepository } = entitlementsContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<UpdateTenantPlanRequest>>({});

  const { data: plan, isLoading: isFetching } = useQuery({
    queryKey: ["entitlements", "tenant-plans", planId],
    queryFn: () => tenantPlanRepository.getById(planId),
  });

  useEffect(() => {
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
  }, [plan]);

  const updateForm = (updates: Partial<UpdateTenantPlanRequest>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!form.name || form.name.trim() === "") {
        showError({
          title: t("common.error") || "Validation Error",
          description: t("entitlements.tenantPlans.missingRequired") || "Plan name is required.",
        });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!form.name) throw new Error("Name is required");
      return tenantPlanRepository.update(planId, form as UpdateTenantPlanRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans"] });
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans", planId] });
      success({
        title: t("entitlements.tenantPlans.updated") || "Plan Updated",
        description:
          t("entitlements.tenantPlans.updatedDesc") || "The plan has been updated successfully.",
      });
      router.push(`/entitlements/tenant-plans/${planId}`);
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err?.message || "Failed to update plan.",
      });
    },
  });

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    form,
    updateForm,
    submit: updateMutation.mutate,
    isSubmitting: updateMutation.isPending,
    isFetching,
    error: updateMutation.error,
    originalPlan: plan,
  };
}
