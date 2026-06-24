"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { CreateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";

/**
 * React hook/ViewModel orchestrating state and data flows for tenant plan create view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantPlanCreateViewModel() {
  const router = useRouter();
  const { tenantPlanRepository } = entitlementsContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<CreateTenantPlanRequest>>({
    name: "",
    tierLevel: 0,
    sortOrder: 0,
    isPublic: true,
    allowMonthly: true,
    allowYearly: false,
    allowLifetime: false,
    allowTrial: false,
    trialDays: 14,
    gracePeriodDays: 3,
    maxUsers: -1,
    isSelfServiceEnabled: true,
    isContactSalesOnly: false,
  });

  const updateForm = (updates: Partial<CreateTenantPlanRequest>) => {
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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.name) throw new Error("Name is required");
      return tenantPlanRepository.create(form as CreateTenantPlanRequest);
    },
    onSuccess: (newPlanId) => {
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans"] });
      success({
        title: t("entitlements.tenantPlans.created") || "Plan Created",
        description:
          t("entitlements.tenantPlans.createdDesc") || "The plan has been created successfully.",
      });
      router.push(`/entitlements/tenant-plans/${newPlanId}`);
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err?.message || "Failed to create plan.",
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
    submit: createMutation.mutate,
    isSubmitting: createMutation.isPending,
    error: createMutation.error,
  };
}
