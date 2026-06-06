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

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { PasswordInput } from "@core/ui/password-input";
import {
  ArrowLeft,
  Mail,
  Smartphone,
  CheckCircle,
  ShieldCheck,
  Lock,
  KeyRound,
  Inbox,
  ChevronRight,
  RefreshCw,
  Building2,
} from "lucide-react";
import { useLoginBrandingTokens } from "@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens";
import { resolveFileUrl } from "@core/common/utils";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "@modules/auth/core/src/presentation/viewmodels/useTenantResolution";
import { VaultBackground } from "@modules/auth/signin/src/presentation/components/layouts/VaultBackground";
// ARCH-EXCEPTION: pre-auth view — cannot use DI container (no auth context yet).
import { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";
import type { WorkspaceOption } from "../viewmodels/useForgotPasswordViewModel";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline step progress indicator */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current - 1 ? "1.5rem" : "0.375rem",
            background:
              i === current - 1
                ? "var(--sx-accent-text)"
                : i < current - 1
                  ? "var(--sx-accent-soft)"
                  : "var(--sx-chip-bg)",
          }}
        />
      ))}
    </div>
  );
}

/** Password strength bar */
function StrengthBar({ strength, labels }: { strength: number; labels: string[] }) {
  const colors = [
    "rgb(239,68,68)",
    "rgb(249,115,22)",
    "rgb(234,179,8)",
    "rgb(34,197,94)",
  ];
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: lvl <= strength ? colors[strength - 1] : "var(--sx-chip-bg)",
            }}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-[11px]" style={{ color: colors[strength - 1] }}>
          {labels[strength - 1]}
        </p>
      )}
    </div>
  );
}

