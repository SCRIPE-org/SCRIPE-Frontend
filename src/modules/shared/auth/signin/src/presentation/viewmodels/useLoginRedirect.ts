/**
 * Encapsulates open-redirect-safe navigation, hydrated session auto-redirect,
 * and single-flight redirect locking for `useLoginViewModel`.
 *
 * @module auth/signin/presentation/viewmodels
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { secureTokenService } from "@core/common/secure-token-service";
import { getSafeRedirectPath } from "../utils/redirect-safety";
import { resolvePostLoginRedirectTarget } from "../utils/login-error.utils";

/**
 * Manages safe internal/external redirects and auth session hydration checks for login.
 */
export function useLoginRedirect() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasTriggeredRedirect = useRef(false);

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const backendRedirectPath = useAppStore((state) => state.defaultRedirectPath);
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawRedirect = searchParams.get("redirect") || backendRedirectPath;
  const redirectPath = !rawRedirect || rawRedirect === "/" ? "/overview" : rawRedirect;

  const handleRedirect = useCallback(
    (path: string) => {
      const safePath = getSafeRedirectPath(path);
      if (safePath.startsWith("http://") || safePath.startsWith("https://")) {
        window.location.href = safePath;
      } else {
        router.replace(safePath);
      }
    },
    [router]
  );

  const isRedirectTriggered = useCallback(() => hasTriggeredRedirect.current, []);
  const onRedirectTriggered = useCallback(() => {
    hasTriggeredRedirect.current = true;
  }, []);
  const resetRedirectTrigger = useCallback(() => {
    hasTriggeredRedirect.current = false;
  }, []);

  const checkAndRedirect = useCallback(() => {
    if (!hasHydrated) return false;
    if (isRedirecting || hasTriggeredRedirect.current) return false;
    const hasToken = !!secureTokenService.getAccessToken();
    if (isAuthenticated && hasToken) {
      hasTriggeredRedirect.current = true;
      setIsRedirecting(true);
      const mustChange = useAppStore.getState().mustChangePassword;
      handleRedirect(mustChange ? "/change-password" : redirectPath);
      return true;
    }
    return false;
  }, [hasHydrated, isAuthenticated, isRedirecting, redirectPath, handleRedirect]);

  const schedulePostLoginRedirect = useCallback(() => {
    setIsRedirecting(true);
    if (hasTriggeredRedirect.current) return;
    hasTriggeredRedirect.current = true;
    const state = useAppStore.getState();
    const target = resolvePostLoginRedirectTarget(
      searchParams.get("redirect"),
      state.defaultRedirectPath
    );
    requestAnimationFrame(() => {
      handleRedirect(state.mustChangePassword ? "/change-password" : target);
    });
  }, [handleRedirect, searchParams]);

  return {
    isRedirecting,
    setIsRedirecting,
    isAuthenticated,
    hasHydrated,
    redirectPath,
    handleRedirect,
    isRedirectTriggered,
    onRedirectTriggered,
    resetRedirectTrigger,
    checkAndRedirect,
    schedulePostLoginRedirect,
  };
}
