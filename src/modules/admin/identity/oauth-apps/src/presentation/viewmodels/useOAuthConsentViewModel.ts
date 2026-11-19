"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useServices } from "@core/providers/service-provider";
import { secureTokenService } from "@core/common/secure-token-service";
import { sanitizeHttpUrl } from "@core/common/sanitize";
import { OIDC_KEYS } from "@core/config/oidc-keys";
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
  accessToken: string | null;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope");
  const displayName = searchParams.get("display_name");

  const appName = displayName || clientId || "Unknown App";
  const requestedScopes = scope ? scope.split(" ") : ["openid", "profile"];
  const userDisplayName = user?.displayName || user?.username || null;

  const redirectToLogin = useCallback(() => {
    const sanitizedParams = new URLSearchParams(searchParams.toString());
    sanitizedParams.delete(OIDC_KEYS.CONSENT_TICKET);
    const sanitizedQuery = sanitizedParams.toString();
    const redirectPath = encodeURIComponent(
      sanitizedQuery ? `/authorize?${sanitizedQuery}` : "/authorize"
    );
    secureTokenService.clearTokens();
    logout();
    queryClient.clear();
    router.replace(`/login?redirect=${redirectPath}`);
  }, [searchParams, logout, queryClient, router]);

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
        const formRequest = authRepository.buildOidcConsentForm(searchParams, token, decision);

        setFormAction(formRequest.action);
        setFormParams(formRequest.params);
        setAccessToken(token);

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
    accessToken,
    formRef,
    handleApprove,
    handleDeny,
    handleSwitchAccount,
  };
}