/** Workspace card for picker step */
function WorkspacePickCard({
  workspace,
  onSelect,
}: {
  workspace: WorkspaceOption;
  onSelect: (w: WorkspaceOption) => void;
}) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => onSelect(workspace)}
      className="group flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.99]"
      style={{
        background: "var(--sx-chip-bg)",
        borderColor: "var(--sx-chip-border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-accent-text)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-accent-soft)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-chip-border)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-chip-bg)";
      }}
    >
      {/* Logo / Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ background: "var(--sx-accent-soft)", border: "1px solid var(--sx-accent-soft-border)" }}
      >
        {workspace.logoUrl ? (
          <img
            src={resolveFileUrl(workspace.logoUrl)}
            alt={workspace.tenantName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Building2 className="h-5 w-5" style={{ color: "var(--sx-accent-text)" }} />
        )}
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold" style={{ color: "var(--sx-text)" }}>
          {workspace.tenantName}
        </p>
        {workspace.isPlatformAdmin && (
          <p className="text-[11px]" style={{ color: "var(--sx-text-mute)" }}>
            {t("auth.workspaceSelection.platform")}
          </p>
        )}
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: "var(--sx-text-mute)" }}
      />
    </button>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const chars = value.split("").concat(Array(6).fill("")).slice(0, 6);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      {/* Hidden real input */}
      <input
        ref={inputRef}
        id="reset-otp"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        autoComplete="one-time-code"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
        aria-label="6-digit verification code"
        autoFocus
      />
      {/* Visual digit boxes */}
      <div className="flex gap-2.5 justify-center" onClick={() => inputRef.current?.focus()}>
        {chars.map((ch, i) => (
          <div
            key={i}
            className="flex h-13 w-11 items-center justify-center rounded-xl border text-[22px] font-bold transition-all"
            style={{
              height: "3.25rem",
              background: ch ? "var(--sx-accent-soft)" : "var(--sx-chip-bg)",
              borderColor:
                i === value.length
                  ? "var(--sx-accent-text)"
                  : ch
                    ? "var(--sx-accent-soft-border)"
                    : "var(--sx-chip-border)",
              color: "var(--sx-text)",
              boxShadow: i === value.length ? "0 0 0 3px var(--sx-accent-ring, rgba(139,92,246,.18))" : undefined,
            }}
          >
            {ch || (i === value.length ? <span className="sx-caret h-5 w-0.5 rounded-full" style={{ background: "var(--sx-accent-text)" }} /> : "")}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ForgotPasswordView() {
  const { t, direction } = useI18n();
  const { branding } = useTenantResolution("forgot-password");

  const { slotConfig, a11y } = useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";

  const vm = useForgotPasswordViewModel();

  /**
   * Resolve vm.error — if the ViewModel emits a locale key as a fallback
   * (e.g. "auth.otpInvalidOrExpired"), translate it; otherwise show as-is
   * (the backend already localises its own error messages).
   */
  const resolveError = (err: string) => {
    if (!err) return "";
    // Keys look like "auth.xxx.yyy" — check and translate them
    if (err.startsWith("auth.")) {
      try {
        const translated = t(err as Parameters<typeof t>[0]);
        return translated ?? err;
      } catch {
        return err;
      }
    }
    return err;
  };


  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t("auth.resetPassword")} — ${companyName}`;
    }
  }, [companyName, t]);

  const strengthLabels = [
    t("auth.passwordStrengthWeak"),
    t("auth.passwordStrengthFair"),
    t("auth.passwordStrengthGood"),
    t("auth.passwordStrengthStrong"),
  ];

  // ── Step helpers ──
  const totalSteps = 5;
  const stepIndex = {
    request: 1,
    method: 2,
    otp: 3,
    workspaces: 4,
    newPassword: 5,
    success: 5,
  }[vm.step] ?? 1;

  const showBack =
    vm.step !== "request" &&
    vm.step !== "success" &&
    !(vm.step === "method"); // let user go back on method step

  return (
    <div
      className="vault-stage relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />

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
            <button
              type="button"
              onClick={vm.goBack}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--sx-text-mute)" }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("auth.back")}
            </button>
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

        {/* Glass card */}
        <div
          className="sx-screen w-full rounded-[20px] p-8 sm:p-9"
          style={{
            background: "var(--sx-card-bg)",
            border: "1px solid var(--sx-card-border)",
            boxShadow: "var(--sx-card-shadow)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* ─────────────── STEP 1: Enter Email ─────────────── */}
          {vm.step === "request" && (
            <div className="flex flex-col gap-6">
              {/* Icon + heading */}
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "var(--sx-accent-soft)", border: "1px solid var(--sx-accent-soft-border)" }}
                >
                  <KeyRound className="h-6 w-6" style={{ color: "var(--sx-accent-text)" }} aria-hidden="true" />
                </div>
                <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em]" style={{ color: "var(--sx-text)" }}>
                  {t("auth.forgotPasswordTitle")}
                </h1>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.forgotPasswordSubtitle")}
                </p>
              </div>

              {/* Step dots */}
              <StepDots current={1} total={totalSteps} />

              <form onSubmit={vm.submitEmail} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fp-email"
                    className="block text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--sx-text-mute)" }}
                  >
                    {t("auth.email")}
                  </Label>
                  <Input
                    id="fp-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={vm.email}
                    onChange={(e) => vm.setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!vm.canSubmitEmail}
                  className="mt-1 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
                >
                  {t("auth.sendResetLink")}
                </Button>
              </form>
            </div>
          )}

          {/* ─────────────── STEP 2: Choose Method ─────────────── */}
          {vm.step === "method" && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "var(--sx-accent-soft)", border: "1px solid var(--sx-accent-soft-border)" }}
                >
                  <ShieldCheck className="h-6 w-6" style={{ color: "var(--sx-accent-text)" }} aria-hidden="true" />
                </div>
                <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em]" style={{ color: "var(--sx-text)" }}>
                  {t("auth.chooseMethodTitle")}
                </h1>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.chooseMethodSubtitle").replace("{{email}}", "")}{" "}
                  <strong style={{ color: "var(--sx-text)" }}>{vm.email}</strong>
                </p>
              </div>

              <StepDots current={2} total={totalSteps} />

              <div className="flex flex-col gap-3">
                {/* OTP option */}
                <button
                  type="button"
                  onClick={() => vm.chooseMethod("otp")}
                  disabled={vm.isLoading}
                  className="group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50"
                  style={{
                    background: "var(--sx-chip-bg)",
                    borderColor: "var(--sx-chip-border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-accent-text)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-accent-soft)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-chip-border)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-chip-bg)";
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "var(--sx-accent-soft)", border: "1px solid var(--sx-accent-soft-border)" }}
                  >
                    <Smartphone className="h-5 w-5" style={{ color: "var(--sx-accent-text)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold" style={{ color: "var(--sx-text)" }}>
                      {t("auth.otpMethodLabel")}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--sx-text-mute)" }}>
                      {t("auth.otpMethodDesc")}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--sx-text-mute)" }}
                  />
                </button>

                {/* Magic Link option */}
                <button
                  type="button"
                  onClick={() => vm.chooseMethod("magic-link")}
                  disabled={vm.isLoading}
                  className="group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50"
                  style={{
                    background: "var(--sx-chip-bg)",
                    borderColor: "var(--sx-chip-border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-accent-text)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-accent-soft)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-chip-border)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-chip-bg)";
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "var(--sx-accent-soft)", border: "1px solid var(--sx-accent-soft-border)" }}
                  >
                    <Inbox className="h-5 w-5" style={{ color: "var(--sx-accent-text)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold" style={{ color: "var(--sx-text)" }}>
                      {t("auth.magicLinkMethodLabel")}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--sx-text-mute)" }}>
                      {t("auth.magicLinkMethodDesc")}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--sx-text-mute)" }}
                  />
                </button>
              </div>

              {vm.isLoading && (
                <div className="flex justify-center">
                  <span className="sx-spin1 inline-block h-5 w-5 rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sx-accent-text)", borderTopColor: "transparent" }} />
                </div>
              )}
            </div>
          )}

          {/* ─────────────── STEP 3: Enter OTP ─────────────── */}
          {vm.step === "otp" && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "var(--sx-accent-soft)", border: "1px solid var(--sx-accent-soft-border)" }}
                >
                  <Mail className="h-6 w-6" style={{ color: "var(--sx-accent-text)" }} aria-hidden="true" />
                </div>
                <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em]" style={{ color: "var(--sx-text)" }}>
                  {t("auth.enterOtpTitle")}
                </h1>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.enterOtpSubtitle").replace("{{email}}", "")}{" "}
                  <strong style={{ color: "var(--sx-text)" }}>{vm.email}</strong>
                </p>
              </div>

              <StepDots current={3} total={totalSteps} />

              <form onSubmit={vm.submitOtp} className="flex flex-col gap-5">
                <OtpInput value={vm.otp} onChange={vm.setOtp} />

                {vm.error && (
                  <div
                    className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
                    role="alert"
                    aria-live="assertive"
                  >
                    <p className="text-[13px] font-medium text-destructive">{resolveError(vm.error)}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!vm.canSubmitOtp || vm.isLoading}
                  loading={vm.isLoading}
                  className="flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
                >
                  {t("auth.verifyCode")}
                </Button>
              </form>

              {/* Resend */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={vm.resendCode}
                  disabled={vm.cooldown > 0 || vm.isLoading}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-all disabled:opacity-40"
                  style={{ color: "var(--sx-text-mute)" }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {vm.cooldown > 0
                    ? t("auth.resendCooldown").replace("{{seconds}}", String(vm.cooldown))
                    : t("auth.resendCode")}
                </button>
              </div>
            </div>
          )}

          {/* ─────────────── STEP 4: Workspace Picker ─────────────── */}
          {vm.step === "workspaces" && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "var(--sx-accent-soft)", border: "1px solid var(--sx-accent-soft-border)" }}
                >
                  <Building2 className="h-6 w-6" style={{ color: "var(--sx-accent-text)" }} aria-hidden="true" />
                </div>
                <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em]" style={{ color: "var(--sx-text)" }}>
                  {t("auth.forgotPickWorkspaceTitle")}
                </h1>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.forgotPickWorkspaceSubtitle")}
                </p>
              </div>

              <StepDots current={4} total={totalSteps} />

              <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
                {vm.workspaces.map((w) => (
                  <WorkspacePickCard key={w.tenantId} workspace={w} onSelect={vm.selectWorkspace} />
                ))}
              </div>
            </div>
          )}

          {/* ─────────────── STEP 5: New Password ─────────────── */}
          {vm.step === "newPassword" && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "var(--sx-accent-soft)", border: "1px solid var(--sx-accent-soft-border)" }}
                >
                  <Lock className="h-6 w-6" style={{ color: "var(--sx-accent-text)" }} aria-hidden="true" />
                </div>
                <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em]" style={{ color: "var(--sx-text)" }}>
                  {t("auth.resetPassword")}
                </h1>
                {vm.selectedWorkspace && (
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                    {t("auth.resetPasswordFor").replace("{{workspace}}", vm.selectedWorkspace.tenantName)}
                  </p>
                )}
              </div>

              <StepDots current={5} total={totalSteps} />

              <form onSubmit={vm.submitNewPassword} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fp-new-password"
                    className="block text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--sx-text-mute)" }}
                  >
                    {t("auth.newPassword")}
                  </Label>
                  <PasswordInput
                    id="fp-new-password"
                    value={vm.newPassword}
                    onChange={(e) => vm.setNewPassword(e.target.value)}
                    placeholder={t("auth.newPasswordPlaceholder")}
                    required
                    autoFocus
                    minLength={8}
                    className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
                  />
                  {vm.newPassword.length > 0 && (
                    <StrengthBar strength={vm.passwordStrength} labels={strengthLabels} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fp-confirm-password"
                    className="block text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--sx-text-mute)" }}
                  >
                    {t("auth.confirmPassword")}
                  </Label>
                  <PasswordInput
                    id="fp-confirm-password"
                    value={vm.confirmPassword}
                    onChange={(e) => vm.setConfirmPassword(e.target.value)}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    required
                    minLength={8}
                    className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
                  />
                  {vm.confirmPassword.length > 0 && (
                    <p
                      className="text-[12px]"
                      style={{ color: vm.passwordsMatch ? "rgb(34,197,94)" : "hsl(var(--destructive))" }}
                    >
                      {vm.passwordsMatch ? `✓ ${t("auth.accountSetup.passwordsMatch")}` : t("auth.passwordMismatch")}
                    </p>
                  )}
                </div>

                {vm.error && (
                  <div
                    className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
                    role="alert"
                    aria-live="assertive"
                  >
                    <p className="text-[13px] font-medium text-destructive">{resolveError(vm.error)}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!vm.canSubmitNewPassword}
                  loading={vm.isLoading}
                  className="mt-1 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
                >
                  {t("auth.resetPasswordAction")}
                </Button>
              </form>
            </div>
          )}

          {/* ─────────────── STEP 6: Success ─────────────── */}
          {vm.step === "success" && (
            <div className="sx-pop flex flex-col items-center gap-6 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                {vm.method === "magic-link" ? (
                  <Mail className="h-7 w-7 text-emerald-500" aria-hidden="true" />
                ) : (
                  <CheckCircle className="h-7 w-7 text-emerald-500" aria-hidden="true" />
                )}
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--sx-text)" }}>
                  {vm.method === "magic-link" ? t("auth.magicLinkSentTitle") : t("auth.resetSuccessTitle")}
                </h2>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {vm.method === "magic-link"
                    ? t("auth.magicLinkSentSubtitle").replace("{{email}}", vm.email)
                    : t("auth.resetSuccessSubtitle")}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <Link href="/login" className="block">
                  <Button className="h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985]">
                    {vm.method === "magic-link" ? t("auth.backToLogin") : t("auth.goToLogin")}
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={vm.restart}
                  className="h-11 w-full rounded-xl text-[13px] font-medium transition-colors"
                  style={{ color: "var(--sx-text-mute)" }}
                >
                  {t("auth.tryAnotherEmail")}
                </button>
              </div>
            </div>
          )}
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
