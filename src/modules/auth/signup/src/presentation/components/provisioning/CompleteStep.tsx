"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { SignupWizardViewModel } from "../../viewmodels/useSignupWizard";

// ═══════════════════════════════════════════════════════════════════════════
// CompleteStep — the success moment (F9). Confirms the workspace is ready with a
// tasteful, on-brand check, a short list of next steps, and a primary CTA to the
// workspace/login. The reused provisioning hook auto-redirects shortly after, so
// this also surfaces a calm "redirecting" hint — the CTA lets impatient users go
// immediately.
//
// This conversion surface may be a touch more expressive than the product-task
// phases, but stays within the bar: a single celebratory pulse (reduced-motion
// safe), solid-ink heading, accent reserved for the CTA + the success mark.
// ═══════════════════════════════════════════════════════════════════════════

interface CompleteStepProps {
  wizard: SignupWizardViewModel;
}

export function CompleteStep({ wizard }: CompleteStepProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();
  const firedRef = useRef(false);

  // ── Confetti — a single tasteful burst, gated by prefers-reduced-motion ──
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    void import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.4 },
        colors: ["#A855F7", "#7C3AED", "#6366F1", "#22D3EE", "#22c55e"],
        disableForReducedMotion: true,
      });
    });
  }, []);

  const highlights = [
    t("signup.complete.inviteTeam"),
    t("signup.complete.customizeBranding"),
    t("signup.complete.exploreModules"),
  ];

  return (
    <div
      className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 py-14 text-center sm:px-8"
      dir={direction}
    >
      {/* ── Success mark (single celebratory pulse, reduced-motion safe) ── */}
      <div className="relative mb-6">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full motion-reduce:hidden"
          style={{
            background: `radial-gradient(circle, ${tokens.success}40 0%, transparent 70%)`,
            animation: "sxCompletePulse 2.4s ease-in-out infinite",
          }}
        />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: `${tokens.success}1f`, border: `2px solid ${tokens.success}66` }}
        >
          <Check
            className="h-8 w-8"
            strokeWidth={2.5}
            style={{ color: tokens.success }}
            aria-hidden="true"
          />
        </div>
      </div>

      <h1
        className="text-[1.5rem] font-semibold"
        style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
      >
        {t("signup.complete.welcomeTitle")}
      </h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
        {t("signup.complete.workspaceReady", { name: wizard.wizardData.workspaceName || "" })}
      </p>

      {/* ── Next steps ── */}
      <ul className="mt-6 flex w-full flex-col gap-2">
        {highlights.map((item) => (
          <li
            key={item}
            className="flex items-center justify-center gap-2 text-[0.8125rem]"
            style={{ color: tokens.inkMuted }}
          >
            <Check
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
              style={{ color: tokens.cyan }}
            />
            {item}
          </li>
        ))}
      </ul>

      {/* ── Primary CTA — go to the workspace now ── */}
      <button
        type="button"
        onClick={wizard.goToLogin}
        className="group mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
        style={{
          background: tokens.gradientCta,
          color: tokens.accentContrast,
          boxShadow: tokens.shadowCard,
        }}
      >
        {t("signup.complete.goToWorkspace")}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none rtl:scale-x-[-1]"
          aria-hidden="true"
        />
      </button>

      <p className="mt-4 text-[0.6875rem]" style={{ color: tokens.inkFaint }}>
        {t("signup.complete.redirecting")}
      </p>

      <style jsx>{`
        @keyframes sxCompletePulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default CompleteStep;
