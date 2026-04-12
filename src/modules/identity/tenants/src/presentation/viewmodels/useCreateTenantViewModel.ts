/**
 * Create Tenant ViewModel
 *
 * Dedicated viewmodel for the multi-step tenant creation stepper.
 * Manages step navigation, form state, edition search, promotions,
 * and the create mutation with auto-navigation.
 *
 * Architecture: View → ViewModel → Repository (via DI)
 *
 * @module tenants
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { systemContainer } from "@modules/identity/di";
import { appLogger } from "@core/common/logger";
import type { CreateTenantResult } from "../../domain/entities/TenantRequests";
import type { EditionThinModel } from "../../domain/types/SubscriptionTypes";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface StepperFormState {
  // Step 1: Organization
  name: string;
  code: string;
  description: string;
  parentId: string;
  // Step 2: Administrator
  adminEmail: string;
  adminUsername: string;
  // Step 3: Plan & Billing
  editionId: string;
  subscriptionType: string;
  currency: string;
  skipPayment: boolean;
  promotionId: string;
  promoCode: string;
}

export const INITIAL_STEPPER_FORM: StepperFormState = {
  name: "",
  code: "",
  description: "",
  parentId: "",
  adminEmail: "",
  adminUsername: "",
  editionId: "",
  subscriptionType: "Lifetime",
  currency: "USD",
  skipPayment: false,
  promotionId: "",
  promoCode: "",
};

export const STEPS = [
  { id: 1, key: "organization" },
  { id: 2, key: "administrator" },
  { id: 3, key: "plan" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

// ─────────────────────────────────────────
// ViewModel
// ─────────────────────────────────────────

interface UseCreateTenantViewModelParams {
  /** Pre-fill parent tenant ID (e.g. from query param) */
  defaultParentId?: string;
}

