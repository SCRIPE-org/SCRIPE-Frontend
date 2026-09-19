// FILE-EXCEPTION: file length
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

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { identityContainer } from "@modules/identity/di";
import { appLogger } from "@core/common/logger";
import type { CreateTenantResult } from "../../domain/entities/TenantRequests";
import type { EditionThinModel } from "../../domain/types/SubscriptionTypes";
import type { Permission } from "@modules/identity/core";
import {
  COUNTRIES,
  getDefaultTimeZoneForCountry,
  getDefaultCurrencyForCountry,
} from "@core/constants/countries";
import {
  getGeoTerritory,
  validatePostalCode,
  formatInternationalAddress,
} from "@core/constants/geo-territories";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for stepper form state.
 */
export interface StepperFormState {
  // Step 1: Organization
  name: string;
  code: string;
  organizationType: string;
  description: string;
  // Step 1: Structured Location & Geography
  countryCode: string;
  timeZone: string;
  state: string; // Governorate / Province / Emirate / State / Region
  city: string;
  district: string; // Neighborhood / Sub-District / الحي
  street: string;
  postalCode: string;
  address: string;
  parentId: string;
  // Step 2: Administrator
  adminEmail: string;
  adminUsername: string;
  adminFullName: string;
  adminPhone: string;
  // Step 3: Plan & Billing
  editionId: string;
  subscriptionType: string;
  currency: string;
  skipPayment: boolean;
  promotionId: string;
  promoCode: string;
  availablePermissionIds: string[];
}

/**
 * Exported constant defining parameters and fields for initial stepper form configurations.
 */
export const INITIAL_STEPPER_FORM: StepperFormState = {
  name: "",
  code: "",
  organizationType: "academy",
  description: "",
  countryCode: "SA",
  timeZone: "Asia/Riyadh",
  state: "",
  city: "",
  district: "",
  street: "",
  postalCode: "",
  address: "",
  parentId: "",
  adminEmail: "",
  adminUsername: "",
  adminFullName: "",
  adminPhone: "",
  editionId: "",
  subscriptionType: "",
  currency: "SAR",
  skipPayment: false,
  promotionId: "",
  promoCode: "",
  availablePermissionIds: [],
};

/**
 * Exported constant defining parameters and fields for s t e p s configurations.
 */
export const STEPS = [
  { id: 1, key: "organization" },
  { id: 2, key: "administrator" },
  { id: 3, key: "plan" },
] as const;

/**
 * Exported type defining parameters and fields for step id configurations.
 */
export type StepId = (typeof STEPS)[number]["id"];

// ─────────────────────────────────────────
// ViewModel
// ─────────────────────────────────────────

interface UseCreateTenantViewModelParams {
  /** Pre-fill parent tenant ID (e.g. from query param) */
  defaultParentId?: string;
}

