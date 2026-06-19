"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@core/providers/i18n-provider";
import { SignupThemeProvider, useSignupTheme } from "@core/providers/signup-theme";
import { useSignupWizard, type SignupPhase } from "../viewmodels/useSignupWizard";
import { SignupShell } from "../components/common/SignupShell";
import { SignupProgressBar } from "../components/common/SignupProgressBar";
import { ResumeSignupModal } from "../components/common/ResumeSignupModal";
import { WelcomeScreen } from "../components/welcome/WelcomeScreen";
import { DiscoveryStage } from "../components/discovery/DiscoveryStage";
import { PlansStage } from "../components/plans/PlansStage";
import { AccountStep } from "../components/account/AccountStep";
import { VerificationStep } from "../components/verify/VerificationStep";
import { WorkspaceStep } from "../components/workspace/WorkspaceStep";
import { ReviewStep } from "../components/review/ReviewStep";
import { ContactSalesStep } from "../components/sales/ContactSalesStep";
import { ProvisioningStep } from "../components/provisioning/ProvisioningStep";
import { CompleteStep } from "../components/provisioning/CompleteStep";

// ═══════════════════════════════════════════════════════════════════════════
// SignupWizard — the NEW (Elevate) orchestrator. The single component the
// /signup route renders. It:
//   • calls useSignupWizard() once (the only data-aware layer);
//   • renders SignupShell with the current phase inside;
//   • passes SignupProgressBar into the shell's progressSlot ONLY for the
//     stepper phases (account · verification · workspace · review);
//   • renders the phase component for wizard.phase, wiring each component's
//     real prop signature (welcome/discovery take specific props; every other
//     phase takes the single `wizard` view object);
//   • mounts ResumeSignupModal when a resumable session is detected;
//   • wraps everything in SignupThemeProvider (mirrors the legacy SignupView).
//
// Phase transitions use AnimatePresence mode="wait" with a HEIGHT-STABLE,
// direction-aware slide (mirrored under RTL, reduced-motion safe). Each phase
// component already owns its max-width container + padding, so the orchestrator
// never double-wraps; form phases are vertically centered, full-bleed phases
// flow from the top.
// ═══════════════════════════════════════════════════════════════════════════

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

/** Phases that show the stepper progress band. */
const STEPPER_PHASES: ReadonlySet<SignupPhase> = new Set<SignupPhase>([
  "account",
  "verification",
  "workspace",
  "review",
]);

/**
 * Form phases are vertically centered in the stage; everything else flows from
 * the top of the stage. (Each phase still owns its own horizontal max-width.)
 */
const CENTERED_PHASES: ReadonlySet<SignupPhase> = new Set<SignupPhase>([
  "account",
  "verification",
  "workspace",
  "review",
  "contact-sales",
]);

// Direction-aware slide. Consistent easing/duration in and out (~220ms enter,
// ~180ms exit), reduced-motion → pure (instant) opacity. `x` is pre-mirrored
// for RTL by the caller via the `custom` direction sign.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PHASE_VARIANTS: Record<string, any> = {
  enter: (dir: number) =>
    prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? 28 : -28 },
  center: prefersReducedMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        x: 0,
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
      },
  exit: (dir: number) =>
    prefersReducedMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          x: dir > 0 ? -28 : 28,
          transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
        },
};

export interface SignupWizardProps {
  initialCountry?: string | null;
  initialCurrency?: string;
}

export function SignupWizard({ initialCountry, initialCurrency }: SignupWizardProps) {
  const [isInvalidDomain, setIsInvalidDomain] = useState(false);
  const [platformSignupUrl, setPlatformSignupUrl] = useState("");

  useEffect(() => {
    const hostname = window.location.hostname;
    // Dev domains (localhost, 127.0.0.1) are always treated as platform.
    const DEV_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"];
    const isDev = DEV_DOMAINS.includes(hostname) || hostname.endsWith(".localhost");
    if (!isDev) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim();
      if (appUrl) {
        try {
          const platformHost = new URL(appUrl).hostname;
          if (hostname !== platformHost) {
            setIsInvalidDomain(true);
            setPlatformSignupUrl(`${appUrl.replace(/\/$/, "")}/signup`);
          }
        } catch {
          // Invalid NEXT_PUBLIC_APP_URL — allow render (safe fallback)
        }
      }
    }
  }, []);

  if (isInvalidDomain) {
    return (
      <SignupThemeProvider>
        <SignupDomainRestrictionView platformSignupUrl={platformSignupUrl} />
      </SignupThemeProvider>
    );
  }

  return (
    <SignupThemeProvider>
      <SignupWizardContent initialCountry={initialCountry} initialCurrency={initialCurrency} />
    </SignupThemeProvider>
  );
}

