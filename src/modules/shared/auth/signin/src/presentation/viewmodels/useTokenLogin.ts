"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import { secureTokenService } from "@core/common/secure-token-service";
import { authContainer } from "@modules/auth/di";

/**
 * useTokenLogin — Completes the login flow for auth methods that return
 * raw tokens (Phone OTP, Passkey, QR Login) instead of the full
 * `LoginResult` object that `useAuthLogin` handles.
 *
 * Flow:
 *   1. Store the access token via secureTokenService
 *   2. Fetch the user profile from /me
 *   3. Set auth state in Zustand (user, permissions, roles)
 *   4. Invalidate stale queries
 *   5. Redirect to dashboard
 *
 * Without this hook, Phone OTP / Passkey / QR Login would discard
 * the token and send the user back to the credentials screen.
 */
export function useTokenLogin() {
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  const completeTokenLogin = useCallback(
    async (result: { accessToken: string; refreshToken?: string; mustChangePassword?: boolean }) => {
      try {
        // 1. Persist the access token
        secureTokenService.setAccessToken(result.accessToken);

        // 2. Fetch user profile from /me — this returns permissions, roles, etc.
        const { authRepository } = authContainer;
        const user = await authRepository.getMe();

        // 3. Set the user in the Zustand auth store
        setAuth(user, user.permissions || [], [], true);

        // 4. Invalidate any stale queries so protected pages reload fresh
        queryClient.invalidateQueries();

        // 5. Respect a pending forced password change — mirrors the check
        // already done in the password-login and 2FA-login paths
        // (use-login-viewmodel.ts / use2FAHandler.ts). Without this, phone-OTP,
        // passkey, and QR login could bypass the mandatory password-change gate.
        const mustChange = result.mustChangePassword ?? false;
        useAppStore.getState().setMustChangePassword(mustChange);

        // 6. Redirect to dashboard (or the change-password gate)
        router.replace(mustChange ? "/change-password" : "/dashboard");
      } catch {
        // If profile fetch fails, token is invalid — redirect to login
        secureTokenService.clearTokens();
        router.replace("/login");
      }
    },
    [setAuth, queryClient, router]
  );

  return { completeTokenLogin };
}
