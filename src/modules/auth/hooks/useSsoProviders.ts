/**
 * useSsoProviders — SSO Provider Hook
 *
 * Fetches available SSO identity providers for the admin login page,
 * initiates PKCE-based OIDC challenges, and handles callbacks.
 *
 * Flow:
 *  1. Login page calls useSsoProviders() → fetches button list
 *  2. User clicks SSO button → initiateSsoLogin(providerId) creates challenge,
 *     stores PKCE state in sessionStorage, redirects to IdP
 *  3. IdP redirects back to /sso/callback?code=...&state=...
 *  4. Callback page calls completeSsoLogin() → exchanges code for account info
 *
 * @module auth/hooks
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { getModuleApiService } from "@core/services/api-factory";

// ─── Types ────────────────────────────────────────────────

/** Provider button info returned by GET /auth/oidc/providers/admin */
export interface SsoProvider {
      id: string;
      name: string;
      slug: string;
      protocol: string;
      iconUrl: string | null;
      buttonColor: string | null;
      buttonLabel: string | null;
      displayOrder: number;
}

/** Challenge result from POST /auth/oidc/challenge */
interface ChallengeResult {
      authorizationUrl: string;
      codeVerifier: string;
      state: string;
}

/** Callback result from POST /auth/oidc/callback */
export interface SsoCallbackResult {
      type: "admin" | "user";
      adminId?: string;
      userId?: string;
      providerName: string;
      email: string;
}

/** Error when no linked account exists */
export interface SsoNoLinkedAccountError {
      error: "no_linked_account";
      message: string;
      providerName: string;
      email: string;
      name: string;
      providerKey: string;
      identityProviderId: string;
}

// ─── Session Storage Keys ─────────────────────────────────

const SSO_KEYS = {
      CODE_VERIFIER: "sso_code_verifier",
      STATE: "sso_state",
      PROVIDER_ID: "sso_provider_id",
} as const;

// ─── Hook ─────────────────────────────────────────────────

export function useSsoProviders() {
      const [providers, setProviders] = useState<SsoProvider[]>([]);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      // Fetch providers on mount
      useEffect(() => {
            let cancelled = false;

            async function fetchProviders() {
                  try {
                        const api = getModuleApiService("IDENTITY");
                        const data = await api.get<SsoProvider[]>(
                              API_ENDPOINTS.AUTH.OIDC.ADMIN_PROVIDERS
                        );

                        if (!cancelled) {
                              setProviders(
                                    (data || []).sort(
                                          (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
                                    )
                              );
                        }
                  } catch {
                        // Silently fail — SSO buttons just won't show if providers unavailable
                        if (!cancelled) setProviders([]);
                  } finally {
                        if (!cancelled) setIsLoading(false);
                  }
            }

            fetchProviders();
            return () => {
                  cancelled = true;
            };
      }, []);

      // Initiate SSO login — creates challenge, stores PKCE, redirects
      const initiateSsoLogin = useCallback(async (providerId: string) => {
            setError(null);
            try {
                  const api = getModuleApiService("IDENTITY");
                  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/sso/callback` : undefined;

                  const challenge = await api.post<ChallengeResult>(
                        API_ENDPOINTS.AUTH.OIDC.CHALLENGE,
                        { providerId, redirectUri }
                  );

                  // Store PKCE state in sessionStorage for the callback page
                  sessionStorage.setItem(SSO_KEYS.CODE_VERIFIER, challenge.codeVerifier);
                  sessionStorage.setItem(SSO_KEYS.STATE, challenge.state);
                  sessionStorage.setItem(SSO_KEYS.PROVIDER_ID, providerId);

                  // Redirect to the external IdP's authorization endpoint
                  window.location.href = challenge.authorizationUrl;
            } catch (err) {
                  const message =
                        err instanceof Error ? err.message : "Failed to start SSO login";
                  setError(message);
            }
      }, []);

      return {
            providers,
            isLoading,
            error,
            hasProviders: providers.length > 0,
            initiateSsoLogin,
      };
}

// ─── Callback Helper (used by SsoCallbackView) ────────────

/**
 * Completes the SSO login by exchanging the authorization code.
 * Called from the /sso/callback page after redirect from the IdP.
 */
export async function completeSsoCallback(
      code: string,
      state: string
): Promise<SsoCallbackResult> {
      // Retrieve PKCE state from sessionStorage
      const codeVerifier = sessionStorage.getItem(SSO_KEYS.CODE_VERIFIER);
      const storedState = sessionStorage.getItem(SSO_KEYS.STATE);
      const providerId = sessionStorage.getItem(SSO_KEYS.PROVIDER_ID);

      // Clean up immediately
      sessionStorage.removeItem(SSO_KEYS.CODE_VERIFIER);
      sessionStorage.removeItem(SSO_KEYS.STATE);
      sessionStorage.removeItem(SSO_KEYS.PROVIDER_ID);

      if (!codeVerifier || !storedState || !providerId) {
            throw new Error("SSO session expired. Please try signing in again.");
      }

      // CSRF protection: validate state matches
      if (state !== storedState) {
            throw new Error("Invalid SSO state. This may be a security issue.");
      }

      const api = getModuleApiService("IDENTITY");
      const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/sso/callback` : undefined;

      const response = await api.post<SsoCallbackResult>(
            API_ENDPOINTS.AUTH.OIDC.CALLBACK,
            {
                  providerId,
                  code,
                  codeVerifier,
                  state,
                  redirectUri
            }
      );

      return response;
}
