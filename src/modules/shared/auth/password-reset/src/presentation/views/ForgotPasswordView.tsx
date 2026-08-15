/**
 * ForgotPasswordView — 5-step password reset flow.
 *
 * Steps:
 *   1. request    — Enter email
 *   2. method     — Choose OTP or Magic Link delivery
 *   3. otp        — Enter 6-digit code
 *   4. workspaces — Workspace picker (multi-tenant)
 *   5. newPassword — Create new password
 *   6. success    — Done!
 *
 * Uses Vault surface tokens + SCRIPE MVVM (no DI container access here).
 * Enumeration-safe: never reveals whether email exists.
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import { ArrowLeft } from "lucide-react";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "@modules/auth/core/src/presentation/viewmodels/useTenantResolution";
import { VaultBackground } from "@modules/auth/core";
import { useLoginBrandingTokens } from "@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens";
import { Button } from "@core/ui/button";
// ARCH-EXCEPTION: pre-auth view — cannot use DI container (no auth context yet).
import { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";

import { RequestStep } from "../components/RequestStep";
import { MethodStep } from "../components/MethodStep";
import { OtpStep } from "../components/OtpStep";
import { WorkspacesStep } from "../components/WorkspacesStep";
import { NewPasswordStep } from "../components/NewPasswordStep";
import { SuccessStep } from "../components/SuccessStep";

/**
 * ForgotPasswordView component
 *
 * Renders the forgot password flow, starting from entering an email address,
 * to selecting a workspace, verifying OTP, and setting a new password.
 */
export function ForgotPasswordView() {
  const { t, direction } = useI18n();
  const { branding } = useTenantResolution("forgot-password");

  useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const vm = useForgotPasswordViewModel();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t("auth.resetPassword")} — ${companyName}`;
    }
  }, [companyName, t]);

  const totalSteps = 5;
  const stepIndex =
    {
      request: 1,
      method: 2,
      otp: 3,
      workspaces: 4,
      newPassword: 5,
      success: 5,
    }[vm.step] ?? 1;

  const showBack = vm.step !== "request" && vm.step !== "success" && vm.step !== "method";

  return (
    <div
      className="vault-stage relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />

      {/* Masthead — the brand stays present on every auth surface */}
      <div className="absolute start-6 top-6 z-20 flex items-center gap-2.5">
        <Image src="/brand/app-logo.svg" alt="" width={28} height={28} aria-hidden="true" />
        <span className="text-base font-semibold tracking-tight" style={{ color: "var(--sx-text)" }}>
          {companyName}
        </span>
      </div>

      {/* Top right actions */}
      <div
        className="absolute right-6 top-6 z-20 flex items-center gap-1"
        style={direction === "rtl" ? { right: "auto", left: "1.5rem" } : {}}
      >
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      {/* Centered content */}
      <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
        {/* Back / Logo row */}
        <div className="mb-5 flex w-full items-center justify-between">
          {showBack || vm.step === "method" ? (
            <Button
              type="button"
              variant="ghost"
              onClick={vm.goBack}
              className="inline-flex h-auto items-center gap-1.5 p-0 text-[13px] font-medium transition-colors hover:bg-transparent hover:opacity-80"
              style={{ color: "var(--sx-text-mute)" }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("auth.back")}
            </Button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--sx-text-mute)" }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("auth.backToLogin")}
            </Link>
          )}

          {/* Step counter (except success) */}
          {vm.step !== "success" && (
            <span className="text-[11px] font-medium" style={{ color: "var(--sx-text-faint)" }}>
              {stepIndex}/{totalSteps}
            </span>
          )}
        </div>

        {/* Card — solid surface (DESIGN.md bans default glassmorphism) */}
        <div
          className="sx-screen w-full rounded-[20px] p-8 sm:p-9"
          style={{
            background: "var(--sx-card-bg)",
            border: "1px solid var(--sx-card-border)",
            boxShadow: "var(--sx-card-shadow)",
          }}
        >
          {vm.step === "request" && <RequestStep vm={vm} totalSteps={totalSteps} />}
          {vm.step === "method" && <MethodStep vm={vm} totalSteps={totalSteps} />}
          {vm.step === "otp" && <OtpStep vm={vm} totalSteps={totalSteps} />}
          {vm.step === "workspaces" && <WorkspacesStep vm={vm} totalSteps={totalSteps} />}
          {vm.step === "newPassword" && <NewPasswordStep vm={vm} totalSteps={totalSteps} />}
          {vm.step === "success" && <SuccessStep vm={vm} />}
        </div>

        {/* Footer */}
        <p className="mt-8 text-[11px]" style={{ color: "var(--sx-text-faint)" }}>
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>

      <style>{`
        @keyframes sx-caret-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .sx-caret { animation: sx-caret-blink 1s step-end infinite; }
      `}</style>
    </div>
  );
}
