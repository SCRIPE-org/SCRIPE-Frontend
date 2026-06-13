"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Clock, LogIn, RotateCcw, RefreshCw } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import { Button } from "@core/ui/button";
import { useFinalizeViewModel } from "../viewmodels/useFinalizeViewModel";

/**
 * SignupFinalizeView — the page Stripe redirects back to
 * ({FE}/signup/finalize?session_id=… and the emailed ?ref=… link).
 *
 * Renders the finalize state machine:
 *   processing/slow → animated spinner with honest progress copy
 *   completing/success → payment confirmed, workspace opening
 *   failed → "Your card was not charged." + start again (U10)
 *   consumed → already finished → log in
 *   expired → "This link has expired." + log in / start fresh (U11)
 */
export function SignupFinalizeView() {
  const vm = useFinalizeViewModel();
  const { t, direction } = useI18n();

  return (
    <div
      className="flex min-h-screen flex-col"
      dir={direction}
      style={{
        background: BRAND_TOKENS.bg.base,
        backgroundImage: BRAND_TOKENS.gradient.page,
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/3 top-1/3 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND_TOKENS.palette.violet}10 0%, transparent 70%)`,
          filter: "blur(90px)",
        }}
      />

      {/* Header */}
      <header
        className="flex items-center justify-center px-6 py-4"
        style={{
          background: BRAND_TOKENS.bg.glass,
          backdropFilter: "blur(20px)",
          borderBottom: BRAND_TOKENS.border.subtle,
        }}
      >
        <Link href="/login" aria-label={BRAND.name}>
          <Image
            src="/app-logo.png"
            alt={BRAND.name}
            className="h-10 w-auto"
            width={120}
            height={40}
            priority
          />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            background: BRAND_TOKENS.bg.card,
            border: BRAND_TOKENS.border.card,
            boxShadow: BRAND_TOKENS.shadow.card,
            animation: "sxScreenIn 0.4s ease-out",
          }}
        >
          {/* ── Processing / Slow / Completing ── */}
          {(vm.phase === "processing" || vm.phase === "slow" || vm.phase === "completing") && (
            <div className="flex flex-col items-center gap-5">
              <div
                className="h-14 w-14 animate-spin rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${BRAND_TOKENS.palette.violet})`,
                  WebkitMask:
                    "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 0)",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 0)",
                }}
                role="status"
                aria-label={t("signup.finalize.processing") || "Setting up your workspace…"}
              />
              <div>
                <h1 className="text-xl font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
                  {vm.phase === "completing"
                    ? t("signup.finalize.paymentConfirmed") || "Payment confirmed!"
                    : t("signup.finalize.processing") || "Setting up your workspace…"}
                </h1>
                <p className="mt-2 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
                  {vm.phase === "slow"
                    ? t("signup.finalize.slow") ||
                      "This usually completes within 15 minutes — we'll email your access link."
                    : vm.phase === "completing"
                      ? t("signup.finalize.opening") || "Opening your workspace…"
                      : t("signup.finalize.waiting") ||
                        "Confirming your payment with our payment provider."}
                </p>
              </div>
              {vm.phase === "slow" && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={vm.changePlan}
                  className="mt-1 h-9 rounded-xl px-5 text-xs font-medium"
                  style={{ color: BRAND_TOKENS.text.tertiary }}
                >
                  <RefreshCw className="me-1.5 h-3.5 w-3.5" />
                  {t("signup.finalize.changePlan") || "Change plan"}
                </Button>
              )}
            </div>
          )}

          {/* ── Timeout (30 min hard stop) ── */}
          {vm.phase === "timeout" && (
            <div className="flex flex-col items-center gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: "rgba(234,179,8,0.1)",
                  border: "1px solid rgba(234,179,8,0.25)",
                }}
              >
                <Clock className="h-8 w-8" style={{ color: BRAND_TOKENS.palette.amber }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
                  {t("signup.finalize.timeoutTitle") || "Taking longer than expected"}
                </h1>
                <p className="mt-2 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
                  {t("signup.finalize.timeoutSubtitle") ||
                    "Check your email — we'll send your access link once your workspace is ready. You were not charged if setup didn't complete."}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button
                  type="button"
                  onClick={vm.changePlan}
                  className="h-11 w-full rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: BRAND_TOKENS.gradient.cta,
                    boxShadow: BRAND_TOKENS.shadow.cta,
                  }}
                >
                  <RefreshCw className="me-2 h-4 w-4" />
                  {t("signup.finalize.changePlan") || "Change plan"}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={vm.goToLogin}
                  className="h-11 w-full rounded-xl text-sm font-medium"
                  style={{ color: BRAND_TOKENS.text.secondary }}
                >
                  {t("auth.backToLogin") || "Log in"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {vm.phase === "success" && (
            <div className="flex flex-col items-center gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  animation: "sxPop 0.5s cubic-bezier(0.22,1.2,0.36,1)",
                }}
              >
                <CheckCircle className="h-8 w-8" style={{ color: BRAND_TOKENS.text.success }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
                  {t("signup.finalize.successTitle") || "Your workspace is ready!"}
                </h1>
                <p className="mt-2 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
                  {t("signup.finalize.redirecting") || "Taking you to your dashboard…"}
                </p>
              </div>
            </div>
          )}

          {/* ── Failed ── */}
          {vm.phase === "failed" && (
            <div className="flex flex-col items-center gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <XCircle className="h-8 w-8" style={{ color: BRAND_TOKENS.palette.rose }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
                  {t("signup.finalize.failed") ||
                    "Signup didn't complete. Your card was not charged."}
                </h1>
                {vm.error && (
                  <p className="mt-2 text-xs" style={{ color: BRAND_TOKENS.text.tertiary }}>
                    {vm.error}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={vm.startNewSignup}
                className="h-11 w-full rounded-xl text-sm font-semibold text-white"
                style={{
                  background: BRAND_TOKENS.gradient.cta,
                  boxShadow: BRAND_TOKENS.shadow.cta,
                }}
              >
                <RotateCcw className="me-2 h-4 w-4" />
                {t("signup.finalize.startAgain") || "Start a new signup — you were not charged"}
              </Button>
            </div>
          )}

          {/* ── Consumed (already finished elsewhere) ── */}
          {vm.phase === "consumed" && (
            <div className="flex flex-col items-center gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: "rgba(34,211,238,0.1)",
                  border: "1px solid rgba(34,211,238,0.25)",
                }}
              >
                <LogIn className="h-8 w-8" style={{ color: BRAND_TOKENS.text.cyan }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
                  {t("signup.finalize.consumedTitle") || "Signup already complete"}
                </h1>
                <p className="mt-2 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
                  {t("signup.finalize.consumedSubtitle") ||
                    "Your workspace is ready — log in with your credentials."}
                </p>
              </div>
              <Button
                type="button"
                onClick={vm.goToLogin}
                className="h-11 w-full rounded-xl text-sm font-semibold text-white"
                style={{
                  background: BRAND_TOKENS.gradient.cta,
                  boxShadow: BRAND_TOKENS.shadow.cta,
                }}
              >
                {t("auth.backToLogin") || "Log in"}
              </Button>
            </div>
          )}

          {/* ── Expired / unknown ref ── */}
          {vm.phase === "expired" && (
            <div className="flex flex-col items-center gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: "rgba(234,179,8,0.1)",
                  border: "1px solid rgba(234,179,8,0.25)",
                }}
              >
                <Clock className="h-8 w-8" style={{ color: BRAND_TOKENS.palette.amber }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
                  {t("signup.finalize.expired") || "This link has expired."}
                </h1>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button
                  type="button"
                  onClick={vm.goToLogin}
                  className="h-11 w-full rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: BRAND_TOKENS.gradient.cta,
                    boxShadow: BRAND_TOKENS.shadow.cta,
                  }}
                >
                  {t("auth.backToLogin") || "Log in"}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={vm.startNewSignup}
                  className="h-11 w-full rounded-xl text-sm font-medium"
                  style={{ color: BRAND_TOKENS.text.secondary }}
                >
                  {t("signup.finalize.startAgain") || "Start a new signup — you were not charged"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-[11px]" style={{ color: BRAND_TOKENS.text.ghost }}>
        © {new Date().getFullYear()} {BRAND.name} — {t("signup.copyright") || "All rights reserved"}
      </footer>
    </div>
  );
}

export default SignupFinalizeView;
