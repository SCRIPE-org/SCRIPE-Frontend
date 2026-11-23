/**
 * PasswordRecoveryView — Unified presentation shell for `/forgot-password` and
 * `/reset-password` recovery journeys.
 *
 * Unifies:
 * - Multi-step self-service recovery (`/forgot-password`)
 * - Direct OTP / `#token=` magic-link callback (`/reset-password`)
 * - Active-session notice + clean sign-out / post-reset session purge
 * - Dynamic backend PasswordPolicy validation and context preservation (`_tenant`, `redirect`, `email`)
 *
 * @module auth/password-reset/presentation/views
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { Button } from "@core/ui/button";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "@modules/auth/core/src/presentation/viewmodels/useTenantResolution";
import { VaultBackground } from "@modules/auth/core";
import { useLoginBrandingTokens } from "@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens";
import {
  usePasswordRecoveryViewModel,
  type PasswordRecoveryMode,
} from "../viewmodels/usePasswordRecoveryViewModel";
import { RequestStep } from "../components/RequestStep";
import { MethodStep } from "../components/MethodStep";
import { OtpStep } from "../components/OtpStep";
import { WorkspacesStep } from "../components/WorkspacesStep";
import { NewPasswordStep } from "../components/NewPasswordStep";
import { SuccessStep } from "../components/SuccessStep";

export interface PasswordRecoveryViewProps {
  mode: PasswordRecoveryMode;
}

/**
 * Shared Vault-surface view rendering all password recovery states for both routes.
 */
export function PasswordRecoveryView({ mode }: PasswordRecoveryViewProps) {
  const { t, direction } = useI18n();
  const { tenantId, branding } = useTenantResolution(
    mode === "reset" ? "reset-password" : "forgot-password"
  );

  useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const vm = usePasswordRecoveryViewModel({
    mode,
    tenantId,
    brandingPolicy: branding?.passwordPolicy ?? null,
    fallbackErrorMessage: mode === "reset" ? t("auth.resetFailed") : t("auth.resetPasswordFailedError"),
  });

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
      "verifying-link": 3,
      workspaces: 4,
      "new-password": 5,
      success: 5,
      "invalid-link": 1,
    }[vm.step] ?? 1;

  const canGoBackStep =
    mode === "forgot" &&
    (vm.step === "method" ||
      vm.step === "otp" ||
      vm.step === "workspaces" ||
      vm.step === "new-password");

  const cardStyle: React.CSSProperties = {
    background: "var(--sx-card-bg)",
    border: "1px solid var(--sx-card-border)",
  };

  return (
    <div
      className="vault-stage relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden"
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />

      <div className="absolute start-6 top-6 z-20 flex items-center gap-2.5">
        <Image src="/brand/app-logo.svg" alt="" width={28} height={28} aria-hidden="true" />
        <span
          className="text-base font-semibold tracking-tight"
          style={{ color: "var(--sx-text)" }}
        >
          {companyName}
        </span>
      </div>

      <div className="absolute end-6 top-6 z-20 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <main className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
        {vm.step !== "verifying-link" && (
          <div className="mb-5 flex w-full items-center justify-between">
            {canGoBackStep ? (
              <Button
                type="button"
                variant="ghost"
                onClick={vm.goBack}
                className="inline-flex h-auto items-center gap-1.5 p-0 text-[13px] font-medium transition-colors hover:bg-transparent hover:opacity-80"
                style={{ color: "var(--sx-text-mute)" }}
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                {t("auth.back")}
              </Button>
            ) : (
              <Link
                href={vm.loginHref}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--sx-text-mute)" }}
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                {t("auth.backToLogin")}
              </Link>
            )}

            {mode === "forgot" && vm.step !== "success" && vm.step !== "invalid-link" && (
              <span className="text-[11px] font-medium" style={{ color: "var(--sx-text-faint)" }}>
                {stepIndex}/{totalSteps}
              </span>
            )}
          </div>
        )}

        <div className="sx-screen w-full rounded-[20px] p-8 sm:p-9" style={cardStyle}>
          {vm.hasActiveSession && vm.step !== "success" && vm.step !== "verifying-link" && (
            <div
              className="mb-6 flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-start"
              role="status"
              data-testid="recovery-active-session-notice"
            >
              <div className="flex items-start gap-2.5">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-nx-warning-strong"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold" style={{ color: "var(--sx-text)" }}>
                    {t("auth.recoveryActiveSessionTitle")}
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                    {vm.activeSessionEmail
                      ? t("auth.recoveryActiveSessionDesc").replace(
                          "{{email}}",
                          vm.activeSessionEmail
                        )
                      : t("auth.recoveryActiveSessionDescAnonymous")}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--sx-text-faint)" }}>
                    {t("auth.recoverySigningOutNotice")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  loading={vm.isSigningOutSession}
                  disabled={vm.isSigningOutSession}
                  onClick={() => void vm.signOutActiveSession()}
                  className="h-8 text-[12px]"
                >
                  {vm.isSigningOutSession
                    ? t("auth.recoverySigningOut")
                    : t("auth.recoverySignOutAndContinue")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={vm.returnToDashboard}
                  className="h-8 text-[12px]"
                  style={{ color: "var(--sx-text-mute)" }}
                >
                  {t("auth.recoveryReturnToDashboard")}
                </Button>
              </div>
            </div>
          )}

          {vm.step === "verifying-link" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <Loader2
                className="h-8 w-8 animate-spin motion-reduce:animate-none"
                style={{ color: "var(--sx-accent-text)" }}
                aria-hidden="true"
              />
              <p className="text-[14px]" style={{ color: "var(--sx-text-mute)" }}>
                {t("auth.verifyingLink")}
              </p>
            </div>
          )}

          {vm.step === "invalid-link" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
                <AlertTriangle className="h-7 w-7 text-nx-warning-strong" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h1
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: "var(--sx-text)" }}
                >
                  {t("auth.invalidResetLink")}
                </h1>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.invalidResetLinkDesc")}
                </p>
              </div>
              <Button
                asChild
                className="h-12 w-full rounded-xl text-[15px] font-semibold text-nx-on-fill transition-all active:scale-[0.985]"
              >
                <Link href={vm.forgotPasswordHref}>{t("auth.requestNewLink")}</Link>
              </Button>
            </div>
          )}

          {vm.step === "request" && <RequestStep vm={vm} totalSteps={totalSteps} />}
          {vm.step === "method" && <MethodStep vm={vm} totalSteps={totalSteps} />}
          {vm.step === "otp" && <OtpStep vm={vm} totalSteps={totalSteps} />}
          {vm.step === "workspaces" && (
            <WorkspacesStep vm={vm} totalSteps={totalSteps} showStepDots={mode === "forgot"} />
          )}
          {vm.step === "new-password" && (
            <NewPasswordStep vm={vm} totalSteps={totalSteps} showStepDots={mode === "forgot"} />
          )}
          {vm.step === "success" && <SuccessStep vm={vm} />}
        </div>

        <p className="mt-8 text-[11px]" style={{ color: "var(--sx-text-faint)" }}>
          © {new Date().getFullYear()} {companyName}
        </p>
      </main>

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
