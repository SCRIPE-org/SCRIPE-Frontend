"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";
import { PlanPickerStep } from "../components/PlanPickerStep";
import { AccountStep } from "../components/AccountStep";
import { VerificationStep } from "../components/VerificationStep";
import { WorkspaceStep } from "../components/WorkspaceStep";
import { PaymentStep } from "../components/PaymentStep";
import { ProvisioningStep } from "../components/ProvisioningStep";
import { CompleteStep } from "../components/CompleteStep";
import { SignupStepper } from "../components/SignupStepper";

/**
 * SignupView — Self-Service Tenant Signup Wizard
 *
 * 7-step wizard following the Scripe design system (tenant-signup.md):
 *   Step 1: Plan (choose edition)
 *   Step 2: Account (name, email, password)
 *   Step 3: Email verification (6-digit OTP)
 *   Step 4: Workspace (org name, subdomain)
 *   Step 5: Payment (trial/free/paid)
 *   Step 6: Provisioning (animated progress)
 *   Step 7: Complete (success + redirect)
 *
 * Design: Scripe vault aesthetic, brand gradient, motion system
 * Per design.md, motion.md, responsive.md, accessibility.md
 */
export function SignupView() {
  const vm = useSignupWizardViewModel();
  const { t, direction } = useI18n();

  // Interactive steps for the stepper (exclude provisioning + complete)
  const stepperSteps = useMemo(
    () => [
      { key: "plan", label: t("signup.steps.plan") || "Plan" },
      { key: "account", label: t("signup.steps.account") || "Account" },
      { key: "verification", label: t("signup.steps.verify") || "Verify" },
      { key: "workspace", label: t("signup.steps.workspace") || "Workspace" },
      { key: "payment", label: t("signup.steps.payment") || "Payment" },
    ],
    [t]
  );

  const showStepper =
    vm.step !== "provisioning" && vm.step !== "complete";

  // Wider card for plan picker
  const isWideStep = vm.step === "plan";

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      dir={direction}
      style={{
        background: "var(--sx-bg, #06060E)",
        backgroundImage:
          "radial-gradient(140% 90% at 25% 25%, #1A1140 0%, #0A0820 40%, #06060E 80%, #04040A 100%)",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none fixed left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="pointer-events-none fixed right-1/4 bottom-1/4 translate-x-1/2 translate-y-1/2"
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Logo */}
      <div className="mb-8 sx-rise" style={{ animation: "sxRise 0.5s ease-out" }}>
        <img src="/app-logo.png" alt={BRAND.name} className="h-10 w-auto" />
      </div>

      {/* Stepper */}
      {showStepper && (
        <div style={{ animation: "sxRise 0.5s ease-out 0.1s both" }}>
          <SignupStepper currentStep={vm.step} steps={stepperSteps} />
        </div>
      )}

      {/* Card container */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl ${
          isWideStep ? "max-w-2xl" : "max-w-md"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))",
          border: "1px solid rgba(168,85,247,.22)",
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,.5), 0 0 80px -20px rgba(168,85,247,.15)",
        }}
      >
        <div key={vm.step} className="p-8 sx-screen" style={{ animation: "sxScreenIn 0.4s ease-out" }}>
          {vm.step === "plan" && (
            <PlanPickerStep onSelectPlan={vm.selectPlan} />
          )}
          {vm.step === "account" && <AccountStep vm={vm} />}
          {vm.step === "verification" && <VerificationStep vm={vm} />}
          {vm.step === "workspace" && <WorkspaceStep vm={vm} />}
          {vm.step === "payment" && (
            <PaymentStep
              vm={{
                wizardData: {
                  editionId: vm.wizardData.editionId,
                  billingCycle: vm.wizardData.billingCycle,
                  promoCode: vm.wizardData.promoCode,
                },
                isLoading: vm.isLoading,
                error: vm.error,
                updateField: vm.updateField as (field: string, value: unknown) => void,
                submitWorkspace: vm.startProvisioning,
                goBack: vm.goBack,
              }}
              editionName={vm.selectedEditionName}
              trialDays={vm.selectedTrialDays}
              isFree={vm.selectedIsFree}
            />
          )}
          {vm.step === "provisioning" && <ProvisioningStep vm={vm} />}
          {vm.step === "complete" && <CompleteStep vm={vm} />}
        </div>
      </div>

      {/* Footer */}
      <p
        className="mt-8 text-center text-[11px] font-medium"
        style={{ color: "rgba(245,242,255,0.35)" }}
      >
        © {new Date().getFullYear()} {BRAND.name} — All rights reserved
      </p>
    </div>
  );
}

export default SignupView;
