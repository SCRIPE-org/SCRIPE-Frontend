import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { getAuthServiceBaseUrl, isPlatformDomain } from "@core/common/origin-routing";
import { isSafeRedirectTarget, getSafeRedirectPath } from "@core/common/redirect-safety";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

/** Logout scope distinguishing local app revocation from central SSO sign-out. */
export type LogoutScope = "app" | "central";

/** Options accepted by `useAuthLogout` logout actions. */
export interface AuthLogoutOptions {
  /** `"app"` (default) revokes current app session while keeping `scr.oidc.session`; `"central"` revokes everywhere. */
  logoutScope?: LogoutScope;
}

/**
 * Tenant- and federation-aware logout hook.
 * Reads stored `tenantCode` BEFORE clearing auth state, sends `logoutScope` to
 * backend revocation, and routes back to `/login` without re-triggering IdP auto-login loops.
 */
export function useAuthLogout() {
  const { authRepository } = useServices();
  const logoutStore = useAppStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { operationError } = useEnhancedToast();
  const router = useRouter();

  const tenantCodeRef = useRef<string | null>(null);
  const explicitRedirectRef = useRef<string | null>(null);
  const logoutScopeRef = useRef<LogoutScope>("app");

  const getLogoutRedirectUrl = useCallback((): string => {
    const scope = logoutScopeRef.current;

    if (scope === "central" && typeof window !== "undefined") {
      const authBase = getAuthServiceBaseUrl();
      if (authBase && authBase !== window.location.origin) {
        return `${authBase}/login?logged_out=1`;
      }
      return "/login?logged_out=1";
    }

    if (explicitRedirectRef.current && isSafeRedirectTarget(explicitRedirectRef.current)) {
      return getSafeRedirectPath(explicitRedirectRef.current, "/login?logged_out=1");
    }

    if (typeof window !== "undefined" && !isPlatformDomain(window.location.hostname)) {
      return "/login?logged_out=1";
    }

    const code = tenantCodeRef.current;
    if (code) {
      return `/login?_tenant=${encodeURIComponent(code)}&logged_out=1`;
    }
    return "/login?logged_out=1";
  }, []);

  const navigateAfterLogout = useCallback(
    (redirectUrl: string) => {
      if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://")) {
        window.location.href = redirectUrl;
      } else {
        router.push(redirectUrl);
      }
    },
    [router]
  );

  const mutation = useMutation({
    mutationFn: async (options?: AuthLogoutOptions) => {
      const scope: LogoutScope = options?.logoutScope === "central" ? "central" : "app";
      logoutScopeRef.current = scope;
      // Capture tenant code BEFORE clearing store
      tenantCodeRef.current = useAppStore.getState().tenantCode;
      useSudoStore.getState().reset();
      usePatOneTimeSecretStore.getState().clearPendingReceipt();
      return authRepository.logout(scope);
    },
    onSuccess: () => {
      const redirectUrl = getLogoutRedirectUrl();
      explicitRedirectRef.current = null;
      logoutScopeRef.current = "app";
      logoutStore();
      queryClient.clear();
      navigateAfterLogout(redirectUrl);
    },
    onError: (error: Error) => {
      const redirectUrl = getLogoutRedirectUrl();
      explicitRedirectRef.current = null;
      logoutScopeRef.current = "app";
      // Even if API fails, always clear local state
      logoutStore();
      queryClient.clear();
      navigateAfterLogout(redirectUrl);
      operationError("Logout", undefined, error.message);
    },
  });

  const logout = useCallback(
    async (options?: AuthLogoutOptions): Promise<void> => {
      explicitRedirectRef.current = null;
      try {
        await mutation.mutateAsync(options);
      } catch {
        // Error notification, local cleanup, and redirect handled in onError
      }
    },
    [mutation]
  );

  const handleLogout = useCallback(
    async (redirectTo?: string, options?: AuthLogoutOptions): Promise<void> => {
      explicitRedirectRef.current = redirectTo ?? null;
      try {
        await mutation.mutateAsync(options);
      } catch {
        // Error notification, local cleanup, and redirect handled in onError
      }
    },
    [mutation]
  );

  return {
    logout,
    handleLogout,
    isLoading: mutation.isPending,
  };
}