export function useCreateTenantViewModel(params: UseCreateTenantViewModelParams = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const { tenantRepository } = systemContainer;

  // ── Step management ──
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // ── Form state ──
  const [form, setForm] = useState<StepperFormState>(() => ({
    ...INITIAL_STEPPER_FORM,
    parentId: params.defaultParentId || "",
  }));

  // ── Mutation state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreateTenantResult | null>(null);

  // ── Edition & promotion state ──
  const [cachedEditions, setCachedEditions] = useState<EditionThinModel[]>([]);

  // ── Auto-generate code from name ──
  const updateField = useCallback(
    <K extends keyof StepperFormState>(field: K, value: StepperFormState[K]) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        // Auto-generate code from name (only if user hasn't manually edited code)
        if (field === "name" && (!prev.code || prev.code === generateCode(prev.name))) {
          next.code = generateCode(value as string);
        }
        // Auto-generate username from code
        if (field === "code" && (!prev.adminUsername || prev.adminUsername === `${prev.code}_admin`)) {
          next.adminUsername = `${(value as string).toLowerCase()}_admin`;
        }
        return next;
      });
    },
    []
  );

  // ── Promotion query ──
  const { data: promotionsRaw = [], isLoading: isLoadingPromotions } = useQuery({
    queryKey: ["entitlements", "editions", form.editionId, "promotions"],
    queryFn: () => tenantRepository.getEditionPromotions(form.editionId),
    enabled: !!form.editionId && currentStep === 3,
  });

  const availablePromotions = useMemo(() => {
    return (promotionsRaw as any[])
      .filter((p) => {
        if (!p.isActive) return false;
        if (p.validUntil && new Date(p.validUntil) < new Date()) return false;
        if (p.validFrom && new Date(p.validFrom) > new Date()) return false;
        if (p.maxRedemptions != null && p.currentRedemptions >= p.maxRedemptions) return false;
        if (p.applicableCycle && form.subscriptionType) {
          if (p.applicableCycle !== form.subscriptionType) return false;
        }
        return true;
      })
      .map((p) => ({
        id: p.id as string,
        name: p.name as string,
        type: p.type as string,
        discountValue: p.discountValue as number,
        requiresCode: p.requiresCode as boolean,
      }));
  }, [promotionsRaw, form.subscriptionType]);

  // ── Selected edition info ──
  const selectedEdition = useMemo(
    () => cachedEditions.find((e) => e.id === form.editionId),
    [cachedEditions, form.editionId]
  );

  // ── Edition search ──
  const handleSearchEditions = useCallback(
    async (query: string) => {
      try {
        const res = await tenantRepository.getAvailableEditions(1, 10, query);
        setCachedEditions((prev) => {
          const merged = [...prev];
          for (const ed of res.items) {
            if (!merged.find((e) => e.id === ed.id)) merged.push(ed);
          }
          return merged;
        });
        return res.items.map((ed) => ({ value: ed.id, label: ed.name }));
      } catch (err) {
        appLogger.error("Failed to search editions:", err);
        return [];
      }
    },
    [tenantRepository]
  );

  // ── Step validation ──
  const stepErrors = useMemo(() => {
    const errors: Record<StepId, string[]> = { 1: [], 2: [], 3: [] };
    // Step 1
    if (!form.name.trim()) errors[1].push("name");
    if (!form.code.trim()) errors[1].push("code");
    // Step 2
    if (!form.adminEmail.trim()) errors[2].push("adminEmail");
    if (form.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
      errors[2].push("adminEmailFormat");
    }
    // Step 3 — no required fields (edition is optional)
    return errors;
  }, [form]);

  const isStepValid = useCallback(
    (step: StepId) => stepErrors[step].length === 0,
    [stepErrors]
  );

  const canProceed = useMemo(() => isStepValid(currentStep), [isStepValid, currentStep]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (currentStep < 3 && canProceed) {
      setCurrentStep((s) => (s + 1) as StepId);
    }
  }, [currentStep, canProceed]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as StepId);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: StepId) => {
      // Can only go to a step if all previous steps are valid
      for (let i = 1; i < step; i++) {
        if (!isStepValid(i as StepId)) return;
      }
      setCurrentStep(step);
    },
    [isStepValid]
  );

  // ── Submit ──
  const handleSubmit = useCallback(async () => {
    // Validate all steps
    for (let i = 1; i <= 3; i++) {
      if (!isStepValid(i as StepId)) {
        setCurrentStep(i as StepId);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Pre-validate promo code
      if (form.editionId && form.promoCode) {
        const validation = await tenantRepository.validatePromoCode(form.editionId, form.promoCode);
        if (!validation.isValid) {
          const errorCode = validation.errorCode || "UNKNOWN";
          toastError({
            title: t("tenant.invalidPromoCode") || "Invalid Promo Code",
            description:
              t(`tenant.promoCodeError.${errorCode}`) ||
              validation.errorMessage ||
              t("tenant.promoCodeError.UNKNOWN"),
          });
          setCurrentStep(3);
          setIsSubmitting(false);
          return;
        }
      }

      const createResult = await tenantRepository.create({
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim() || undefined,
        parentId: form.parentId || undefined,
        adminEmail: form.adminEmail.trim(),
        adminUsername: form.adminUsername.trim() || undefined,
        editionId: form.editionId || undefined,
        subscriptionType: form.subscriptionType || "Lifetime",
        currency: form.currency || "USD",
        skipPayment: form.skipPayment || undefined,
        promotionId: form.promotionId || undefined,
        promoCode: form.promoCode || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setResult(createResult);

      toastSuccess({
        title: t("tenant.created") || "Tenant Created",
        description: t("tenant.createdDescription") || "The tenant has been created successfully.",
      });

      // Auto-navigate to tenant detail page after a brief delay
      setTimeout(() => {
        router.push(`/tenants/${createResult.tenantId}`);
      }, 2000);
    } catch (err) {
      appLogger.error("Failed to create tenant:", err);
      toastError({
        title: t("common.error") || "Error",
        description: err instanceof Error ? err.message : "Failed to create tenant.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, tenantRepository, queryClient, router, t, toastSuccess, toastError, isStepValid]);

  // ── Navigate to detail immediately ──
  const navigateToDetail = useCallback(() => {
    if (result) {
      router.push(`/tenants/${result.tenantId}`);
    }
  }, [result, router]);

  return {
    // Step
    currentStep,
    goNext,
    goBack,
    goToStep,
    canProceed,
    isStepValid,
    stepErrors,

    // Form
    form,
    updateField,
    setForm,

    // Edition & promotions
    selectedEdition,
    cachedEditions,
    handleSearchEditions,
    availablePromotions,
    isLoadingPromotions,

    // Submit
    isSubmitting,
    handleSubmit,
    result,
    navigateToDetail,
  };
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function generateCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 50);
}
