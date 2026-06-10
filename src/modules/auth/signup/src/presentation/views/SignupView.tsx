"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { Button } from "@core/ui/button";
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
 * Step 1 (Plan) renders as a FULL-PAGE pricing layout (like Google One, Vercel, Render).
 * Steps 2-7 render inside a centered card container.
 */
export function SignupView() {
  const vm = useSignupWizardViewModel();
  const { t, direction } = useI18n();

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

  const isPlanStep = vm.step === "plan";
  const showStepper = vm.step !== "provisioning" && vm.step !== "complete";

  // ═══════════════════════════════════════════════════════════════════════════
  //  PLAN STEP → Full-page pricing layout (no card container)
  // ═══════════════════════════════════════════════════════════════════════════
  if (isPlanStep) {
    return (
      <div
        className="min-h-screen"
        dir={direction}
        style={{
          background: "var(--sx-bg, #06060E)",
          backgroundImage:
            "radial-gradient(140% 90% at 25% 25%, #1A1140 0%, #0A0820 40%, #06060E 80%, #04040A 100%)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none fixed left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="pointer-events-none fixed bottom-1/3 right-1/4 translate-x-1/2"
          style={{
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Top bar: Logo + Stepper */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between gap-4 px-6 py-4"
          style={{
            background: "rgba(6,6,14,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex-1 flex items-center justify-start">
            <img src="/app-logo.png" alt={BRAND.name} className="h-11 w-auto" />
          </div>
          {showStepper && (
            <div className="flex items-center justify-center">
              <SignupStepper
                currentStep={vm.step}
                steps={stepperSteps}
                className="flex items-center justify-center gap-1 sm:gap-2"
              />
            </div>
          )}
          <div className="flex-1 flex items-center justify-end">
            <Button
              variant="ghost"
              type="button"
              onClick={vm.goToLogin}
              className="text-xs font-medium transition-colors hover:text-white"
              style={{ color: "rgba(245,242,255,0.6)" }}
            >
              {t("auth.backToLogin") || "Back to login"}
            </Button>
          </div>
        </header>

        {/* Full-page plan content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <PlanPickerStep onSelectPlan={vm.selectPlan} />
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-[11px] text-white/25">
          © {new Date().getFullYear()} {BRAND.name} — All rights reserved
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  OTHER STEPS → Centered card container
  // ═══════════════════════════════════════════════════════════════════════════
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
        className="pointer-events-none fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2"
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Top action: Back to login */}
      <div className="absolute end-4 top-4 sm:end-8 sm:top-6" style={{ animation: "sxRise 0.5s ease-out" }}>
        <Button
          variant="ghost"
          type="button"
          onClick={vm.goToLogin}
          className="text-xs font-medium transition-colors hover:text-white"
          style={{ color: "rgba(245,242,255,0.6)" }}
        >
          {t("auth.backToLogin") || "Back to login"}
        </Button>
      </div>

      {/* Logo */}
      <div className="mb-8" style={{ animation: "sxRise 0.5s ease-out" }}>
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
        className="relative w-full max-w-md overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))",
          border: "1px solid rgba(168,85,247,.22)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,.5), 0 0 80px -20px rgba(168,85,247,.15)",
        }}
      >
        <div
          key={vm.step}
          className="sx-screen p-6 sm:p-8"
          style={{ animation: "sxScreenIn 0.4s ease-out" }}
        >
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
