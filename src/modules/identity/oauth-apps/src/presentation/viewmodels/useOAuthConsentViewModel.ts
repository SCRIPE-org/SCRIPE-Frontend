"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useServices } from "@core/providers/service-provider";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "@core/common/logger";
import { useMutation } from "@tanstack/react-query";

interface OAuthConsentViewModelResult {
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

export function useOAuthConsentViewModel(): OAuthConsentViewModelResult {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const { operationError } = useEnhancedToast();
  const { authRepository } = useServices();

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const setAuth = useAppStore((state) => state.setAuth);
  const logout = useAppStore((state) => state.logout);
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
  const state = searchParams.get("state");
  const displayName = searchParams.get("display_name");

  const appName = displayName || clientId || "Unknown App";
  const requestedScopes = scope ? scope.split(" ") : ["openid", "profile"];
  const userDisplayName = user?.displayName || user?.username || null;

  // 1. Define TanStack Query Mutations for Clean Server State
  const restoreSessionMutation = useMutation({
    mutationFn: async () => {
      const result = await authRepository.refreshToken();
      if (result.kind === "err") throw result.error;

      const me = await authRepository.getMe();
      if (!me) throw new Error("Could not fetch user profile");

      return me;
    },
    onSuccess: (me) => {
      setAuth(me, me.permissions || [], []);
      setIsRestoringSession(false);
    },
    onError: () => {
      // Session expired or missing → redirect to login
      const currentParams = searchParams.toString();
      const redirectPath = encodeURIComponent(`/authorize?${currentParams}`);
      secureTokenService.clearTokens();
      logout();
      router.replace(`/login?redirect=${redirectPath}`);
    },
  });

  // 2. Trigger Restoration on Mount
  useEffect(() => {
    if (!hasHydrated) return;
    if (hasAttemptedRefresh.current) return;
    hasAttemptedRefresh.current = true;

    if (secureTokenService.hasToken()) {
      setIsRestoringSession(false);
      return;
    }

    if (isAuthenticated) {
      // Trigger TanStack Query Mutation
      restoreSessionMutation.mutate();
    } else {
      // Not authenticated at all
      const currentParams = searchParams.toString();
      const redirectPath = encodeURIComponent(`/authorize?${currentParams}`);
      secureTokenService.clearTokens();
      logout();
      router.replace(`/login?redirect=${redirectPath}`);
    }
  }, [hasHydrated, isAuthenticated]);

  const handleApprove = () => {
    setIsApproving(true);
    try {
      const token = secureTokenService.getAccessToken();
      if (!token) {
        throw new Error(t("oauth.sessionExpired"));
      }

      // 3. True Clean Architecture: Delegate purely to Domain/Data layer for infrastructure specifics
      const formRequest = authRepository.buildOidcConsentForm(searchParams, token);

      // Update pure React state
      setFormAction(formRequest.action);
      setFormParams(formRequest.params);
      setAccessToken(token);

      // Allow React to render the actual DOM <form> with the state above, then submit it
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.submit();
        }
      }, 0);
    } catch (err) {
      setIsApproving(false);
      appLogger.error("Approval failed:", err);
      operationError(err instanceof Error ? err.message : t("auth.sso.callbackErrorGeneric"));
    }
  };

  const handleDeny = () => {
    setIsDenying(true);
    if (redirectUri) {
      const url = new URL(redirectUri);
      url.searchParams.append("error", "access_denied");
      url.searchParams.append("error_description", "The user denied access to your application.");
      if (state) {
        url.searchParams.append("state", state);
      }
      window.location.href = url.toString();
    } else {
      router.push("/");
    }
  };

  const handleSwitchAccount = () => {
    const currentParams = searchParams.toString();
    const redirectPath = encodeURIComponent(`/authorize?${currentParams}`);
    secureTokenService.clearTokens();
    logout();
    router.replace(`/login?redirect=${redirectPath}`);
  };

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
