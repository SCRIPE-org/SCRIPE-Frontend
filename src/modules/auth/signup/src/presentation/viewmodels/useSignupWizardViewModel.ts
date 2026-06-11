"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { secureTokenService } from "@core/common/secure-token-service";
import { useAppStore } from "@core/store/useAppStore";
import { AuthMapper } from "@modules/auth/core/data/mappers/AuthMapper";
import { User } from "@modules/auth/core/domain/entities/User";
import { authContainer } from "@modules/auth/di";
import type {
  SignupWizardData,
  SubdomainCheckResult,
  SignupVerificationResult,
} from "../../domain/entities";

// ═══════════════════════════════════════════════════════════════════════════
// Signup Wizard Steps (plan-first flow per tenant-signup.md)
// ═══════════════════════════════════════════════════════════════════════════
export type SignupStep =
  | "plan" // Step 1: Choose edition/plan
  | "account" // Step 2: Name, email, password
  | "verification" // Step 3: Email OTP verification
  | "workspace" // Step 4: Org name, subdomain, region
  | "payment" // Step 5: Payment / trial confirmation
  | "provisioning" // Step 6: Creating tenant (progress)
  | "complete"; // Step 7: Done — redirect

const INITIAL_WIZARD_DATA: SignupWizardData = {
  editionId: null,
  billingCycle: null,
  currency: "USD",
  promoCode: "",
  fullName: "",
  email: "",
  password: "",
  acceptTerms: false,
  marketingOptIn: false,
  emailVerificationToken: null,
  workspaceName: "",
  subdomain: "",
  username: "",
  region: null,
  defaultLocale: "en",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function useSignupWizardViewModel() {
  const router = useRouter();
  const { signupRepository } = authContainer;
  const queryClient = useQueryClient();

  // ── Store actions (stable references) ──
  const setAuth = useAppStore((s) => s.setAuth);
  const setSubscriptionInfo = useAppStore((s) => s.setSubscriptionInfo);
  const setDefaultRedirectPath = useAppStore((s) => s.setDefaultRedirectPath);
  const setTenantCode = useAppStore((s) => s.setTenantCode);

  // ── State ──
  const [step, setStep] = useState<SignupStep>("plan");
  const [wizardData, setWizardData] = useState<SignupWizardData>(INITIAL_WIZARD_DATA);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // ── OTP State ──
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval>>(null);

  // ── Submission guards (prevent double-fire from React effects or UI) ──
  const isVerifyingOtpRef = useRef(false);
  const isProvisioningRef = useRef(false);

  // ── Subdomain Check ──
  const [subdomainResult, setSubdomainResult] = useState<SubdomainCheckResult | null>(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const subdomainDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // ── Password Strength ──
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ── Plan selection metadata ──
  const [selectedEditionName, setSelectedEditionName] = useState("");
  const [selectedTrialDays, setSelectedTrialDays] = useState<number | null>(null);
  const [selectedIsFree, setSelectedIsFree] = useState(false);

  // ── Provisioning progress ──
  const [provisioningStep, setProvisioningStep] = useState(0);

  // ════════════════════════════════════════════════════════════════════════
  // Field Updates
  // ════════════════════════════════════════════════════════════════════════
  const updateField = useCallback(
    <K extends keyof SignupWizardData>(field: K, value: SignupWizardData[K]) => {
      setWizardData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );

  // ════════════════════════════════════════════════════════════════════════
  // Password Strength Calculation
  // ════════════════════════════════════════════════════════════════════════
  const calcPasswordStrength = useCallback((password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setPasswordStrength(Math.min(score, 5));
  }, []);

  const updatePassword = useCallback(
    (value: string) => {
      updateField("password", value);
      calcPasswordStrength(value);
    },
    [updateField, calcPasswordStrength]
  );

  // ════════════════════════════════════════════════════════════════════════
  // Step 1 → 2: Select Plan
  // ════════════════════════════════════════════════════════════════════════
  const selectPlan = useCallback(
    (
      edition: { id: string; name: string; trialDays: number | null; checkoutMode: string },
      billingCycle: "monthly" | "annual"
    ) => {
      // Contact-sales editions cannot proceed through self-service signup
      if (edition.checkoutMode === "contact-sales") {
        // Open mailto or contact page — do NOT advance to account step
        const subject = encodeURIComponent(`Interest in ${edition.name} plan`);
        const body = encodeURIComponent(
          `Hi, I'm interested in the ${edition.name} plan. Please reach out to discuss pricing and onboarding.`
        );
        window.open(`mailto:sales@scripe.io?subject=${subject}&body=${body}`, "_blank");
        return;
      }

      const isFree = edition.checkoutMode === "self-service" && !edition.id;
      updateField("editionId", edition.id || null);
      updateField("billingCycle", billingCycle === "monthly" ? "Monthly" : "Annual");
      setSelectedEditionName(edition.name);
      setSelectedTrialDays(edition.trialDays);
      setSelectedIsFree(isFree);
      setStep("account");
    },
    [updateField]
  );

  // ════════════════════════════════════════════════════════════════════════
  // Step 2 → 3: Send OTP
  // ════════════════════════════════════════════════════════════════════════
  const submitAccount = useCallback(async () => {
    // Validate required fields
    if (!wizardData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!wizardData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (wizardData.password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (!wizardData.acceptTerms) {
      setError("You must accept the terms of service.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signupRepository.sendOtp(wizardData.email.trim().toLowerCase());
      if (result.sent) {
        setOtpSent(true);
        setStep("verification");
        startCooldown(result.retryAfterSeconds || 60);
      }
    } catch (err: unknown) {
      // Enumeration-safe: always show success to user
      setOtpSent(true);
      setStep("verification");
      startCooldown(60);
    } finally {
      setIsLoading(false);
    }
  }, [wizardData, signupRepository]);

  // ════════════════════════════════════════════════════════════════════════
  // Cooldown Timer
  // ════════════════════════════════════════════════════════════════════════
  const startCooldown = useCallback((seconds: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setOtpResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setOtpResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup cooldown interval on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // Step 3: Verify OTP
  // ════════════════════════════════════════════════════════════════════════
  const verifyOtp = useCallback(async () => {
    // Guard: prevent double-submission from useEffect auto-fire (OTP race condition)
    if (isVerifyingOtpRef.current) return;

    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    isVerifyingOtpRef.current = true;
    setIsLoading(true);
    setError("");

    try {
      const result: SignupVerificationResult = await signupRepository.verifyOtp(
        wizardData.email.trim().toLowerCase(),
        otpCode
      );

      if (result.isValid && result.verificationToken) {
        updateField("emailVerificationToken", result.verificationToken);
        // Clear OTP code so the auto-submit useEffect cannot re-fire after step transition
        setOtpCode("");
        setStep("workspace");
      } else {
        setError(result.error || "Invalid or expired code. Please try again.");
        // Release guard on failure so the user can retry
        isVerifyingOtpRef.current = false;
      }
    } catch {
      setError("Verification failed. Please try again.");
      isVerifyingOtpRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [otpCode, wizardData.email, signupRepository, updateField]);

  // ════════════════════════════════════════════════════════════════════════
  // Resend OTP
  // ════════════════════════════════════════════════════════════════════════
  const resendOtp = useCallback(async () => {
    if (otpResendCooldown > 0) return;

    setIsLoading(true);
    try {
      const result = await signupRepository.sendOtp(wizardData.email.trim().toLowerCase());
      startCooldown(result.retryAfterSeconds || 60);
      setOtpCode("");
    } catch {
      // Enumeration-safe: silently succeed
      startCooldown(60);
    } finally {
      setIsLoading(false);
    }
  }, [otpResendCooldown, signupRepository, wizardData.email, startCooldown]);

  // ════════════════════════════════════════════════════════════════════════
  // Step 4: Subdomain Check (debounced)
  // ════════════════════════════════════════════════════════════════════════
  const checkSubdomain = useCallback(
    (subdomain: string) => {
      updateField("subdomain", subdomain);
      setSubdomainResult(null);

      if (subdomainDebounceRef.current) clearTimeout(subdomainDebounceRef.current);

      if (subdomain.length < 3) return;

      // Validate format locally first
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdomain)) {
        setSubdomainResult({
          available: false,
          suggestion: null,
          reason: "invalid_format",
        });
        return;
      }

      setIsCheckingSubdomain(true);
      subdomainDebounceRef.current = setTimeout(async () => {
        try {
          const result = await signupRepository.checkSubdomain(subdomain);
          setSubdomainResult(result);
        } catch {
          // Fail open — let server-side validate on submit
        } finally {
          setIsCheckingSubdomain(false);
        }
      }, 500);
    },
    [updateField, signupRepository]
  );

  // ════════════════════════════════════════════════════════════════════════
  // Step 4 → 5: Submit Workspace + Register
  // ════════════════════════════════════════════════════════════════════════
  const submitWorkspace = useCallback(async () => {
    if (!wizardData.workspaceName.trim()) {
      setError("Please enter your workspace name.");
      return;
    }
    if (wizardData.subdomain.length < 3) {
      setError("Subdomain must be at least 3 characters.");
      return;
    }
    if (subdomainResult && !subdomainResult.available) {
      setError("Please choose an available subdomain.");
      return;
    }
    if (!wizardData.emailVerificationToken) {
      setError("Email verification expired. Please go back and verify again.");
      return;
    }

    // If free or trial, skip payment and go directly to provisioning
    // Otherwise, the payment step calls submitWorkspace after payment logic
    setStep("payment");
  }, [wizardData, subdomainResult]);

  // ════════════════════════════════════════════════════════════════════════
  // Step 5 → 6: Start Provisioning (called from PaymentStep)
  // ════════════════════════════════════════════════════════════════════════
  const startProvisioning = useCallback(async () => {
    // Guard: prevent double-registration if called twice (e.g. React StrictMode)
    if (isProvisioningRef.current) return;
    isProvisioningRef.current = true;

    setStep("provisioning");
    setProvisioningStep(0);
    setError("");

    try {
      // Simulate provisioning progress steps for a polished UX
      setProvisioningStep(1);
      await new Promise((resolve) => setTimeout(resolve, 400));

      setProvisioningStep(2);

      const result = await signupRepository.register({
        editionId: wizardData.editionId,
        billingCycle: wizardData.billingCycle,
        currency: wizardData.currency || undefined,
        promoCode: wizardData.promoCode || undefined,
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
        defaultLocale: wizardData.defaultLocale,
        timezone: wizardData.timezone,
      });

      setProvisioningStep(3);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // ── 1. Store access token in memory (in-memory only, security-first) ──
      secureTokenService.setAccessToken(result.accessToken);
      // Note: refresh token is NOT in result — it was stripped by CookieAuthMiddleware
      // and placed in an httpOnly cookie automatically. No client-side storage needed.

      // ── 2. Hydrate the auth store — exactly mirroring the login flow ────────
      // Map the AdminResponse userProfile to a User domain entity.
      // Fallback: if the backend returns a null profile (should never happen),
      // construct a minimal User from the wizard data so auth state is always set.
      const user =
        AuthMapper.userFromUnknown(result.userProfile) ??
        new User({
          id: "",
          username: wizardData.email.split("@")[0] || "user",
          firstName: wizardData.fullName.split(" ")[0] || "",
          lastName: wizardData.fullName.split(" ").slice(1).join(" ") || "",
          phoneNumber: "",
          adminTypeName: "",
        });

      // Set auth state with isFreshLogin=true so DashboardLayout shows the
      // premium welcome loader ("Getting everything ready") after redirect
      setAuth(user, user.permissions ?? [], [], true);

      // Persist tenant code for tenant-aware logout redirect (matches login flow)
      if (result.tenantCode) {
        setTenantCode(result.tenantCode);
      }

      // New tenants have no subscription status yet — the edition assignment
      // happens server-side after registration. Start clean.
      setSubscriptionInfo(null, null, null);

      // Store the backend-provided redirect path as the authoritative destination
      setDefaultRedirectPath(result.redirectUrl || "/");

      // ── 3. Invalidate all cached queries so the dashboard loads fresh data ──
      queryClient.invalidateQueries();

      setProvisioningStep(4);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStep("complete");

      // ── 4. Navigate to root — RouteGuard sees isAuthenticated=true and
      // DashboardLayout shows the welcome loader until everything is ready ──
      setTimeout(() => {
        router.replace(result.redirectUrl || "/");
      }, 1500);
    } catch (err: unknown) {
      // Reset guard on failure so the user can retry
      isProvisioningRef.current = false;
      setStep("workspace");
      const message = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(message);
    }
  }, [wizardData, signupRepository, router, setAuth, setSubscriptionInfo, setDefaultRedirectPath, setTenantCode, queryClient]);

  // ════════════════════════════════════════════════════════════════════════
  // Navigation
  // ════════════════════════════════════════════════════════════════════════
  const goBack = useCallback(() => {
    setError("");
    switch (step) {
      case "account":
        setStep("plan");
        break;
      case "verification":
        setStep("account");
        break;
      case "workspace":
        setStep("verification");
        break;
      case "payment":
        setStep("workspace");
        break;
      default:
        break;
    }
  }, [step]);

  const goToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  return {
    // State
    step,
    wizardData,
    error,
    isLoading,

    // OTP
    otpCode,
    setOtpCode,
    otpSent,
    otpResendCooldown,

    // Subdomain
    subdomainResult,
    isCheckingSubdomain,

    // Password
    passwordStrength,

    // Provisioning
    provisioningStep,

    // Plan selection metadata
    selectedEditionName,
    selectedTrialDays,
    selectedIsFree,

    // Actions
    updateField,
    updatePassword,
    selectPlan,
    submitAccount,
    verifyOtp,
    resendOtp,
    checkSubdomain,
    submitWorkspace,
    startProvisioning,
    goBack,
    goToLogin,
  };
}
