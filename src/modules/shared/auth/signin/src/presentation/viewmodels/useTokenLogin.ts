"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import { secureTokenService } from "@core/common/secure-token-service";
import { authContainer } from "@modules/auth/di";
import { getSafeRedirectPath } from "../utils/redirect-safety";

/**
 * Payload returned by token-producing passwordless sign-in methods
 * (Phone OTP, Passkey, QR Login).
 */
export interface TokenLoginPayload {
  accessToken: string;
  refreshToken?: string;
  mustChangePassword?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  defaultRedirectPath?: string | null;
}

/**
 * useTokenLogin — Completes the login flow for auth methods that return
 * raw tokens (Phone OTP, Passkey, QR Login) instead of the full
 * `LoginResult` object that `useAuthLogin` handles.
 *
 * Hydrates principal profile, permissions, explicit roles, subscription info,
 * must-change-password gate, and redirects safely to `defaultRedirectPath`
 * (defaulting to `/overview`, never hardcoded `/dashboard`).
 */
export function useTokenLogin() {
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const setMustChangePassword = useAppStore((state) => state.setMustChangePassword);
  const setDefaultRedirectPath = useAppStore((state) => state.setDefaultRedirectPath);
  const queryClient = useQueryClient();

  const completeTokenLogin = useCallback(
    async (result: TokenLoginPayload) => {
      try {
        // 1. Persist the access token
        secureTokenService.setAccessToken(result.accessToken);

        // 2. Fetch user profile from /auth/admin/principal — returns permissions and roles
        const { authRepository } = authContainer;
        const user = await authRepository.getCurrentPrincipal();

        // 3. Hydrate full auth store including explicit roles, subscription, and password gate
        setAuth(user, user.permissions || [], user.roles || [], true);
        setSubscriptionInfo(
          result.subscriptionStatus ?? null,
          result.gracePhase ?? null,
          result.editionName ?? null
        );

        const mustChange = result.mustChangePassword ?? false;
        setMustChangePassword(mustChange);

        const rawPath = result.defaultRedirectPath;
        const normalizedPath =
          rawPath && rawPath !== "/" ? getSafeRedirectPath(rawPath, "/overview") : "/overview";
        setDefaultRedirectPath(normalizedPath);

        // 4. Invalidate stale queries so protected pages load fresh data
        if (!mustChange) {
          queryClient.invalidateQueries();
        }

        // 5. Redirect to backend-authoritative target (default /overview) or change-password gate
        router.replace(mustChange ? "/change-password" : normalizedPath);
      } catch {
        secureTokenService.clearTokens();
        router.replace("/login");
      }
    },
    [setAuth, setSubscriptionInfo, setMustChangePassword, setDefaultRedirectPath, queryClient, router]
  );

  return { completeTokenLogin };
}
