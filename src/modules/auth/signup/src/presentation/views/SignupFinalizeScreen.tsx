"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Clock, LogIn, RefreshCw, RotateCcw, XCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { BRAND } from "@core/config/branding";
import { useFinalizeViewModel } from "../viewmodels/useFinalizeViewModel";

// ═══════════════════════════════════════════════════════════════════════════
// SignupFinalizeScreen — the page Stripe redirects back to
// ({FE}/signup/finalize?session_id=… and the emailed ?ref=… link). New Elevate
// UI, REUSING useFinalizeViewModel verbatim (polling → completeSession → auth
// hydration / failure / consumed / expired / timeout — all unchanged).
//
// Renders the finalize state machine as a single calm card:
//   processing/slow/completing → determinate-feel spinner + honest copy
//   success                    → workspace ready, auto-redirect
//   failed                     → "Your card was not charged." + start again
//   consumed                   → already finished → log in
//   expired                    → "This link has expired." + log in / start fresh
//   timeout                    → 30-min hard stop → change plan / log in
//
// Product-register calm: solid-ink heading (no gradient text), restrained
// surfaces, accent reserved for the primary action. backdrop-blur ONLY on the
// sticky header. Reduced-motion safe; RTL via dir.
// ═══════════════════════════════════════════════════════════════════════════

/** Tonal status badge (declared at module scope to keep a stable identity). */
function StatusIcon({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full"
      style={{ background: `${tone}1f`, border: `1px solid ${tone}55` }}
    >
      {children}
    </div>
  );
}

