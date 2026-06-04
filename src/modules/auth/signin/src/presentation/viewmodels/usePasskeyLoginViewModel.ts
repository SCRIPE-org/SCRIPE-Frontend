"use client";

import { useState, useCallback, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsePasskeyLoginViewModelReturn {
  // State
  isLoading: boolean;
  error: string;
  isSupported: boolean;

  // Actions
  authenticateWithPasskey: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Decode base64url string to ArrayBuffer */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Encode ArrayBuffer to base64url string */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
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
 * 2. Invokes navigator.credentials.get() for biometric/security key
 * 3. Posts assertion to /passkeys/authentication/verify
 *
 * Browser Support:
 * - Checks window.PublicKeyCredential availability
 * - Falls back to "not supported" message on unsupported browsers
 * - Handles AbortError, NotAllowedError, SecurityError gracefully
 */
export function usePasskeyLoginViewModel(
  onSuccess: (result: { accessToken: string; refreshToken: string }) => void
): UsePasskeyLoginViewModelReturn {
  const { t } = useI18n();
  const { authRepository } = authContainer;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  // Check browser support
  useEffect(() => {
    if (typeof window !== "undefined" && !window.PublicKeyCredential) {
      setIsSupported(false);
    }
  }, []);

  // ── Passkey authenticate flow ──
  const authenticateWithPasskey = useCallback(async () => {
    if (!isSupported) return;
    setIsLoading(true);
    setError("");

    try {
      // Step 1: Begin authentication — get challenge from server
      const beginResponse = await authRepository.beginPasskeyAuth();

      // Step 2: Call WebAuthn browser API
      const publicKeyOptions = beginResponse.options;

      // Convert challenge from base64url to ArrayBuffer
      if (typeof publicKeyOptions.challenge === "string") {
        publicKeyOptions.challenge = base64urlToBuffer(
          publicKeyOptions.challenge as unknown as string
        );
      }

      // Convert allowCredentials ids from base64url to ArrayBuffer
      if (publicKeyOptions.allowCredentials) {
        for (const cred of publicKeyOptions.allowCredentials) {
          if (typeof cred.id === "string") {
            cred.id = base64urlToBuffer(cred.id as unknown as string);
          }
        }
      }

      const credential = (await navigator.credentials.get({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential | null;

      if (!credential) {
        setError(t("auth.passkey.cancelled") || "Authentication was cancelled.");
        return;
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // Step 3: Send assertion to server for verification
      const verifyResult = await authRepository.verifyPasskeyAuth({
        challengeId: beginResponse.challengeId,
        credentialId: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        authenticatorData: bufferToBase64url(response.authenticatorData),
        signature: bufferToBase64url(response.signature),
        userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
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
  }, [isSupported, onSuccess, t, authRepository]);

  return {
    isLoading,
    error,
    isSupported,
    authenticateWithPasskey,
  };
}
