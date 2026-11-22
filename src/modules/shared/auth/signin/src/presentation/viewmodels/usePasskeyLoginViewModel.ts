"use client";

import { useState, useCallback, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { PasskeyAuthVerifyResult } from "@modules/auth/core/domain/types/AuthTypes";
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
  onSuccess: (result: PasskeyAuthVerifyResult) => void,
  tenantId?: string | null,
  identifier?: string
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
      // Step 1: Begin authentication — get flat PasskeyAuthenticationOptions (or fallback wrapper) from server
      const beginResponse = await authRepository.beginPasskeyAuth(identifier, tenantId);

      // Step 2: Resolve challenge & options cleanly across flat/wrapped payloads and call WebAuthn API
      const publicKeyOptions = (beginResponse.options ?? beginResponse) as {
        challenge: string | ArrayBuffer;
        rpId?: string;
        timeout?: number;
        allowCredentials?: Array<{
          id: string | ArrayBuffer;
          type?: string;
          transports?: string[];
        }>;
        userVerification?: UserVerificationRequirement;
      };

      const challengeStr =
        typeof publicKeyOptions.challenge === "string"
          ? publicKeyOptions.challenge
          : bufferToBase64Url(publicKeyOptions.challenge);

      const allowCreds = publicKeyOptions.allowCredentials?.map((cred) => ({
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

      // Step 3: Send assertion + challengeToken + clientExtensionResults to server for verification
      const verifyResult = await authRepository.verifyPasskeyAuth({
        challengeToken: beginResponse.challengeToken ?? beginResponse.challengeId ?? null,
        challengeId: beginResponse.challengeId,
        credentialId: assertion.credentialIdBase64,
        rawId: assertion.credentialIdBase64,
        clientDataJSON: assertion.clientDataJsonBase64,
        authenticatorData: assertion.authenticatorDataBase64,
        signature: assertion.signatureBase64,
        userHandle: assertion.userHandleBase64,
        clientExtensionResults: assertion.clientExtensionResults,
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
  }, [isSupported, onSuccess, t, authRepository, tenantId, identifier]);

  return {
    isLoading,
    error,
    isSupported,
    authenticateWithPasskey,
  };
}
