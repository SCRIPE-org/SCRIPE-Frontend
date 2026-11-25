"use client";

/**
 * PasskeyPrompt — WebAuthn/FIDO2 Passkey authentication screen
 *
 * Modernized Relay vNext presentation utilizing Lucide React icons,
 * Nexus design tokens, and strict @core/ui/* button primitives.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { PasskeyAuthVerifyResult } from "@modules/auth/core/domain/types/AuthTypes";
import { usePasskeyLoginViewModel } from "../viewmodels/usePasskeyLoginViewModel";
import { Fingerprint, AlertCircle, Loader2, ArrowLeft, ShieldX } from "lucide-react";

/** Props for {@link PasskeyPrompt}. */
interface PasskeyPromptProps {
  onSuccess: (result: PasskeyAuthVerifyResult) => void | Promise<void>;
  onTwoFactorRequired?: (pendingToken: string, staySignedIn: boolean) => void;
  onBack: () => void;
  isRTL: boolean;
  tenantId?: string | null;
  identifier?: string;
}

/** WebAuthn / FIDO2 biometric passkey sign-in prompt view. */
export function PasskeyPrompt({
  onSuccess,
  onTwoFactorRequired,
  onBack,
  isRTL,
  tenantId,
  identifier,
}: PasskeyPromptProps) {
  const { t } = useI18n();
  const vm = usePasskeyLoginViewModel(onSuccess, tenantId, identifier, onTwoFactorRequired);

  // ── Not supported state ──
  if (!vm.isSupported) {
    return (
      <div className="w-full space-y-5 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 text-nx-danger">
          <ShieldX className="h-7 w-7" style={{ minWidth: 28, minHeight: 28 }} />
        </div>
        <h2 className="text-base font-bold text-nx-ink">
          {t("auth.passkey.notSupportedTitle") || "Passkeys not supported"}
        </h2>
        <p className="text-xs text-nx-ink-2 max-w-xs mx-auto">
          {t("auth.passkey.notSupportedDesc") ||
            "Your browser doesn't support passkeys. Please use a different sign-in method."}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mx-auto text-xs text-nx-accent hover:underline gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <span>{t("signup.common.back") || "Back to sign in"}</span>
        </Button>
      </div>
    );
  }

  // ── Main UI ──
  return (
    <div className="w-full space-y-6 text-center" dir={isRTL ? "rtl" : "ltr"}>
      {/* Fingerprint icon container */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        {vm.isLoading && (
          <div className="absolute inset-0 rounded-2xl border-2 border-nx-accent animate-ping motion-reduce:animate-none" />
        )}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-nx-accent-wash border border-nx-line-hi text-nx-accent">
          {vm.isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none" />
          ) : (
            <Fingerprint className="h-8 w-8" style={{ minWidth: 32, minHeight: 32 }} />
          )}
        </div>
      </div>

      {/* Title & subtitle */}
      <div>
        <h2 className="text-base font-bold text-nx-ink">
          {t("auth.passkey.title") || "Sign in with passkey"}
        </h2>
        <p className="mt-1 text-xs text-nx-ink-2">
          {vm.isLoading
            ? t("auth.passkey.waiting") || "Waiting for your biometric sensor or key…"
            : t("auth.passkey.subtitle") ||
              "Use your fingerprint, face, or security key to sign in"}
        </p>
      </div>

      {/* Error Announcement */}
      {vm.error && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-start flex items-center gap-2 text-xs text-nx-danger"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
          <p className="font-medium">{vm.error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2.5">
        <Button
          type="button"
          data-testid="passkey-authenticate-btn"
          onClick={() => void vm.authenticateWithPasskey()}
          disabled={vm.isLoading}
          className="w-full h-10 text-xs font-semibold gap-2"
        >
          {vm.isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
              <span>{t("auth.passkey.authenticating") || "Authenticating…"}</span>
            </>
          ) : (
            <>
              <Fingerprint className="h-3.5 w-3.5" />
              <span>{t("auth.passkey.cta") || "Use passkey"}</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mx-auto block text-xs text-nx-ink-2 hover:text-nx-ink hover:underline"
        >
          {t("auth.passkey.otherMethods") || "Use another sign-in method"}
        </Button>
      </div>
    </div>
  );
}
