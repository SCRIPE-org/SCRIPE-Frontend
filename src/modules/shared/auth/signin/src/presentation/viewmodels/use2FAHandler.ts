"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { buildPostAuthEntryUrl } from "../utils/redirect-safety";

/**
 * Exported type defining parameters and fields for login step configurations.
 */
export type LoginStep = "credentials" | "two-factor" | "workspace-selection";

/**
 * Interface defining property specifications, keys types, and structural contract rules for use2FAHandler options.
 */
export interface Use2FAHandlerOptions {
  redirectPath: string;
  formIdentifier: string;
  formPassword: string;
  staySignedIn?: boolean;
  tenantId: string | undefined;
  setLoginStep: (step: LoginStep) => void;
  setError: (msg: string) => void;
  onRedirectTriggered: () => void;
}

/**
 * use2FAHandler — manages 2FA verification state and submission for both
 * password-based login and passwordless hybrid MFA (`twoFactorPendingToken`).
 *
 * Extracted from useLoginViewModel to keep that hook under 200 lines.
 * Handles: TOTP code state, backup code toggle, verify2FA call,
 * post-verification auth store update (with explicit roles), and safe redirect.
 */
export function use2FAHandler(opts: Use2FAHandlerOptions) {
  const {
    redirectPath,
    formIdentifier,
    formPassword,
    staySignedIn = false,
    tenantId,
    setLoginStep,
    setError,
    onRedirectTriggered,
  } = opts;

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [twoFactorPendingToken, setTwoFactorPendingToken] = useState<string | null>(null);
  const [pendingStaySignedIn, setPendingStaySignedIn] = useState(false);

  const router = useRouter();
  const { t } = useI18n();
  const { authRepository } = useServices();
  const setAuth = useAppStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  const handleVerify2FA = useCallback(async () => {
    const trimmedCode = twoFactorCode.trim();
    if (!trimmedCode) {
      setError(t("auth.twoFactor.enterCode"));
      return;
    }

    setError("");
    setIsVerifying2FA(true);

    try {
      const result = twoFactorPendingToken
        ? await authRepository.verify2FA(
            "",
            null,
            trimmedCode,
            undefined,
            twoFactorPendingToken,
            pendingStaySignedIn
          )
        : await authRepository.verify2FA(
            formIdentifier,
            formPassword,
            trimmedCode,
            tenantId,
            null,
            staySignedIn
          );
      const { user } = result;

      setAuth(user, user.permissions || [], user.roles || [], true);
      const store = useAppStore.getState();
      store.setSubscriptionInfo(result.subscriptionStatus, result.gracePhase, result.editionName);
      const mustChange = result.mustChangePassword ?? false;
      const requireMfa = result.requireMfaEnrollment ?? false;
      store.setMustChangePassword(mustChange);
      store.setRequireMfaEnrollment?.(requireMfa);
      store.setDefaultRedirectPath("/");

      if (!mustChange && !requireMfa) {
        // v2: NavigationProvider auto-fetches when isAuthenticated changes
        queryClient.invalidateQueries();
      }

      onRedirectTriggered();
      const targetPath = buildPostAuthEntryUrl({
        mustChangePassword: mustChange,
        requireMfaEnrollment: requireMfa,
        subscriptionStatus: result.subscriptionStatus,
        redirect: redirectPath,
      });
      setTimeout(() => {
        if (targetPath.startsWith("http://") || targetPath.startsWith("https://")) {
          window.location.href = targetPath;
        } else {
          router.replace(targetPath);
        }
      }, 100);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("auth.twoFactor.invalidCode");
      setError(errorMessage);
    } finally {
      setIsVerifying2FA(false);
    }
  }, [
    twoFactorCode,
    twoFactorPendingToken,
    pendingStaySignedIn,
    formIdentifier,
    formPassword,
    staySignedIn,
    tenantId,
    authRepository,
    setAuth,
    queryClient,
    router,
    t,
    setError,
    redirectPath,
    onRedirectTriggered,
  ]);

  const toggleBackupCode = useCallback(() => {
    setUseBackupCode((prev) => !prev);
    setTwoFactorCode("");
    setError("");
  }, [setError]);

  const reset2FA = useCallback(() => {
    setTwoFactorCode("");
    setUseBackupCode(false);
    setTwoFactorPendingToken(null);
    setPendingStaySignedIn(false);
  }, []);

  /**
   * Transitions to the 2FA verification step.
   * Accepts an optional `pendingToken` for passwordless hybrid MFA flows (Phone OTP, SSO, etc.).
   */
  const enterTwoFactor = useCallback(
    (pendingToken?: string | null, persistSession?: boolean) => {
      setTwoFactorPendingToken(pendingToken ?? null);
      setPendingStaySignedIn(Boolean(persistSession ?? staySignedIn));
      setLoginStep("two-factor");
      setTwoFactorCode("");
      setError("");
    },
    [setLoginStep, setError, staySignedIn]
  );

  return {
    twoFactorCode,
    setTwoFactorCode,
    useBackupCode,
    isVerifying2FA,
    twoFactorPendingToken,
    handleVerify2FA,
    toggleBackupCode,
    reset2FA,
    enterTwoFactor,
  };
}
