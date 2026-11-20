"use client";

/**
 * useForceChangePasswordViewModel
 *
 * ViewModel orchestrating first-login / mandatory password change (mcp=true)
 * with MMC parity: single-session rotation without forcing logout.
 */
import { useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { container } from "@modules/profile/di";

/** Evaluation breakdown of mandatory password complexity rules. */
export interface PasswordRulesEvaluation {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  allMet: boolean;
}

/** Evaluates a candidate password against complexity requirements. */
export function evaluatePasswordRules(password: string): PasswordRulesEvaluation {
  const minLength = password.length >= 8;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);
  return {
    minLength,
    uppercase,
    lowercase,
    number,
    special,
    allMet: minLength && uppercase && lowercase && number && special,
  };
}

/** ViewModel orchestrating mandatory first-login password rotation without session loss. */
export function useForceChangePasswordViewModel() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { authRepository } = useServices();
  const { operationSuccess, operationError } = useEnhancedToast();

  const user = useAppStore((state) => state.user);
  const defaultRedirectPath = useAppStore((state) => state.defaultRedirectPath);
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const setMustChangePassword = useAppStore((state) => state.setMustChangePassword);
  const setDefaultRedirectPath = useAppStore((state) => state.setDefaultRedirectPath);
  const logout = useAppStore((state) => state.logout);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const rules = evaluatePasswordRules(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = !isSubmitting && rules.allMet && passwordsMatch;

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      setSubmitError(null);

      const currentRules = evaluatePasswordRules(newPassword);
      if (!currentRules.allMet) {
        setSubmitError(t("profile.security.requirementsTitle"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setSubmitError(t("profile.security.passwordMismatch"));
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await container.profileRepository.forceChangePassword({
          newPassword,
          confirmPassword,
        });

        // Refresh active session tokens/cookies cleanly without forcing logout
        let resolvedUser = user;
        let resolvedRedirect = result?.defaultRedirectPath || defaultRedirectPath || "/";

        try {
          const refreshRes = await authRepository.refreshToken();
          if (refreshRes.kind === "ok") {
            if (refreshRes.value.defaultRedirectPath) {
              resolvedRedirect = refreshRes.value.defaultRedirectPath;
            }
            setSubscriptionInfo(
              refreshRes.value.subscriptionStatus ?? null,
              refreshRes.value.gracePhase ?? null,
              refreshRes.value.editionName ?? null
            );
          } else if (
            result?.subscriptionStatus !== undefined ||
            result?.gracePhase !== undefined ||
            result?.editionName !== undefined
          ) {
            setSubscriptionInfo(
              result.subscriptionStatus ?? null,
              result.gracePhase ?? null,
              result.editionName ?? null
            );
          }

          const principal = await authRepository.getCurrentPrincipal();
          if (principal) {
            resolvedUser = principal;
          }
        } catch {
          // If secondary refresh call encounters transient blip after token already rotated,
          // retain the freshly issued force-change access token and proceed gracefully.
        }

        if (resolvedUser) {
          setAuth(
            resolvedUser,
            resolvedUser.permissions ?? [],
            resolvedUser.roles ?? [],
            false
          );
        }
        setDefaultRedirectPath(resolvedRedirect);
        setMustChangePassword(false);

        await queryClient.invalidateQueries();
        operationSuccess(t("profile.security.passwordChanged"));
        router.replace(resolvedRedirect || "/");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("profile.common.error");
        setSubmitError(msg);
        operationError(t("profile.security.updatePassword"), undefined, msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      newPassword,
      confirmPassword,
      user,
      defaultRedirectPath,
      authRepository,
      setAuth,
      setSubscriptionInfo,
      setMustChangePassword,
      setDefaultRedirectPath,
      queryClient,
      operationSuccess,
      operationError,
      router,
      t,
    ]
  );

  const handleLogout = useCallback(async () => {
    await authRepository.logout().catch(() => undefined);
    logout();
    queryClient.clear();
    router.replace("/login");
  }, [authRepository, logout, queryClient, router]);

  return {
    t,
    direction,
    username: user?.username ?? "",
    email: user?.email ?? "",
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    isSubmitting,
    submitError,
    rules,
    passwordsMatch,
    showMismatch,
    canSubmit,
    handleSubmit,
    handleLogout,
  };
}