export function SignupFinalizeScreen() {
  const vm = useFinalizeViewModel();
  const { t, direction } = useI18n();
  const { tokens, theme } = useSignupTheme();

  const isWorking = vm.phase === "processing" || vm.phase === "slow" || vm.phase === "completing";
  const headerSurface = theme === "dark" ? "rgba(10, 8, 22, 0.72)" : "rgba(248, 247, 255, 0.82)";

  const ctaStyle = {
    background: tokens.gradientCta,
    color: tokens.accentContrast,
    boxShadow: tokens.shadowCard,
  } as const;
  const ghostBtnClass =
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[0.875rem] font-medium transition-opacity duration-200 hover:opacity-80";
  const primaryBtnClass =
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[0.875rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none";

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col"
      dir={direction}
      style={{ background: tokens.gradientPage }}
    >
      {/* Ambient wash — restrained, non-interactive (no glow orb). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background: `radial-gradient(60% 50% at 80% 0%, ${tokens.accent}0f 0%, transparent 60%),
                       radial-gradient(50% 45% at 0% 100%, ${tokens.cyan}0a 0%, transparent 55%)`,
        }}
      />

      {/* Header — backdrop-blur allowed here only. */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-center px-5 sm:px-8"
        style={{
          background: headerSurface,
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <Link
          href="/login"
          aria-label={BRAND.name}
          className="flex select-none items-center gap-2.5"
        >
          <Image
            src="/app-logo.png"
            alt={BRAND.name}
            className="h-7 w-auto"
            width={28}
            height={28}
            priority
          />
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: tokens.ink }}>
            {BRAND.name}
          </span>
        </Link>
      </header>

      <main className="relative z-0 flex flex-1 items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            background: tokens.surfaceCard,
            border: tokens.borderCard,
            boxShadow: tokens.shadowCard,
          }}
        >
          {/* ── Processing / Slow / Completing ── */}
          {isWorking && (
            <div className="flex flex-col items-center gap-5">
              <div
                className="h-14 w-14 animate-spin rounded-full motion-reduce:animate-none"
                role="status"
                aria-label={t("signup.finalize.processing")}
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${tokens.accent})`,
                  WebkitMask:
                    "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 0)",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 0)",
                }}
              />
              <div>
                <h1
                  className="text-[1.25rem] font-semibold"
                  style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
                >
                  {vm.phase === "completing"
                    ? t("signup.finalize.paymentConfirmed")
                    : t("signup.finalize.processing")}
                </h1>
                <p
                  className="mt-2 text-[0.875rem] leading-relaxed"
                  style={{ color: tokens.inkMuted }}
                >
                  {vm.phase === "slow"
                    ? t("signup.finalize.slow")
                    : vm.phase === "completing"
                      ? t("signup.finalize.opening")
                      : t("signup.finalize.waiting")}
                </p>
              </div>
              {vm.phase === "slow" && (
                <button
                  type="button"
                  onClick={vm.changePlan}
                  className={ghostBtnClass}
                  style={{ color: tokens.inkMuted }}
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("signup.finalize.changePlan")}
                </button>
              )}
            </div>
          )}

          {/* ── Success ── */}
          {vm.phase === "success" && (
            <div className="flex flex-col items-center gap-5">
              <StatusIcon tone={tokens.success}>
                <Check
                  className="h-8 w-8"
                  strokeWidth={2.5}
                  style={{ color: tokens.success }}
                  aria-hidden="true"
                />
              </StatusIcon>
              <div>
                <h1
                  className="text-[1.25rem] font-semibold"
                  style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
                >
                  {t("signup.finalize.successTitle")}
                </h1>
                <p className="mt-2 text-[0.875rem]" style={{ color: tokens.inkMuted }}>
                  {t("signup.finalize.redirecting")}
                </p>
              </div>
            </div>
          )}

          {/* ── Failed ── */}
          {vm.phase === "failed" && (
            <div className="flex flex-col items-center gap-5">
              <StatusIcon tone={tokens.error}>
                <XCircle className="h-8 w-8" style={{ color: tokens.error }} aria-hidden="true" />
              </StatusIcon>
              <div>
                <h1
                  className="text-[1.25rem] font-semibold"
                  style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
                >
                  {t("signup.finalize.failed")}
                </h1>
                {vm.error && (
                  <p className="mt-2 text-[0.75rem]" style={{ color: tokens.inkFaint }}>
                    {vm.error}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={vm.startNewSignup}
                className={primaryBtnClass}
                style={ctaStyle}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t("signup.finalize.startAgain")}
              </button>
            </div>
          )}

          {/* ── Consumed (finished elsewhere) ── */}
          {vm.phase === "consumed" && (
            <div className="flex flex-col items-center gap-5">
              <StatusIcon tone={tokens.cyan}>
                <LogIn className="h-8 w-8" style={{ color: tokens.cyan }} aria-hidden="true" />
              </StatusIcon>
              <div>
                <h1
                  className="text-[1.25rem] font-semibold"
                  style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
                >
                  {t("signup.finalize.consumedTitle")}
                </h1>
                <p className="mt-2 text-[0.875rem]" style={{ color: tokens.inkMuted }}>
                  {t("signup.finalize.consumedSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={vm.goToLogin}
                className={primaryBtnClass}
                style={ctaStyle}
              >
                {t("auth.backToLogin")}
              </button>
            </div>
          )}

          {/* ── Expired / unknown ref ── */}
          {vm.phase === "expired" && (
            <div className="flex flex-col items-center gap-5">
              <StatusIcon tone={tokens.cyan}>
                <Clock className="h-8 w-8" style={{ color: tokens.cyan }} aria-hidden="true" />
              </StatusIcon>
              <h1
                className="text-[1.25rem] font-semibold"
                style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
              >
                {t("signup.finalize.expired")}
              </h1>
              <div className="flex w-full flex-col gap-2">
                <button
                  type="button"
                  onClick={vm.goToLogin}
                  className={primaryBtnClass}
                  style={ctaStyle}
                >
                  {t("auth.backToLogin")}
                </button>
                <button
                  type="button"
                  onClick={vm.startNewSignup}
                  className={ghostBtnClass}
                  style={{ color: tokens.inkMuted }}
                >
                  {t("signup.finalize.startAgain")}
                </button>
              </div>
            </div>
          )}

          {/* ── Timeout (30-min hard stop) ── */}
          {vm.phase === "timeout" && (
            <div className="flex flex-col items-center gap-5">
              <StatusIcon tone={tokens.cyan}>
                <Clock className="h-8 w-8" style={{ color: tokens.cyan }} aria-hidden="true" />
              </StatusIcon>
              <div>
                <h1
                  className="text-[1.25rem] font-semibold"
                  style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
                >
                  {t("signup.finalize.timeoutTitle")}
                </h1>
                <p
                  className="mt-2 text-[0.875rem] leading-relaxed"
                  style={{ color: tokens.inkMuted }}
                >
                  {t("signup.finalize.timeoutSubtitle")}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <button
                  type="button"
                  onClick={vm.changePlan}
                  className={primaryBtnClass}
                  style={ctaStyle}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  {t("signup.finalize.changePlan")}
                </button>
                <button
                  type="button"
                  onClick={vm.goToLogin}
                  className={ghostBtnClass}
                  style={{ color: tokens.inkMuted }}
                >
                  {t("auth.backToLogin")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer
        className="relative z-0 py-6 text-center text-[11px]"
        style={{ color: tokens.inkGhost }}
      >
        © {new Date().getFullYear()} {BRAND.name} — {t("signup.copyright")}
      </footer>
    </div>
  );
}

export default SignupFinalizeScreen;
