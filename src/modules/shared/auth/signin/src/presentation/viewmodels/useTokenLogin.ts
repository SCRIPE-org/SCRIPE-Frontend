"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import { secureTokenService } from "@core/common/secure-token-service";
import { useServices } from "@core/providers/service-provider";
import { buildPostAuthEntryUrl } from "../utils/redirect-safety";

/**
 * Payload returned by token-producing passwordless sign-in methods
 * (Phone OTP, Passkey, QR Login).
 */
export interface TokenLoginPayload {
  accessToken: string;
  refreshToken?: string;
  requires2FA?: boolean;
  twoFactorPendingToken?: string | null;
  staySignedIn?: boolean;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  defaultRedirectPath?: string | null;
}

/** Optional callbacks for {@link useTokenLogin}. */
export interface UseTokenLoginOptions {
  onTwoFactorRequired?: (pendingToken: string, staySignedIn: boolean) => void;
}

/**
 * useTokenLogin — Completes the login flow for auth methods that return
 * raw tokens (Phone OTP, Passkey, QR Login) instead of the full
 * `LoginResult` object that `useAuthLogin` handles.
 *
 * Hydrates principal profile, permissions, explicit roles, subscription info,
 * enforces Tier 0 gates (`mustChangePassword`, `requireMfaEnrollment`, `PendingPayment`), and routes
 * cleanly through `"/"` (`/?redirect=...` or `"/"`) for single-pass bootstrap.
 */
export function useTokenLogin(options?: UseTokenLoginOptions) {
  const router = useRouter();
  const { authRepository } = useServices();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const setMustChangePassword = useAppStore((state) => state.setMustChangePassword);
  const setRequireMfaEnrollment = useAppStore((state) => state.setRequireMfaEnrollment);
  const setDefaultRedirectPath = useAppStore((state) => state.setDefaultRedirectPath);
  const queryClient = useQueryClient();
  const onTwoFactorRequired = options?.onTwoFactorRequired;

  const completeTokenLogin = useCallback(
    async (result: TokenLoginPayload) => {
      if (result.requires2FA && result.twoFactorPendingToken) {
        onTwoFactorRequired?.(
          result.twoFactorPendingToken,
          Boolean(result.staySignedIn)
        );
        return;
      }
      if (!result.accessToken) {
        secureTokenService.clearTokens();
        router.replace("/login");
        return;
      }
      try {
        // 1. Persist the access token
        secureTokenService.setAccessToken(result.accessToken);

        // 2. Fetch user profile from /auth/admin/principal — returns permissions and roles
        const user = await authRepository.getCurrentPrincipal();

        // 3. Hydrate full auth store including explicit roles, subscription, and password/MFA gates
        setAuth(user, user.permissions || [], user.roles || [], true);
        setSubscriptionInfo(
          result.subscriptionStatus ?? null,
          result.gracePhase ?? null,
          result.editionName ?? null
        );

        const mustChange = result.mustChangePassword ?? false;
        const requireMfa = result.requireMfaEnrollment ?? false;
        setMustChangePassword(mustChange);
        setRequireMfaEnrollment?.(requireMfa);
        setDefaultRedirectPath("/");

        // 4. Invalidate stale queries so protected pages load fresh data
        if (!mustChange && !requireMfa && result.subscriptionStatus !== "PendingPayment") {
          queryClient.invalidateQueries();
        }

        // 5. Enforce Tier 0 gates or hand off to "/" bootstrap resolver (preserving ?redirect=)
        const queryRedirect =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect")
            : null;
        const targetPath = buildPostAuthEntryUrl({
          mustChangePassword: mustChange,
          requireMfaEnrollment: requireMfa,
          subscriptionStatus: result.subscriptionStatus,
          redirect: queryRedirect,
        });
        if (targetPath.startsWith("http://") || targetPath.startsWith("https://")) {
          window.location.href = targetPath;
        } else {
          router.replace(targetPath);
        }
      } catch {
        secureTokenService.clearTokens();
        router.replace("/login");
      }
    },
    [
      authRepository,
      setAuth,
      setSubscriptionInfo,
      setMustChangePassword,
      setRequireMfaEnrollment,
      setDefaultRedirectPath,
      queryClient,
      router,
      onTwoFactorRequired,
    ]
  );

  return { completeTokenLogin };
}
