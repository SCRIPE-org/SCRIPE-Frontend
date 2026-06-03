"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { usePasskeyLoginViewModel } from "../viewmodels/usePasskeyLoginViewModel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasskeyPromptProps {
  onSuccess: (result: { accessToken: string; refreshToken: string }) => void;
  onBack: () => void;
  isRTL: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PasskeyPrompt — WebAuthn/FIDO2 Passkey authentication (login-side, pure render)
 *
 * All business logic and WebAuthn ceremony lives in usePasskeyLoginViewModel.
 * This component is a pure render — no DI imports, no HTTP calls.
 *
 * Design: Vault aesthetic, fingerprint icon, pulse animation
 */
export function PasskeyPrompt({ onSuccess, onBack, isRTL }: PasskeyPromptProps) {
  const { t } = useI18n();
  const vm = usePasskeyLoginViewModel(onSuccess);

  // ── Not supported state ──
  if (!vm.isSupported) {
    return (
      <div className="sx-screen space-y-5 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="text-lg font-bold" style={{ color: "var(--sx-text)" }}>
          {t("auth.passkey.notSupportedTitle") || "Passkeys not supported"}
        </h2>
        <p className="text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.passkey.notSupportedDesc") ||
            "Your browser doesn't support passkeys. Please use a different sign-in method."}
        </p>
        <Button
          variant="link"
          onClick={onBack}
          className="mx-auto text-sm font-medium underline underline-offset-2"
          style={{ color: "var(--sx-accent-text)" }}
        >
          {t("signup.common.back") || "← Back"}
        </Button>
      </div>
    );
  }

  // ── Main UI ──
  return (
    <div className="sx-screen space-y-6 text-center" dir={isRTL ? "rtl" : "ltr"}>
      {/* Fingerprint icon with pulse */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        {/* Pulse rings */}
        {vm.isLoading && (
          <>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid rgba(168,85,247,0.3)",
                animation: "sxPop 1.5s ease-out infinite",
              }}
            />
            <div
              className="absolute inset-[-8px] rounded-full"
              style={{
                border: "1px solid rgba(168,85,247,0.15)",
                animation: "sxPop 1.5s ease-out 0.3s infinite",
              }}
            />
          </>
        )}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(124,58,237,0.1) 100%)",
            border: "1px solid rgba(168,85,247,0.3)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sx-accent, #A855F7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02.1 2.51.412 4.312M12 10a2 2 0 0 1 2 2c0 1.22-.112 2.7-.48 4.52M12 10V6.5" />
            <path d="M4.789 17.048a17.063 17.063 0 0 1-.263-2.548 7.5 7.5 0 0 1 15 0c0 1.674-.248 3.778-.848 6" />
            <path d="M8.145 17.486a29.12 29.12 0 0 1-.145-2.986 4 4 0 0 1 8 0c0 .74-.03 1.645-.112 2.7" />
            <path d="M17.76 19.938A14.1 14.1 0 0 0 18 17.5" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: "var(--sx-text)" }}>
          {t("auth.passkey.title") || "Sign in with passkey"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {vm.isLoading
            ? (t("auth.passkey.waiting") || "Waiting for your device…")
            : (t("auth.passkey.subtitle") ||
                "Use your fingerprint, face, or security key to sign in")}
        </p>
      </div>

      {/* Error */}
      {vm.error && (
        <div
          className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">{vm.error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          onClick={vm.authenticateWithPasskey}
          disabled={vm.isLoading}
          className="relative w-full overflow-hidden rounded-lg py-3 text-sm font-semibold"
          style={{
            background: "var(--sx-cta-gradient)",
            color: "#fff",
            boxShadow: "var(--sx-cta-shadow)",
          }}
        >
          {vm.isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="sx-spin1 inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
              {t("auth.passkey.authenticating") || "Authenticating…"}
            </span>
          ) : (
            t("auth.passkey.cta") || "Use passkey"
          )}
        </Button>

        <Button
          variant="link"
          onClick={onBack}
          className="mx-auto block text-sm font-medium underline underline-offset-2"
          style={{ color: "var(--sx-accent-text)" }}
        >
          {t("auth.passkey.otherMethods") || "Use another sign-in method"}
        </Button>
      </div>
    </div>
  );
}
