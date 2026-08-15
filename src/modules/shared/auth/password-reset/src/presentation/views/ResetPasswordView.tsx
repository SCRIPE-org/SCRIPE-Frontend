/**
 * ResetPasswordView — Magic-link password reset callback page (/reset-password?otp=CODE&email=EMAIL).
 *
 * Step machine (driven by useResetPasswordViewModel):
 *   verifying  → spinner while the backend validates the link
 *   workspaces → workspace picker (multi-tenant users choose which accounts to reset)
 *   password   → new password form
 *   success    → confirmation
 *   invalid    → expired / missing OTP
 *
 * Supports ?otp= (preferred) and legacy ?token= param.
 * Security: OTP validated server-side; UI shows generic error for wrong vs. expired (enumeration-safe).
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useLoginBrandingTokens } from "@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "@modules/auth/core/src/presentation/viewmodels/useTenantResolution";
import { VaultBackground } from "@modules/auth/core";
import { useResetPasswordViewModel } from "../viewmodels/useResetPasswordViewModel";
import { ResetWorkspacesStep } from "../components/ResetWorkspacesStep";
import { ResetPasswordStep } from "../components/ResetPasswordStep";

/**
 * ResetPasswordView component
 *
 * Callback page for magic-link password reset. Decouples steps (verifying, workspaces,
 * password, success, invalid) to comply with line limit guidelines and modular MVVM architecture.
 */
export function ResetPasswordView() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  // ?otp= is the primary param; fall back to legacy ?token= for old links.
  const token = searchParams?.get("token") || "";
  const otp = searchParams?.get("otp") || token;
  const email = searchParams?.get("email") || "";

  const { branding } = useTenantResolution("reset-password");

  useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const headline = t("auth.resetPassword");

  const vm = useResetPasswordViewModel({
    email,
    otp,
    fallbackErrorMessage: t("auth.resetFailed"),
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headline} — ${companyName}`;
    }
  }, [headline, companyName]);

  const wrapperClass =
    "vault-stage relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden";

  // Solid surface — DESIGN.md bans default glassmorphism.
  const cardStyle: React.CSSProperties = {
    background: "var(--sx-card-bg)",
    border: "1px solid var(--sx-card-border)",
    boxShadow: "var(--sx-card-shadow)",
  };

  const topActions = (
    <>
      {/* Masthead — the brand stays present on every auth surface */}
      <div className="absolute start-6 top-6 z-20 flex items-center gap-2.5">
        <Image src="/brand/app-logo.svg" alt="" width={28} height={28} aria-hidden="true" />
        <span
          className="text-base font-semibold tracking-tight"
          style={{ color: "var(--sx-text)" }}
        >
          {companyName}
        </span>
      </div>
      <div
        className="absolute right-6 top-6 z-20 flex items-center gap-1"
        style={direction === "rtl" ? { right: "auto", left: "1.5rem" } : {}}
      >
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </>
  );

  // ── Verifying ────────────────────────────────────────────────────────────
  if (vm.step === "verifying") {
    return (
      <div
        className={wrapperClass}
        dir={direction}
        style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
      >
        <VaultBackground />
        {topActions}
        <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
          <div className="sx-screen w-full rounded-[20px] p-8 text-center sm:p-9" style={cardStyle}>
            <div className="flex flex-col items-center gap-4">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: "var(--sx-accent-text)" }}
              />
              <p className="text-[14px]" style={{ color: "var(--sx-text-mute)" }}>
                {t("auth.verifyingLink")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Invalid / expired link ────────────────────────────────────────────────
  if (vm.step === "invalid") {
    return (
      <div
        className={wrapperClass}
        dir={direction}
        style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
      >
        <VaultBackground />
        {topActions}
        <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
          <div className="mb-5 w-full">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--sx-text-mute)" }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("auth.backToLogin")}
            </Link>
          </div>
          <div className="sx-screen w-full rounded-[20px] p-8 text-center sm:p-9" style={cardStyle}>
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
                <AlertTriangle className="h-7 w-7 text-warning" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: "var(--sx-text)" }}
                >
                  {t("auth.invalidResetLink")}
                </h2>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.invalidResetLinkDesc")}
                </p>
              </div>
              <Link href="/forgot-password" className="block w-full">
                <Button className="h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985]">
                  {t("auth.requestNewLink")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Workspace picker (multi-tenant) ───────────────────────────────────────
  if (vm.step === "workspaces") {
    return (
      <div
        className={wrapperClass}
        dir={direction}
        style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
      >
        <VaultBackground />
        {topActions}
        <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
          <div className="sx-screen w-full rounded-[20px] p-8 sm:p-9" style={cardStyle}>
            <ResetWorkspacesStep vm={vm} />
          </div>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (vm.step === "success") {
    return (
      <div
        className={wrapperClass}
        dir={direction}
        style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
      >
        <VaultBackground />
        {topActions}
        <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
          <div className="sx-screen w-full rounded-[20px] p-8 sm:p-9" style={cardStyle}>
            <div className="sx-pop flex flex-col items-center gap-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                <CheckCircle className="h-7 w-7 text-success" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: "var(--sx-text)" }}
                >
                  {t("auth.passwordResetSuccess")}
                </h2>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.passwordResetSuccessDesc")}
                </p>
              </div>
              <Button
                className="h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985]"
                onClick={() => router.push("/login")}
              >
                {t("auth.goToLogin")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Password entry form (step === "password") ─────────────────────────────
  return (
    <div
      className={wrapperClass}
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />
      {topActions}

      <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
        {/* Back link */}
        <div className="mb-5 w-full">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--sx-text-mute)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("auth.backToLogin")}
          </Link>
        </div>

        {/* Glass card */}
        <div className="sx-screen w-full rounded-[20px] p-8 sm:p-9" style={cardStyle}>
          <ResetPasswordStep vm={vm} headline={headline} />
        </div>

        {/* Footer */}
        <p className="mt-8 text-[11px]" style={{ color: "var(--sx-text-faint)" }}>
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </div>
  );
}
