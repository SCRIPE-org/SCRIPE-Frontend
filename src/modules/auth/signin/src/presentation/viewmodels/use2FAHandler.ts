"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { useNavigation as _useNavigation } from "@core/providers/navigation-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "@/core/common/logger";
import { TwoFactorRequiredError } from "@modules/auth/core/domain/errors/AuthErrors";

export type LoginStep = "credentials" | "two-factor" | "workspace-selection";

export interface Use2FAHandlerOptions {
  redirectPath: string;
  formIdentifier: string;
  formPassword: string;
  tenantId: string | undefined;
  setLoginStep: (step: LoginStep) => void;
  setError: (msg: string) => void;
  hasTriggeredRedirect: React.MutableRefObject<boolean>;
}

/**
 * use2FAHandler — manages 2FA verification state and submission.
 *
 * Extracted from useLoginViewModel to keep that hook under 200 lines.
 * Handles: TOTP code state, backup code toggle, verify2FA call,
 * post-verification auth store update, and redirect.
 */
export function use2FAHandler(opts: Use2FAHandlerOptions) {
  const {
    redirectPath,
    formIdentifier,
    formPassword,
    tenantId,
    setLoginStep,
    setError,
    hasTriggeredRedirect,
  } = opts;

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const router = useRouter();
  const { t } = useI18n();
  const { authRepository } = useServices();
  const setAuth = useAppStore((state) => state.setAuth);
  const { operationSuccess, operationError: _operationError } = useEnhancedToast();
  const queryClient = useQueryClient();

  const handleVerify2FA = useCallback(async () => {
    if (!twoFactorCode.trim()) {
      setError(t("auth.twoFactor.enterCode"));
      return;
    }

    setError("");
    setIsVerifying2FA(true);

    try {
      const result = await authRepository.verify2FA(
        formIdentifier,
        formPassword,
        twoFactorCode,
        tenantId
      );
      const { user } = result;

      setAuth(user, user.permissions || [], []);
      useAppStore
        .getState()
        .setSubscriptionInfo(result.subscriptionStatus, result.gracePhase, result.editionName);
      useAppStore.getState().setMustChangePassword(result.mustChangePassword ?? false);

      operationSuccess(t("auth.welcomeBack"));

      const mustChange = result.mustChangePassword ?? false;
      if (!mustChange) {
        // v2: NavigationProvider auto-fetches when isAuthenticated changes
        queryClient.invalidateQueries();
      }

      hasTriggeredRedirect.current = true;
      const targetPath = mustChange ? "/change-password" : redirectPath;
      setTimeout(() => { router.replace(targetPath); }, 100);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("auth.twoFactor.invalidCode");
      setError(errorMessage);
    } finally {
      setIsVerifying2FA(false);
    }
  }, [
    twoFactorCode, formIdentifier, formPassword, tenantId,
    authRepository, setAuth, operationSuccess,
    queryClient, router, t, setError, redirectPath, hasTriggeredRedirect,
  ]);

  const toggleBackupCode = useCallback(() => {
    setUseBackupCode((prev) => !prev);
    setTwoFactorCode("");
    setError("");
  }, [setError]);

  const reset2FA = useCallback(() => {
    setTwoFactorCode("");
    setUseBackupCode(false);
  }, []);

  /** Called from workspace selector when 2FA is needed post-workspace-pick */
  const enterTwoFactor = useCallback(() => {
    setLoginStep("two-factor");
    setTwoFactorCode("");
    setError("");
  }, [setLoginStep, setError]);

  return {
    twoFactorCode, setTwoFactorCode,
    useBackupCode, isVerifying2FA,
    handleVerify2FA, toggleBackupCode,
    reset2FA, enterTwoFactor,
  };
}
