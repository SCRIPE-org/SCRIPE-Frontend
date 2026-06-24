"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Mail, Fingerprint, Smartphone, QrCode } from "lucide-react";
import type { LoginFormData } from "../viewmodels/use-login-viewmodel";
import { CredentialsFormHeader } from "./CredentialsFormHeader";
import { MethodChipsSection } from "./MethodChipsSection";
import { IdentifierInput } from "./IdentifierInput";
import { CredentialsPasswordInput } from "./CredentialsPasswordInput";
import { FormOptions } from "./FormOptions";

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
      className="flex flex-col gap-[var(--login-gap,16px)]"
      role="form"
      aria-label={t("auth.loginFormAriaLabel")}
      noValidate
    >
      {/* ── Heading: eyebrow + title + subtitle ────────── */}
      <CredentialsFormHeader t={t} />

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
          {...(errorAnnounce ? { "aria-live": "assertive" as const, "aria-atomic": "true" } : {})}
        >
          <span className="mt-0.5 shrink-0">⚠</span>
          <p className="text-[13px] font-medium leading-snug">
            {error.startsWith("auth.") ? t(error as any) : error}
          </p>
        </div>
      )}

      {/* ── Identifier ─────────────────────────────────── */}
      <IdentifierInput
        value={formData.identifier}
        onChange={(val) => updateField("identifier", val)}
        disabled={isLoading}
        hasError={!!error}
        t={t}
      />

      {/* ── Password ───────────────────────────────────── */}
      <CredentialsPasswordInput
        value={formData.password}
        onChange={(val) => updateField("password", val)}
        showPassword={showPassword}
        onToggleShowPassword={togglePasswordVisibility}
        disabled={isLoading}
        hasError={!!error}
        t={t}
      />

      {/* ── Stay signed in + Forgot password (same row) ── */}
      <FormOptions
        staySignedIn={staySignedIn}
        onStaySignedInChange={setStaySignedIn}
        disabled={isLoading}
        t={t}
      />

      {/* ── Primary CTA with inner shine ──────────────── */}
      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="relative mt-1 flex h-[var(--login-input-height,48px)] w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[15px] font-semibold text-white shadow-none transition-all active:scale-[0.98] disabled:opacity-50"
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
              <LoadingSpinner size="inline" showText={false} />
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
      <MethodChipsSection methodChips={methodChips} isLoading={isLoading} t={t} />
    </form>
  );
}
