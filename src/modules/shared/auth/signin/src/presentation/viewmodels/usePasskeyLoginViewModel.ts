"use client";

import { useState, useCallback, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import {
  assertPasskey,
  isWebAuthnAvailable,
  bufferToBase64Url,
} from "@core/services/webauthn.service";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for use passkey login view model return.
 */
export interface UsePasskeyLoginViewModelReturn {
  // State
  isLoading: boolean;
  error: string;
  isSupported: boolean;

  // Actions
  authenticateWithPasskey: () => Promise<void>;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * usePasskeyLoginViewModel — Business logic for WebAuthn/FIDO2 Passkey login.
 *
 * Extracted from PasskeyPrompt.tsx to enforce SCRIPE MVVM architecture:
 * View → ViewModel → Repository → Service → HTTP
 *
 * Per auth-methods.md §2 Passkey / WebAuthn:
 * 1. Calls GET /passkeys/authentication/begin to get challenge
 * 2. Invokes assertPasskey() from @core/services/webauthn.service
 * 3. Posts assertion to /passkeys/authentication/verify
 *
 * Browser Support:
 * - Checks WebAuthn availability via isWebAuthnAvailable()
 * - Falls back to "not supported" message on unsupported browsers
 * - Handles AbortError, NotAllowedError, SecurityError gracefully
 */
export function usePasskeyLoginViewModel(
  onSuccess: (result: { accessToken: string; refreshToken: string }) => void,
  tenantId?: string | null
): UsePasskeyLoginViewModelReturn {
  const { t } = useI18n();
  const { authRepository } = authContainer;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  // Check browser support via webauthn service
  useEffect(() => {
    isWebAuthnAvailable().then((supported) => {
      setIsSupported(supported);
    });
  }, []);

  // ── Passkey authenticate flow ──
  const authenticateWithPasskey = useCallback(async () => {
    if (!isSupported) return;
    setIsLoading(true);
    setError("");

    try {
      // Step 1: Begin authentication — get challenge from server
      const beginResponse = await authRepository.beginPasskeyAuth();

      // Step 2: Call WebAuthn browser API via webauthn service
      const publicKeyOptions = beginResponse.options;

      const challengeStr =
        typeof publicKeyOptions.challenge === "string"
          ? publicKeyOptions.challenge
          : bufferToBase64Url(publicKeyOptions.challenge as ArrayBuffer);

      const allowCreds = publicKeyOptions.allowCredentials?.map((cred: any) => ({
        id: typeof cred.id === "string" ? cred.id : bufferToBase64Url(cred.id),
        type: (cred.type || "public-key") as "public-key",
        transports: cred.transports,
      }));

      const assertion = await assertPasskey({
        challenge: challengeStr,
        rpId: publicKeyOptions.rpId,
        timeout: publicKeyOptions.timeout,
        allowCredentials: allowCreds,
        userVerification: publicKeyOptions.userVerification,
      });

      // Step 3: Send assertion to server for verification
      const verifyResult = await authRepository.verifyPasskeyAuth({
        challengeId: beginResponse.challengeId,
        credentialId: assertion.credentialIdBase64,
        rawId: assertion.credentialIdBase64,
        clientDataJSON: assertion.clientDataJsonBase64,
        authenticatorData: assertion.authenticatorDataBase64,
        signature: assertion.signatureBase64,
        userHandle: assertion.userHandleBase64,
        tenantId,
      });

      onSuccess(verifyResult);
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific WebAuthn errors
        if (err.name === "NotAllowedError") {
          setError(
            t("auth.passkey.notAllowed") ||
              "Authentication was denied or timed out. Please try again."
          );
        } else if (err.name === "AbortError") {
          setError(t("auth.passkey.cancelled") || "Authentication was cancelled.");
        } else if (err.name === "SecurityError") {
          setError(
            t("auth.passkey.securityError") ||
              "Security error. Please ensure you're on a secure connection."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError(t("auth.passkey.failed") || "Passkey authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, onSuccess, t, authRepository, tenantId]);

  return {
    isLoading,
    error,
    isSupported,
    authenticateWithPasskey,
  };
}
