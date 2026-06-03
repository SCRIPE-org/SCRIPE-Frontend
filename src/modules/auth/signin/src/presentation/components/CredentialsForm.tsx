"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Mail, Fingerprint, Smartphone, QrCode } from "lucide-react";
import Link from "next/link";
import type { LoginFormData } from "../viewmodels/use-login-viewmodel";

interface CredentialsFormProps {
  formData: LoginFormData;
  showPassword: boolean;
  isLoading: boolean;
  isFormValid: boolean;
  error: string;
  /** Animation key — incremented by parent ViewModel on each new error. */
  shakeKey: number;
  isRTL: boolean;
  /** True when rendered on the platform login surface (shows "Create a workspace"). */
  isPlatformMode?: boolean;
  updateField: (field: keyof LoginFormData, value: string) => void;
  togglePasswordVisibility: () => void;
  handleLogin: () => void;
  /** Called when user clicks "Email me a sign-in link". Receives current identifier. */
  onMagicLinkRequest?: (identifier: string) => void;
  /** Auth method switch callbacks */
  onSwitchToPasskey?: () => void;
  onSwitchToPhoneOtp?: () => void;
  onSwitchToQrLogin?: () => void;
  errorAnnounce?: boolean;
}

export function CredentialsForm({
  formData,
  showPassword,
  isLoading,
  isFormValid,
  error,
  shakeKey,
  isRTL,
  isPlatformMode = false,
  updateField,
  togglePasswordVisibility,
  handleLogin,
  onMagicLinkRequest,
  onSwitchToPasskey,
  onSwitchToPhoneOtp,
  onSwitchToQrLogin,
  errorAnnounce = true,
}: CredentialsFormProps) {
  const { t } = useI18n();

  const [staySignedIn, setStaySignedIn] = useState(false);

  const arrow = isRTL ? "←" : "→";

  /* ── Method chip data ─────────────────────────────── */
  const methodChips = [
    onMagicLinkRequest && {
      key: "magic",
      icon: <Mail className="h-[13px] w-[13px]" aria-hidden="true" />,
      label: t("auth.magicLink.chip") || "Magic link",
      onClick: () => onMagicLinkRequest(formData.identifier),
    },
    onSwitchToPasskey && {
      key: "passkey",
      icon: <Fingerprint className="h-[13px] w-[13px]" aria-hidden="true" />,
      label: t("auth.passkey.chip") || "Passkey",
      onClick: onSwitchToPasskey,
    },
    onSwitchToPhoneOtp && {
      key: "phone",
      icon: <Smartphone className="h-[13px] w-[13px]" aria-hidden="true" />,
      label: t("auth.phoneOtp.chip") || "Phone OTP",
      onClick: onSwitchToPhoneOtp,
    },
    onSwitchToQrLogin && {
      key: "qr",
      icon: <QrCode className="h-[13px] w-[13px]" aria-hidden="true" />,
      label: t("auth.qr.chip") || "QR code",
      onClick: onSwitchToQrLogin,
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isLoading && isFormValid) handleLogin();
      }}
      className="flex flex-col gap-4"
      role="form"
      aria-label={t("auth.loginFormAriaLabel")}
      noValidate
    >
      {/* ── Heading: eyebrow + title + subtitle ────────── */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{
            color: "var(--sx-accent-text, hsl(var(--primary)))",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          }}
        >
          {t("auth.stepLabel") || "STEP 01 · IDENTIFY"}
        </div>
        <h2
          className="m-0 text-[26px] font-semibold leading-tight"
          style={{
            letterSpacing: "-0.02em",
            color: "var(--sx-text, hsl(var(--foreground)))",
          }}
        >
          {t("auth.signInHeading")}
        </h2>
        <p
          className="mt-1.5 text-[14px] leading-relaxed"
          style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
        >
          {t("auth.signInSubheading")}
        </p>
      </div>

      {/* ── Error alert (shakes on each new error) ─────── */}
      {error && (
        <div
          key={shakeKey}
          id="login-error"
          className="sx-shake flex items-start gap-2.5 rounded-xl p-3.5"
          role="alert"
          style={{
            background: "rgba(248,113,113,.10)",
            border: "1px solid rgba(248,113,113,.30)",
            color: "#FCA5A5",
          }}
          {...(errorAnnounce
            ? { "aria-live": "assertive" as const, "aria-atomic": "true" }
            : {})}
        >
          <span className="mt-0.5 shrink-0">⚠</span>
          <p className="text-[13px] font-medium leading-snug">{error}</p>
        </div>
      )}

      {/* ── Identifier ─────────────────────────────────── */}
      <div className="flex flex-col gap-[7px]">
        <Label
          htmlFor="identifier"
          className="block text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{
            color: "var(--sx-text-mute, hsl(var(--muted-foreground)))",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          }}
        >
          {t("auth.username")}
        </Label>
        <Input
          id="identifier"
          type="text"
          inputMode="email"
          value={formData.identifier}
          onChange={(e) => updateField("identifier", e.target.value)}
          required
          dir="ltr"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "login-error" : undefined}
          className="h-[48px] w-full rounded-xl border px-4 text-[15px] shadow-none transition-all duration-150 focus-visible:ring-0"
          style={{
            background: "var(--sx-field-bg, transparent)",
            borderColor: "var(--sx-field-border, hsl(var(--border)))",
            boxShadow: "var(--sx-field-inner-hi, none)",
          }}
          placeholder={t("auth.usernamePlaceholder")}
          disabled={isLoading}
          autoComplete="username email"
          autoFocus
        />
      </div>

      {/* ── Password ───────────────────────────────────── */}
      <div className="flex flex-col gap-[7px]">
        <Label
          htmlFor="password"
          className="block text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{
            color: "var(--sx-text-mute, hsl(var(--muted-foreground)))",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          }}
        >
          {t("auth.password")}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
            dir="ltr"
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "login-error" : undefined}
            className="h-[48px] w-full rounded-xl border px-4 text-[15px] shadow-none transition-all duration-150 focus-visible:ring-0 [&::-ms-reveal]:hidden"
            style={{
              paddingRight: "4rem",
              textAlign: "left",
              background: "var(--sx-field-bg, transparent)",
              borderColor: "var(--sx-field-border, hsl(var(--border)))",
              boxShadow: "var(--sx-field-inner-hi, none)",
            }}
            placeholder="••••••••••••"
            disabled={isLoading}
            autoComplete="current-password"
          />
          {/* Show/Hide toggle — mono text per design spec */}
          <Button
            type="button"
            variant="ghost"
            className="absolute top-0 flex items-center justify-center px-2.5 transition-colors hover:bg-transparent"
            style={{
              right: "4px",
              left: "auto",
              height: "48px",
              fontSize: 11,
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--sx-accent-text, hsl(var(--primary)))",
            }}
            onClick={togglePasswordVisibility}
            disabled={isLoading}
            tabIndex={-1}
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {showPassword ? (t("auth.hide") || "HIDE") : (t("auth.show") || "SHOW")}
          </Button>
        </div>
      </div>

      {/* ── Stay signed in + Forgot password (same row) ── */}
      <div
        className="flex items-center justify-between text-[12px]"
        style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
      >
        <label className="flex cursor-pointer items-center gap-2 select-none">
          <div
            role="checkbox"
            aria-checked={staySignedIn}
            tabIndex={0}
            onClick={() => !isLoading && setStaySignedIn(!staySignedIn)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                if (!isLoading) setStaySignedIn(!staySignedIn);
              }
            }}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all"
            style={{
              background: staySignedIn
                ? "linear-gradient(135deg, #A855F7, #3B82F6)"
                : "transparent",
              border: staySignedIn
                ? "1px solid transparent"
                : "1px solid var(--sx-field-border, hsl(var(--border)))",
              cursor: isLoading ? "default" : "pointer",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {staySignedIn && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span>{t("auth.staySignedIn")}</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-[12px] font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--sx-accent-text, hsl(var(--primary)))" }}
          tabIndex={0}
        >
          {t("auth.forgotPassword")}
        </Link>
      </div>

      {/* ── Primary CTA with inner shine ──────────────── */}
      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="relative mt-1 flex h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[15px] font-semibold text-white shadow-none transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        style={{
          background: "var(--sx-cta-gradient, hsl(var(--primary)))",
          boxShadow: "var(--sx-cta-shadow, none)",
          border: 0,
        }}
      >
        {/* Inner shine overlay */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--sx-cta-shine)" }}
          aria-hidden="true"
        />
        <span className="relative z-[1] inline-flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span
                className="sx-spin1 inline-block h-[14px] w-[14px] rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              {t("auth.signingIn")}
            </>
          ) : (
            <>
              {t("auth.loginButton")}
              <span className="opacity-85">{arrow}</span>
            </>
          )}
        </span>
      </Button>

      {/* ── Method chips (pills, directly below CTA) ──── */}
      {methodChips.length > 0 && (
        <div>
          <div
            className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.15em]"
            style={{
              color: "var(--sx-text-faint, hsl(var(--muted-foreground)/0.5))",
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
            }}
          >
            {t("auth.otherMethods") || "or use a different method"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {methodChips.map((chip) => (
              <Button
                key={chip.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={chip.onClick}
                disabled={isLoading}
                data-method-chip
                className="inline-flex items-center gap-1.5 rounded-full px-[11px] py-[7px] text-[12px] font-medium transition-all duration-150"
                style={{
                  background: "var(--sx-chip-bg, rgba(255,255,255,0.03))",
                  borderColor: "var(--sx-chip-border, rgba(255,255,255,0.08))",
                  color: "var(--sx-text-mute)",
                }}
              >
                <span style={{ color: "var(--sx-accent-text)", display: "inline-flex" }}>
                  {chip.icon}
                </span>
                <span>{chip.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ── Card footer: Create workspace + Systems operational ── */}
      <div
        className="flex items-center justify-between gap-2 border-t pt-[18px]"
        style={{
          marginTop: 22,
          borderColor: "var(--sx-divider, hsl(var(--border)))",
          fontSize: 12,
          color: "var(--sx-text-mute, hsl(var(--muted-foreground)))",
        }}
      >
        <span>
          {isPlatformMode ? (
            <>
              {t("auth.newHere") || "New here?"}{" "}
              <Link
                href="/signup"
                className="font-medium transition-colors hover:opacity-80"
                style={{
                  color: "var(--sx-text, hsl(var(--foreground)))",
                  textDecoration: "none",
                }}
              >
                {t("auth.createWorkspace")} {arrow}
              </Link>
            </>
          ) : (
            <span style={{ color: "var(--sx-text-faint)" }}>
              {t("auth.needAccount") || "Contact your workspace admin for access."}
            </span>
          )}
        </span>
        <span
          className="inline-flex shrink-0 items-center gap-1.5"
          style={{
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--sx-text-faint)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--sx-success-dot)",
              boxShadow: "0 0 6px var(--sx-success-dot)",
            }}
          />
          {t("auth.systemsOperational") || "systems · operational"}
        </span>
      </div>
    </form>
  );
}
