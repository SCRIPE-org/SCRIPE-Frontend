import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SignupThemeProvider } from "@core/providers/signup-theme";
import type { PasswordPolicyModel } from "@core/common/password-policy";
import { AccountStep } from "../AccountStep";
import { INITIAL_WIZARD_DATA } from "../../../../domain/constants/signupConstants";
import type { SignupWizardViewModel } from "../../../viewmodels/useSignupWizard";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (!params) return key;
      let msg = key;
      for (const [k, v] of Object.entries(params)) {
        msg = `${msg} ${k}=${v}`;
      }
      return msg;
    },
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
}));

function buildMockWizard(overrides?: Partial<SignupWizardViewModel>): SignupWizardViewModel {
  return {
    phase: "account",
    navigationDirection: 1,
    welcomeContent: undefined,
    isWelcomeLoading: false,
    isWelcomeError: false,
    retryWelcome: vi.fn(),
    discoveryAnswers: {},
    businessType: null,
    recommendation: undefined,
    isRecommendationLoading: false,
    isRecommendationError: false,
    selectedPlan: null,
    selectedBillingCycle: "annual",
    wizardData: {
      ...INITIAL_WIZARD_DATA,
      fullName: "Jane Doe",
      email: "jane@acme.test",
      password: "",
      acceptTerms: true,
      marketingOptIn: false,
      workspaceName: "",
      subdomain: "",
      username: "",
      defaultLocale: "en",
      currency: "USD",
      region: "US",
      emailVerificationToken: null,
    },
    updateField: vi.fn(),
    updatePassword: vi.fn(),
    passwordStrength: 0,
    passwordPolicy: {
      minLength: 14,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: true,
      requireSpecial: true,
      historyCount: 5,
      checkBreachedPasswords: true,
      expiryDays: 90,
    },
    isPasswordPolicyLoading: false,
    passwordPolicyError: null,
    retryPasswordPolicy: vi.fn(),
    error: "",
    isSubmitting: false,
    submitAccount: vi.fn(),
    otpCode: "",
    setOtpCode: vi.fn(),
    verifyOtp: vi.fn(),
    resendOtp: vi.fn(),
    otpResendCooldown: 0,
    otpSent: false,
    changeEmail: vi.fn(),
    checkSubdomain: vi.fn(),
    subdomainResult: null,
    isCheckingSubdomain: false,
    submitWorkspace: vi.fn(),
    checkoutMode: "free",
    submitRegister: vi.fn(),
    editPlan: vi.fn(),
    checkoutCanceled: false,
    dismissCheckoutCanceled: vi.fn(),
    provisioningStep: 0,
    submitContactSalesLead: vi.fn(),
    showResumeModal: false,
    pendingResumeInfo: null,
    resume: vi.fn(),
    changePlan: vi.fn(),
    startFresh: vi.fn(),
    goToLogin: vi.fn(),
    goToDiscovery: vi.fn(),
    selectPlan: vi.fn(),
    completeDiscovery: vi.fn(),
    next: vi.fn(),
    back: vi.fn(),
    goToPhase: vi.fn(),
    ...overrides,
  };
}

describe("Signup AccountStep dynamic PasswordPolicy integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces dynamic backend PasswordPolicyModel on submit without weak fallback", () => {
    const submitAccount = vi.fn();
    const policy: PasswordPolicyModel = {
      minLength: 14,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: true,
      requireSpecial: true,
      historyCount: 0,
      checkBreachedPasswords: false,
      expiryDays: null,
    };

    const wizard = buildMockWizard({
      passwordPolicy: policy,
      submitAccount,
      wizardData: {
        ...buildMockWizard().wizardData,
        password: "Short1!A",
      },
    });

    render(
      <SignupThemeProvider>
        <AccountStep wizard={wizard} />
      </SignupThemeProvider>
    );

    expect(screen.getByText(/common\.passwordPolicy\.minLength min=14/)).toBeInTheDocument();
    expect(screen.queryByText("common.passwordPolicy.lowercase")).not.toBeInTheDocument();

    fireEvent.submit(document.querySelector("form")!);
    expect(submitAccount).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("common.passwordPolicy.minLength min=14");
  });

  it("surfaces explicit policy error + retry and blocks submit when passwordPolicy failed to load", () => {
    const retryPasswordPolicy = vi.fn();
    const submitAccount = vi.fn();
    const wizard = buildMockWizard({
      passwordPolicy: null,
      passwordPolicyError: "common.passwordPolicy.loadFailed",
      retryPasswordPolicy,
      submitAccount,
      wizardData: {
        ...buildMockWizard().wizardData,
        password: "StrongPassword123!",
      },
    });

    render(
      <SignupThemeProvider>
        <AccountStep wizard={wizard} />
      </SignupThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "common.passwordPolicy.retryPolicy" }));
    expect(retryPasswordPolicy).toHaveBeenCalledTimes(1);

    fireEvent.submit(document.querySelector("form")!);
    expect(submitAccount).not.toHaveBeenCalled();
  });
});
