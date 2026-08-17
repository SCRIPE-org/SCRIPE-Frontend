"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "@modules/custom-fields/custom-field/src/presentation/renderCustomFieldControl";
import type { CreateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";

/**
 * Registered in the backend's EntitlementsEntityTypeCatalog -- must match
 * exactly, and matches useTenantPlansViewModel's configBase.entityTypeKey
 * (that screen's own modal never actually mounts Custom Fields, since Create/
 * Edit both navigate to this wizard instead; this is the real integration
 * point). Shared by useTenantPlanEditViewModel too (imported from here) so
 * the two wizards can never drift onto two different key strings.
 */
export const TENANT_PLAN_ENTITY_TYPE_KEY = "entitlements.tenant-plan";

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

  // ─── Custom Fields ───────────────────────────────────────
  // No ownerId yet -- a new plan has no id until create() resolves, so this
  // always fetches definitions only (no stored values to merge in).
  const customFieldsQuery = useCustomFieldsFormFields(TENANT_PLAN_ENTITY_TYPE_KEY, undefined);

  // Keyed by the field's namespaced name (e.g. "__cf__nationality"), holding
  // only values the user has actively edited this session -- an untouched
  // field falls back to its fetched defaultValue at save time (see
  // saveCustomFieldValues below) rather than being seeded into this state.
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = (name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  // Full-resubmit, matching GenericCrudView's own contract: every currently
  // known custom field's effective value (edited-this-session or the fetched
  // default) is sent, not just the ones the user touched -- saveValues is a
  // full-replace of the owner's value set.
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
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.name) throw new Error("Name is required");
      return tenantPlanRepository.create(form as CreateTenantPlanRequest);
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error"),
        description: err?.message || "Failed to create plan.",
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
      let newPlanId: string;
      try {
        newPlanId = await createMutation.mutateAsync();
      } catch {
        return; // createMutation's onError already toasted
      }
      try {
        await saveCustomFieldValues(newPlanId);
      } catch (err) {
        showError({
          title: t("common.error"),
          description:
            err instanceof CustomFieldValidationError
              ? err.message
              : t("entitlements.tenantPlans.customFieldsSaveError"),
        });
        return; // the plan itself was created -- don't pretend the whole save succeeded
      }
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans"] });
      success({
        title: t("entitlements.tenantPlans.created"),
        description: t("entitlements.tenantPlans.createdDesc"),
      });
      router.push(`/entitlements/tenant-plans/${newPlanId}`);
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
    error: createMutation.error,
    customFieldConfigs: customFieldsQuery.fieldConfigs,
    customFieldsLoading: customFieldsQuery.isLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields: customFieldsQuery.refetch,
  };
}