function SignupDomainRestrictionView({ platformSignupUrl }: { platformSignupUrl: string }) {
  const { tokens } = useSignupTheme();
  const { t, direction } = useI18n();

  return (
    <SignupShell>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center shadow-xl border backdrop-blur-md"
          style={{
            background: tokens.surface,
            borderColor: tokens.borderCard,
            boxShadow: tokens.shadowCard,
          }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: `${tokens.accent}14` }}
          >
            <AlertTriangle className="h-8 w-8" style={{ color: tokens.accent }} />
          </div>

          <h1
            className="mb-3 text-2xl font-bold tracking-tight"
            style={{ color: tokens.ink }}
          >
            {t("signup.errors.domainRestrictionTitle")}
          </h1>

          <p
            className="mb-8 text-sm leading-relaxed"
            style={{ color: tokens.inkMuted }}
          >
            {t("signup.errors.domainRestrictionDescription")}
          </p>

          <a
            href={platformSignupUrl}
            className="inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: tokens.accent,
              color: tokens.accentContrast || "#ffffff",
              boxShadow: `0 4px 12px ${tokens.accent}33`,
            }}
          >
            {t("signup.errors.domainRestrictionLinkText")}{" "}
            <span
              className="ml-2 font-mono"
              style={{ transform: direction === "rtl" ? "scaleX(-1)" : "none" }}
            >
              →
            </span>
          </a>
        </div>
      </div>
    </SignupShell>
  );
}

function SignupWizardContent({ initialCountry, initialCurrency }: SignupWizardProps) {
  const wizard = useSignupWizard({ initialCountry, initialCurrency });
  const { t, direction } = useI18n();

  const isStepperPhase = STEPPER_PHASES.has(wizard.phase);
  const isCentered = CENTERED_PHASES.has(wizard.phase);

  // Slide direction is owned by the viewmodel (set atomically with the phase),
  // mirrored under RTL so forward always reads as "leading → trailing".
  const slideDir = (direction === "rtl" ? -1 : 1) * wizard.navigationDirection;

  return (
    <SignupShell
      progressSlot={isStepperPhase ? <SignupProgressBar phase={wizard.phase} /> : undefined}
      phaseLabel={t("signup.stepper.label")}
    >
      {/*
        Height-stable stage: a single flex column that grows to fill the shell's
        <main>. AnimatePresence mode="wait" swaps one phase at a time. The motion
        wrapper itself is the flex child, so the page never collapses between
        phases (the shell's min-h-[100dvh] + flex-1 keep the footer pinned), and
        the consistent enter/exit transition prevents any inter-phase jump.
      */}
      <div className={`flex min-h-full flex-1 flex-col ${isCentered ? "justify-center" : ""}`}>
        <AnimatePresence mode="wait" custom={slideDir} initial={false}>
          <motion.div
            key={wizard.phase}
            custom={slideDir}
            variants={PHASE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            className={`flex w-full flex-col ${isCentered ? "" : "flex-1"}`}
          >
            <PhaseContent wizard={wizard} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ Resume modal — portal-based, mounted at the wizard root ═══ */}
      {wizard.showResumeModal && wizard.pendingResumeInfo && (
        <ResumeSignupModal
          info={wizard.pendingResumeInfo}
          onResume={wizard.resume}
          onChangePlan={wizard.changePlan}
          onStartFresh={wizard.startFresh}
        />
      )}
    </SignupShell>
  );
}

/**
 * Renders the phase component for the current phase, wiring each component's
 * real prop signature. Extracted so the AnimatePresence child stays a thin,
 * keyed motion wrapper (its identity = the phase, never the inner content).
 */
function PhaseContent({ wizard }: { wizard: ReturnType<typeof useSignupWizard> }) {
  switch (wizard.phase) {
    case "welcome":
      return (
        <WelcomeScreen
          content={wizard.welcomeContent}
          isLoading={wizard.isWelcomeLoading}
          isError={wizard.isWelcomeError}
          onRetry={wizard.retryWelcome}
          onGetStarted={wizard.goToDiscovery}
        />
      );
    case "discovery":
      return <DiscoveryStage onComplete={wizard.completeDiscovery} />;
    case "plan":
      return <PlansStage wizard={wizard} />;
    case "account":
      return <AccountStep wizard={wizard} />;
    case "verification":
      return <VerificationStep wizard={wizard} />;
    case "workspace":
      return <WorkspaceStep wizard={wizard} />;
    case "review":
      return <ReviewStep wizard={wizard} />;
    case "contact-sales":
      return <ContactSalesStep wizard={wizard} />;
    case "provisioning":
      return <ProvisioningStep wizard={wizard} />;
    case "complete":
      return <CompleteStep wizard={wizard} />;
    default:
      return null;
  }
}

export default SignupWizard;
