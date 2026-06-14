"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { SignupThemeProvider, useSignupTheme } from "@core/providers/signup-theme";
import { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";
import { DiscoveryStep } from "../components/DiscoveryStep";
import { PlanPickerStep } from "../components/PlanPickerStep";
import { AccountStep } from "../components/AccountStep";
import { VerificationStep } from "../components/VerificationStep";
import { WorkspaceStep } from "../components/WorkspaceStep";
import { ContactSalesStep } from "../components/ContactSalesStep";
import { ReviewStep } from "../components/ReviewStep";
import { ProvisioningStep } from "../components/ProvisioningStep";
import { CompleteStep } from "../components/CompleteStep";
import { SignupProgressBar } from "../components/SignupProgressBar";
import { ResumeSignupModal } from "../components/ResumeSignupModal";

/**
 * SignupView — Self-Service Tenant Signup Wizard (v3).
 *
 * Step flow (server-driven):
 *   Discovery (Q1/Q2/Q3) → Plan → Account
 *   → Verify → Workspace → Review
 *   (The vertical is asked ONCE in Discovery Q1 and pre-filters the plan picker —
 *    there is no separate Category step.)
 *   contact-sales editions divert to ContactSalesStep and end there;
 *   free editions finish in-page (Provisioning → Complete);
 *   trial/paid editions redirect to Stripe and come back via /signup/finalize.
 */

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// framer-motion supports function-based initial/exit variants when custom is set.
// We avoid the strict `Variants` typedef here because it doesn't include function overloads.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STEP_VARIANTS: Record<string, any> = {
  initial: (direction: number) => ({
    opacity: 0,
    x: prefersReducedMotion ? 0 : direction > 0 ? 32 : -32,
    filter: prefersReducedMotion ? "blur(0px)" : "blur(4px)",
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: prefersReducedMotion ? 0 : direction > 0 ? -32 : 32,
    filter: prefersReducedMotion ? "blur(0px)" : "blur(4px)",
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeIn" },
  }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BAND_VARIANTS: Record<string, any> = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

/**
 * Public export — wraps the inner content with the theme provider so that
 * useSignupTheme() is available to all child components.
 */
export function SignupView() {
  return (
    <SignupThemeProvider>
      <SignupViewContent />
    </SignupThemeProvider>
  );
}

/**
 * Inner content — lives inside SignupThemeProvider so it can safely call
 * useSignupTheme() and pass tokens down to sub-components.
 */
function SignupViewContent() {
  const { tokens, theme, toggleTheme } = useSignupTheme();
  const vm = useSignupWizardViewModel();
  const { t, direction } = useI18n();

  const progressBarLabels = useMemo(
    () => [
      t("signup.steps.plan") || "Plan",
      t("signup.steps.account") || "Account",
      t("signup.steps.verify") || "Verify",
      t("signup.steps.workspace") || "Workspace",
      t("signup.steps.review") || "Review",
    ],
    [t]
  );

  const isFullPage = vm.step === "discovery" || vm.step === "plan";

  const showStepper =
    vm.step !== "discovery" &&
    vm.step !== "provisioning" &&
    vm.step !== "complete" &&
    vm.step !== "contact-sales";

  // Direction is owned by the ViewModel — set atomically with setStep via
  // React 18 batched updates (single render, zero ref access, zero effects).
  const slideDirection = vm.navigationDirection;

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col"
      dir={direction}
      style={{ background: tokens.gradientPage }}
    >
      {/* ═══ Dark/light theme toggle (top-right corner) ═══ */}
      <button
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="absolute end-4 top-4 z-20 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: tokens.surfaceRaised,
          border: tokens.borderCard,
          color: tokens.inkMuted,
        }}
      >
        {theme === "dark" ? (
          <Sun size={16} aria-hidden="true" />
        ) : (
          <Moon size={16} aria-hidden="true" />
        )}
      </button>

      {/* ═══ Ambient glow orbs (fixed, pointer-events: none) ═══ */}
      <div
        className="pointer-events-none fixed left-1/3 top-0 -translate-x-1/2"
        style={{
          width: 800,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${tokens.accent}12 0%, transparent 65%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-1/4 translate-x-1/2"
        style={{
          width: 600,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${tokens.cyan}0d 0%, transparent 65%)`,
          filter: "blur(70px)",
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════
          HEADER — always 56px, never changes height between steps.
          Logo + wordmark on the left.
          "Already have an account? Sign in →" on the right (plain text, no button chrome).
          Nothing else here. Stepper lives in its own band below.
      ════════════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between px-5 sm:px-8"
        style={{
          background:
            theme === "dark"
              ? "rgba(10, 8, 22, 0.72)"
              : "rgba(248, 247, 255, 0.82)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        {/* ── Logo + wordmark ── */}
        <Link
          href="/"
          aria-label={BRAND.name}
          className="flex select-none items-center gap-2.5 transition-opacity hover:opacity-75"
        >
          <Image
            src="/app-logo.png"
            alt={BRAND.name}
            className="h-7 w-auto"
            width={28}
            height={28}
            priority
          />
          <span
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: tokens.ink }}
          >
            {BRAND.name}
          </span>
        </Link>

        {/* ── "Already have an account? Sign in →" ── */}
        <div
          className="flex items-center gap-1.5 text-[13px]"
          style={{ color: tokens.inkFaint }}
        >
          <span className="hidden sm:inline">
            {t("signup.header.haveAccount") || "Already have an account?"}
          </span>
          <Link
            href="/login"
            className="font-semibold transition-colors"
            style={{ color: tokens.accent }}
          >
            {t("signup.header.signIn") || "Sign in"}{" "}
            <span
              aria-hidden
              className="inline-block transition-transform"
              style={{ transform: direction === "rtl" ? "scaleX(-1)" : "none" }}
            >
              →
            </span>
          </Link>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          STEPPER BAND — separate from header, animated height collapse.
          Appears below the header on ALL screen sizes (no mobile/desktop split).
          Hidden on Discovery, Provisioning, Complete, Contact-Sales steps.
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence initial={false}>
        {showStepper && (
          <motion.div
            key="stepper-band"
            variants={BAND_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-label={t("signup.stepper.label") || "Signup progress"}
            className="sticky top-14 z-30 overflow-hidden"
            style={{
              background:
                theme === "dark"
                  ? "rgba(10, 8, 22, 0.6)"
                  : "rgba(248, 247, 255, 0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: `1px solid ${tokens.border}`,
            }}
          >
            <SignupProgressBar
              currentStep={vm.step}
              stepLabels={progressBarLabels}
              direction={direction}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Stage ═══ */}
      {isFullPage ? (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait" custom={slideDirection}>
            {vm.step === "discovery" && (
              <motion.div
                key="discovery"
                custom={slideDirection}
                variants={STEP_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <DiscoveryStep
                  onComplete={vm.completeDiscovery}
                  initialAnswers={vm.discoveryAnswers}
                />
              </motion.div>
            )}
            {vm.step === "plan" && (
              <motion.div
                key="plan"
                custom={slideDirection}
                variants={STEP_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <PlanPickerStep
                  onSelectPlan={vm.selectPlan}
                  initialCategory={vm.selectedCategory}
                  currency={vm.currency}
                  recommendedTier={vm.wizardData.recommendedTier}
                  recommendationReasons={vm.wizardData.recommendationReasons}
                  supportedCurrencies={vm.supportedCurrencies}
                  detectedCountry={vm.pricingContext?.detectedCountry}
                  isCurrencyLoading={vm.isCurrencyLoading}
                  selectedPriorities={vm.wizardData.primaryPriority}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center justify-center p-4 py-10">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl"
            style={{
              background: tokens.surfaceCard,
              border: tokens.borderCard,
              boxShadow: tokens.shadowCard,
            }}
          >
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={vm.step}
                custom={slideDirection}
                variants={STEP_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-6 sm:p-8"
              >
                {vm.step === "account" && <AccountStep vm={vm} />}
                {vm.step === "verification" && <VerificationStep vm={vm} />}
                {vm.step === "workspace" && <WorkspaceStep vm={vm} />}
                {vm.step === "contact-sales" && (
                  <ContactSalesStep vm={vm} editionName={vm.selectedEditionName} />
                )}
                {vm.step === "review" && (
                  <ReviewStep
                    vm={{
                      wizardData: {
                        billingCycle: vm.wizardData.billingCycle,
                        subdomain: vm.wizardData.subdomain,
                        email: vm.wizardData.email,
                      },
                      isLoading: vm.isLoading,
                      error: vm.error,
                      checkoutCanceled: vm.checkoutCanceled,
                      dismissCheckoutCanceled: vm.dismissCheckoutCanceled,
                      startProvisioning: vm.startProvisioning,
                      goBack: vm.goBack,
                      editPlan: vm.editPlan,
                      selectedPlan: vm.selectedPlan,
                      selectedCheckoutMode: vm.selectedCheckoutMode,
                    }}
                  />
                )}
                {vm.step === "provisioning" && <ProvisioningStep vm={vm} />}
                {vm.step === "complete" && <CompleteStep vm={vm} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      )}

      {/* ═══ Footer ═══ */}
      <footer className="py-6 text-center text-[11px]" style={{ color: tokens.inkGhost }}>
        © {new Date().getFullYear()} {BRAND.name} — {t("signup.copyright") || "All rights reserved"}
      </footer>

      {/* ═══ Resume modal ═══ */}
      {vm.showResumeModal && vm.pendingResumeInfo && (
        <ResumeSignupModal
          info={vm.pendingResumeInfo}
          onResume={vm.resumeSignup}
          onChangePlan={vm.changePlanFromModal}
          onStartFresh={vm.startFreshSignup}
        />
      )}
    </div>
  );
}

export default SignupView;
