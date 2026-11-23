"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useServices } from "@core/providers/service-provider";
import { secureTokenService } from "@core/common/secure-token-service";
import { sanitizeHttpUrl } from "@core/common/sanitize";
import { isSafeRedirectTarget } from "@core/common/redirect-safety";
import { ALLOWED_OIDC_PARAMS, OIDC_KEYS } from "@core/config/oidc-keys";
import { appLogger } from "@core/common/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * ViewModel contract for the OIDC Authorization Consent screen.
 */
export interface OAuthConsentViewModelResult {
  // State
  isApproving: boolean;
  isDenying: boolean;
  isRestoringSession: boolean;
  hasHydrated: boolean;

  // OIDC Properties
  clientId: string | null;
  redirectUri: string | null;
  scope: string | null;
  appName: string;
  requestedScopes: string[];

  // User Info
  userDisplayName: string | null;

  // Form Submission Data
  formAction: string | null;
  formParams: Record<string, string>;
  formRef: React.RefObject<HTMLFormElement | null>;

  // Actions
  handleApprove: () => void;
  handleDeny: () => void;
  handleSwitchAccount: () => void;
}

/**
 * React hook/ViewModel orchestrating OIDC consent restoration, approval, and
 * server-validated denial (SEC-03).
 *
 * Security invariant (SEC-03):
 * Both Approve and Deny submit a POST form to the backend `/connect/authorize`
 * endpoint (`decision=approve` or `decision=deny`) so OpenIddict validates
 * `client_id` and the registered `redirect_uri` server-side before redirecting.
 * Client code NEVER reads `redirect_uri` into `window.location.href`, blocking
 * open redirects and `javascript:` DOM-XSS completely.
 */
export function useOAuthConsentViewModel(): OAuthConsentViewModelResult {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const { operationError } = useEnhancedToast();
  const { authRepository } = useServices();

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const setAuth = useAppStore((state) => state.setAuth);
  const logout = useAppStore((state) => state.logout);
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  const [isApproving, setIsApproving] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const hasAttemptedRefresh = useRef(false);

  // Declarative Form State
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formAction, setFormAction] = useState<string | null>(null);
  const [formParams, setFormParams] = useState<Record<string, string>>({});

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope");
  const displayName = searchParams.get("display_name");

  const appName = displayName || clientId || "Unknown App";
  const requestedScopes = scope ? scope.split(" ") : ["openid", "profile"];
  const userDisplayName = user?.displayName || user?.username || null;

  const redirectToLogin = useCallback(() => {
    let connectAuthorizeUrl: string;
    if (typeof authRepository.buildOidcAuthorizeUrl === "function") {
      connectAuthorizeUrl = authRepository.buildOidcAuthorizeUrl(searchParams);
    } else {
      const backendUrl =
        process.env.NEXT_PUBLIC_IDENTITY_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5035/api";
      let baseHost = backendUrl.replace(/\/(?:api|identity)\/?$/, "");
      try {
        baseHost = new URL(backendUrl).origin;
      } catch {
        // Keep fallback base host
      }
      const allowedSet = new Set<string>(ALLOWED_OIDC_PARAMS);
      const authorizeParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key === OIDC_KEYS.CONSENT_TICKET) return;
        if (allowedSet.has(key)) authorizeParams.set(key, value);
      });
      const qs = authorizeParams.toString();
      connectAuthorizeUrl = qs
        ? `${baseHost}/connect/authorize?${qs}`
        : `${baseHost}/connect/authorize`;
    }

    secureTokenService.clearTokens();
    logout();
    queryClient.clear();

    if (isSafeRedirectTarget(connectAuthorizeUrl)) {
      router.replace(`/login?redirect=${encodeURIComponent(connectAuthorizeUrl)}`);
      return;
    }
    router.replace("/login");
  }, [authRepository, searchParams, logout, queryClient, router]);

  // 1. Define TanStack Query Mutations for Clean Server State
  const { mutate: restoreSession } = useMutation({
    mutationFn: async () => {
      const result = await authRepository.refreshToken();
      if (result.kind === "err") throw result.error;

      const me = await authRepository.getCurrentPrincipal();
      if (!me) throw new Error("Could not fetch user profile");

      return me;
    },
    onSuccess: (me) => {
      setAuth(me, me.permissions || [], me.roles || []);
      setIsRestoringSession(false);
    },
    onError: () => {
      redirectToLogin();
    },
  });

  // 2. Trigger Restoration on Mount
  useEffect(() => {
    if (!hasHydrated) return;
    if (hasAttemptedRefresh.current) return;
    hasAttemptedRefresh.current = true;

    if (secureTokenService.hasToken()) {
      queueMicrotask(() => {
        setIsRestoringSession(false);
      });
      return;
    }

    if (isAuthenticated) {
      restoreSession();
    } else {
      redirectToLogin();
    }
  }, [hasHydrated, isAuthenticated, restoreSession, redirectToLogin]);

  const submitConsentDecision = useCallback(
    (decision: "approve" | "deny") => {
      const setBusy = decision === "approve" ? setIsApproving : setIsDenying;
      setBusy(true);

      try {
        const token = secureTokenService.getAccessToken();
        if (!token) {
          if (decision === "deny") {
            redirectToLogin();
            return;
          }
          throw new Error(t("oauth.sessionExpired"));
        }

        // Delegate to repository so backend OpenIddict validates client_id + redirect_uri
        const formRequest = authRepository.buildOidcConsentForm(searchParams, decision);

        setFormAction(formRequest.action);
        setFormParams(formRequest.params);

        setTimeout(() => {
          if (formRef.current) {
            formRef.current.submit();
          }
        }, 0);
      } catch (err) {
        setBusy(false);
        appLogger.error(`OAuth consent ${decision} failed:`, err);
        operationError(
          decision === "approve" ? "Approve" : "Deny",
          undefined,
          err instanceof Error ? err.message : t("auth.sso.callbackErrorGeneric")
        );
      }
    },
    [authRepository, operationError, redirectToLogin, searchParams, t]
  );

  const handleApprove = useCallback(() => {
    submitConsentDecision("approve");
  }, [submitConsentDecision]);

  const handleDeny = useCallback(() => {
    submitConsentDecision("deny");
  }, [submitConsentDecision]);

  const handleSwitchAccount = useCallback(() => {
    const switchFlow = async () => {
      try {
        if (typeof authRepository.logout === "function") {
          await authRepository.logout();
        }
      } catch {
        // Best-effort token revocation; proceed to clear local state & OidcSession cookie
      } finally {
        secureTokenService.clearTokens();
        logout();
        queryClient.clear();

        const rawLogoutUrl =
          typeof authRepository.buildOidcLogoutUrl === "function"
            ? authRepository.buildOidcLogoutUrl(searchParams)
            : null;
        const safeLogoutUrl = sanitizeHttpUrl(rawLogoutUrl);

        if (safeLogoutUrl && typeof window !== "undefined") {
          window.location.href = safeLogoutUrl;
        } else {
          redirectToLogin();
        }
      }
    };

    void switchFlow();
  }, [authRepository, logout, queryClient, searchParams, redirectToLogin]);

  return {
    isApproving,
    isDenying,
    isRestoringSession,
    hasHydrated,
    clientId,
    redirectUri,
    scope,
    appName,
    requestedScopes,
    userDisplayName,
    formAction,
    formParams,
    formRef,
    handleApprove,
    handleDeny,
    handleSwitchAccount,
  };
}