/**
 * React hook/ViewModel orchestrating state and data flows for create tenant view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useCreateTenantViewModel(params: UseCreateTenantViewModelParams = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const { tenantRepository } = identityContainer;

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

  // ── Compute enabled subscription types for selected edition ──
  const enabledSubscriptionTypes = useMemo(() => {
    const edition = cachedEditions.find((e) => e.id === form.editionId);
    if (!edition) {
      // No edition selected -> show all types
      return [
        { value: "Lifetime", enabled: true },
        { value: "Monthly", enabled: true },
        { value: "Yearly", enabled: true },
        { value: "Trial", enabled: true },
      ];
    }
    // Free editions need no billing selection - subscription is auto-created as Lifetime/$0
    if (edition.isFree === true) {
      return [];
    }
    const types: { value: string; enabled: boolean }[] = [];
    if (edition.allowLifetime !== false) types.push({ value: "Lifetime", enabled: true });
    if (edition.allowMonthly !== false) types.push({ value: "Monthly", enabled: true });
    if (edition.allowYearly !== false) types.push({ value: "Yearly", enabled: true });
    if (edition.allowTrial !== false) types.push({ value: "Trial", enabled: true });
    return types;
  }, [cachedEditions, form.editionId]);

  // Track previous editionId to detect changes
  const prevEditionIdRef = useRef(form.editionId);

  // ── Promotion query ──
  const { data: promotionsRaw = [], isLoading: isLoadingPromotions } = useQuery({
    queryKey: ["entitlements", "editions", form.editionId, "promotions"],
    queryFn: () => tenantRepository.getEditionPromotions(form.editionId),
    enabled: !!form.editionId && currentStep === 3,
  });

  // ── Creation permissions query (for availablePermissionIds picker) ──
  const { data: creationPermissions = [], isLoading: isLoadingPermissions } = useQuery<
    Permission[]
  >({
    queryKey: ["tenants", "creation-permissions", form.parentId || "root"],
    queryFn: () => tenantRepository.getCreationPermissions(form.parentId || undefined),
    enabled: currentStep === 3,
    staleTime: 60_000,
  });

  const availablePromotions = useMemo(() => {
    return promotionsRaw
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
        id: p.id,
        name: p.name,
        type: p.type,
        discountValue: p.discountValue,
        requiresCode: p.requiresCode,
        code: p.promoCode || "",
      }));
  }, [promotionsRaw, form.subscriptionType]);

  // ── Update Field Logic ──
  const updateField = useCallback(
    <K extends keyof StepperFormState>(field: K, value: StepperFormState[K]) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        // Auto-generate code from name (only if user hasn't manually edited code)
        if (field === "name" && (!prev.code || prev.code === generateCode(prev.name))) {
          next.code = generateCode(value as string);
        }
        // Auto-generate username from code
        if (
          field === "code" &&
          (!prev.adminUsername || prev.adminUsername === `${prev.code}_admin`)
        ) {
          next.adminUsername = `${(value as string).toLowerCase()}_admin`;
        }
        // When countryCode changes, cascade default timezone, currency, and reset geographic subdivisions
        if (field === "countryCode" && value) {
          const cCode = value as string;
          next.timeZone = getDefaultTimeZoneForCountry(cCode);
          next.currency = getDefaultCurrencyForCountry(cCode);
          next.state = "";
          next.city = "";
          next.district = "";
          next.postalCode = "";
        }
        // When state changes, reset dependent city and district
        if (field === "state") {
          next.city = "";
          next.district = "";
        }
        // Auto-compose address from street, district, city, state, postalCode, and country
        if (
          field === "street" ||
          field === "district" ||
          field === "city" ||
          field === "state" ||
          field === "postalCode" ||
          field === "countryCode"
        ) {
          const str = field === "street" ? (value as string) : next.street;
          const dst = field === "district" ? (value as string) : next.district;
          const ct = field === "city" ? (value as string) : next.city;
          const st = field === "state" ? (value as string) : next.state;
          const pc = field === "postalCode" ? (value as string) : next.postalCode;
          const cc = field === "countryCode" ? (value as string) : next.countryCode;

          const countryObj = COUNTRIES.find((c) => c.code === cc);
          const territory = getGeoTerritory(cc);
          const stateObj = territory.states.find((s) => s.code === st || s.name === st);
          const stateDisplay = stateObj ? stateObj.name : st;

          next.address = formatInternationalAddress({
            street: str,
            district: dst,
            city: ct,
            state: stateDisplay,
            postalCode: pc,
            countryName: countryObj?.name,
          });
        }
        // When edition changes, reset subscriptionType to the first enabled type
        if (field === "editionId" && value !== prevEditionIdRef.current) {
          prevEditionIdRef.current = value as string;
          // We'll defer the subscriptionType reset to after cachedEditions update
          next.subscriptionType = "";
          next.promotionId = "";
          next.promoCode = "";
        }
        // Clear promotionId if manual promo code is typed (to untoggle badge if different code)
        if (field === "promoCode" && prev.promotionId) {
          const selectedPromo = availablePromotions.find((p) => p.id === prev.promotionId);
          if (selectedPromo && selectedPromo.code !== value) {
            next.promotionId = "";
          }
        }
        return next;
      });
    },
    [availablePromotions]
  );

  // ── Selected edition info ──
  const selectedEdition = useMemo(
    () => cachedEditions.find((e) => e.id === form.editionId),
    [cachedEditions, form.editionId]
  );

  // ── Auto-select first enabled subscription type when edition changes and type is empty ──
  // This runs when cachedEditions update after edition search completes
  useEffect(() => {
    if (form.editionId && !form.subscriptionType && enabledSubscriptionTypes.length > 0) {
      const firstEnabled = enabledSubscriptionTypes[0]?.value;
      if (firstEnabled) {
        setForm((prev) => ({ ...prev, subscriptionType: firstEnabled }));
      }
    }
  }, [form.editionId, form.subscriptionType, enabledSubscriptionTypes]);

  // ── Edition search ──
  // Contact-Sales-only editions are excluded here: they have no billing type an
  // admin can pick in this wizard (Allow* flags are all false by design) and
  // require a negotiated price, which this stepper doesn't collect. Assigning
  // one without an explicit type/price fails server-side and previously left
  // tenants created with no subscription. Use "Convert Lead to Tenant" for
  // Contact-Sales / enterprise deals instead.
  const handleSearchEditions = useCallback(
    async (query: string) => {
      try {
        const res = await tenantRepository.getAvailableEditions(1, 10, query);
        const assignable = res.items.filter((ed) => !ed.isContactSalesOnly);
        setCachedEditions((prev) => {
          const merged = [...prev];
          for (const ed of assignable) {
            if (!merged.find((e) => e.id === ed.id)) merged.push(ed);
          }
          return merged;
        });
        return assignable.map((ed) => ({ value: ed.id, label: ed.name }));
      } catch (err) {
        appLogger.error("Failed to search editions:", err);
        return [];
      }
    },
    [tenantRepository]
  );

  // Eagerly fetch initial editions on mount so options are available immediately
  useEffect(() => {
    handleSearchEditions("");
  }, [handleSearchEditions]);

  // ── Step validation ──
  const [stepTouched, setStepTouched] = useState<Record<StepId, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const stepErrors = useMemo(() => {
    const errors: Record<StepId, string[]> = { 1: [], 2: [], 3: [] };
    // Step 1
    if (!form.name.trim()) errors[1].push("name");
    if (!form.code.trim()) errors[1].push("code");
    if (!form.countryCode.trim()) errors[1].push("countryCode");
    if (!form.timeZone.trim()) errors[1].push("timeZone");

    const territory = getGeoTerritory(form.countryCode);
    if (territory.states.length > 0 && !form.state.trim()) {
      errors[1].push("state");
    }
    if (!form.city.trim()) {
      errors[1].push("city");
    }
    if (form.postalCode.trim()) {
      if (!validatePostalCode(form.countryCode, form.postalCode)) {
        errors[1].push("postalCode");
      }
    } else if (territory.postalCodeRequired) {
      errors[1].push("postalCodeRequired");
    }
    // Step 2
    if (!form.adminEmail.trim()) errors[2].push("adminEmail");
    if (form.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
      errors[2].push("adminEmailFormat");
    }
    // Step 3 — Edition is required by CreateTenantCommandValidator
    if (!form.editionId?.trim()) errors[3].push("editionId");
    return errors;
  }, [form]);

  const isStepValid = useCallback((step: StepId) => stepErrors[step].length === 0, [stepErrors]);

  const canProceed = useMemo(() => isStepValid(currentStep), [isStepValid, currentStep]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    // Mark current step as touched so validation errors display
    setStepTouched((prev) => ({ ...prev, [currentStep]: true }));
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
            title: t("tenant.invalidPromoCode"),
            description: t(`tenant.promoCodeError.${errorCode}`),
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
        address: form.address.trim() || undefined,
        countryCode: form.countryCode.trim() || undefined,
        timeZone: form.timeZone.trim() || undefined,
        parentId: form.parentId || undefined,
        adminEmail: form.adminEmail.trim(),
        adminUsername: form.adminUsername.trim() || undefined,
        editionId: form.editionId || undefined,
        subscriptionType: form.subscriptionType || undefined,
        currency: form.currency || "USD",
        skipPayment: form.skipPayment || undefined,
        promotionId: form.promotionId || undefined,
        promoCode: form.promoCode || undefined,
        availablePermissionIds:
          form.availablePermissionIds.length > 0 ? form.availablePermissionIds : undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setResult(createResult);

      toastSuccess({
        title: t("tenant.created"),
        description: t("tenant.createdDescription"),
      });
    } catch (err) {
      appLogger.error("Failed to create tenant:", err);
      toastError({
        title: t("common.error"),
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
    stepTouched,

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
    enabledSubscriptionTypes,

    // Creation permissions (for availablePermissionIds picker)
    creationPermissions,
    isLoadingPermissions,

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

/** Exported type alias for components to reference the ViewModel shape */
export type CreateTenantVM = ReturnType<typeof useCreateTenantViewModel>;
