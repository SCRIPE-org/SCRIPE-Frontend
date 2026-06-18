"use client";

// ═══════════════════════════════════════════════════════════════════════════
// useSignupProvisioning — Registration + Post-Signup Flow
//
// Owns: isProvisioningRef (prevents double-fire).
// Handles:
//   "active" mode  → free flow: visual provisioning steps → auth hydration → dashboard
//   "checkout" mode → paid/trial: persist state + signupRef → Stripe redirect
//   Contact Sales  → submit lead form
//
// Design:
//  - isProvisioningRef guards against double-submission (e.g., StrictMode).
//  - Password is NEVER persisted in sessionStorage.
//  - The signupRef token is stored for the finalize page's polling.
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { secureTokenService } from "@core/common/secure-token-service";
import { useAppStore } from "@core/store/useAppStore";
import { User } from "@modules/auth/core/domain/entities/User";
import type {
  ISignupRepository,
  ContactSalesPayload,
} from "../../../domain/interfaces/ISignupRepository";
import type { SignupStep, SignupWizardData, SelectedPlan } from "../../../domain/entities";

interface UseSignupProvisioningOptions {
  repository: ISignupRepository;
  wizardData: SignupWizardData;
  selectedPlan: SelectedPlan | null;
  language: string;
  setStep: (step: SignupStep) => void;
  setError: (msg: string) => void;
  setIsLoading: (v: boolean) => void;
  setProvisioningStep: (n: number) => void;
}

export function useSignupProvisioning({
  repository,
  wizardData,
  selectedPlan,
  language,
  setStep,
  setError,
  setIsLoading,
  setProvisioningStep,
}: UseSignupProvisioningOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const setAuth = useAppStore((s) => s.setAuth);
  const setSubscriptionInfo = useAppStore((s) => s.setSubscriptionInfo);
  const setDefaultRedirectPath = useAppStore((s) => s.setDefaultRedirectPath);
  const setTenantCode = useAppStore((s) => s.setTenantCode);

  const isProvisioningRef = useRef(false);

  // ── Registration (Review step → confirm button) ──────────────────────────
  const startProvisioning = useCallback(async () => {
    if (isProvisioningRef.current) return;
    isProvisioningRef.current = true;

    const isFreeFlow = (selectedPlan?.checkoutMode ?? "free") === "free";

    if (isFreeFlow) {
      setStep("provisioning");
      setProvisioningStep(0);
    } else {
      setIsLoading(true);
    }
    setError("");

    try {
      if (isFreeFlow) {
        setProvisioningStep(1);
        await new Promise((resolve) => setTimeout(resolve, 400));
        setProvisioningStep(2);
      }

      // ── CHANGE-PLAN path: existing tenant already awaiting payment ────────
      // If a signupRef is already in sessionStorage and the session is still
      // awaiting_payment, reuse the existing tenant by calling changePlan
      // instead of register (which would create a second tenant).
      if (!isFreeFlow && wizardData.editionId) {
        const existingRef = repository.getPersistedSignupRef();
        if (existingRef) {
          try {
            const statusResult = await repository.getStatus(existingRef);
            if (statusResult.status === "awaiting_payment") {
              const billingCycleStr = wizardData.billingCycle === "Annual" ? "yearly" : "monthly";
              const changePlanResult = await repository.changePlan({
                signupRef: existingRef,
                newEditionId: wizardData.editionId,
                billingCycle: billingCycleStr,
                currency: wizardData.currency || "USD",
              });

              const { password: _pw, ...safeData } = wizardData;
              repository.persistWizardState({ step: "review", wizardData: safeData, selectedPlan });

              window.location.href = changePlanResult.checkoutUrl;
              return;
            }
          } catch {
            // Status check failed — fall through to normal register
          }
        }
      }

      const result = await repository.register({
        editionId: wizardData.editionId,
        billingCycle: wizardData.billingCycle,
        currency: wizardData.currency || undefined,
        fullName: wizardData.fullName.trim(),
        email: wizardData.email.trim().toLowerCase(),
        password: wizardData.password,
        acceptTerms: wizardData.acceptTerms,
        marketingOptIn: wizardData.marketingOptIn,
        emailVerificationToken: wizardData.emailVerificationToken ?? "",
        workspaceName: wizardData.workspaceName.trim(),
        subdomain: wizardData.subdomain.toLowerCase(),
        username: wizardData.username.trim() || undefined,
        region: wizardData.region,
        defaultLocale: language === "ar" ? "ar" : "en",
        timezone: wizardData.timezone,
        businessType: wizardData.businessType || undefined,
        teamSize: wizardData.teamSize || undefined,
        primaryPriority: wizardData.primaryPriority || undefined,
      });

      // ── CHECKOUT MODE: hand off to Stripe ───────────────────────────────
      if (result.mode === "checkout") {
        if (!result.checkoutUrl || !result.signupRef) {
          throw new Error(t("signup.errors.signupFailed") || "Signup failed. Please try again.");
        }

        // Store ref for finalize page (survives Stripe round-trip)
        repository.persistSignupRef(result.signupRef);

        // Persist wizard state for cancel-url restoration (no password)
        const { password: _password, ...safeData } = wizardData;
        repository.persistWizardState({ step: "review", wizardData: safeData, selectedPlan });

        window.location.href = result.checkoutUrl;
        return; // navigation in flight — do not touch state
      }

      // ── ACTIVE MODE (free): tokens issued immediately ────────────────────
      secureTokenService.setAccessToken(result.accessToken ?? "");

      const user =
        result.user ??
        new User({
          id: "",
          username: wizardData.email.split("@")[0] || "user",
          firstName: wizardData.fullName.split(" ")[0] || "",
          lastName: wizardData.fullName.split(" ").slice(1).join(" ") || "",
          phoneNumber: "",
          adminTypeName: "",
        });

      setAuth(user, user.permissions ?? [], [], true);
      if (result.tenantCode) setTenantCode(result.tenantCode);
      setSubscriptionInfo(null, null, null);
      setDefaultRedirectPath(result.redirectUrl || "/");
      // Clear stale query cache — do NOT use invalidateQueries() here because
      // it triggers immediate refetches before the refresh-token cookie is
      // fully established, causing 401 → logout race conditions. clear()
      // simply wipes old data; fresh queries will fire when the dashboard mounts.
      queryClient.clear();

      setProvisioningStep(4);
      await new Promise((resolve) => setTimeout(resolve, 500));

      repository.clearPersistedWizardState();
      setStep("complete");

      setTimeout(() => {
        router.replace(result.redirectUrl || "/");
      }, 1500);
    } catch (err: unknown) {
      isProvisioningRef.current = false;
      setIsLoading(false);
      setStep(isFreeFlow ? "workspace" : "review");
      const message =
        err instanceof Error
          ? err.message
          : t("signup.errors.signupFailed") || "Signup failed. Please try again.";
      setError(message);
    }
  }, [
    wizardData,
    selectedPlan,
    language,
    repository,
    router,
    queryClient,
    setAuth,
    setSubscriptionInfo,
    setDefaultRedirectPath,
    setTenantCode,
    setStep,
    setError,
    setIsLoading,
    setProvisioningStep,
    t,
  ]);

  // ── Contact Sales ─────────────────────────────────────────────────────────
  const submitContactSales = useCallback(
    async (
      form: Omit<ContactSalesPayload, "editionId" | "businessType" | "teamSize" | "primaryPriority">
    ): Promise<boolean> => {
      setIsLoading(true);
      setError("");
      try {
        await repository.submitContactSales({
          ...form,
          editionId: wizardData.editionId,
          businessType: wizardData.businessType || null,
          teamSize: wizardData.teamSize || null,
          primaryPriority: wizardData.primaryPriority || null,
        });
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      wizardData.editionId,
      wizardData.businessType,
      wizardData.teamSize,
      wizardData.primaryPriority,
      repository,
      setIsLoading,
      setError,
    ]
  );

  return {
    startProvisioning,
    submitContactSales,
  };
}
