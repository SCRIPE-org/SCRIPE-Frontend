"use client";

/**
 * useForceChangePasswordViewModel
 *
 * ViewModel orchestrating first-login / mandatory password change (mcp=true)
 * with dynamic backend PasswordPolicyModel validation and single-session token rotation.
 */
import { useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { buildPostAuthEntryUrl } from "@core/common/redirect-safety";
import {
  evaluatePasswordPolicy,
  findFirstPolicyViolation,
} from "@core/common/password-policy";
import { container } from "@modules/profile/di";

/** ViewModel orchestrating mandatory first-login password rotation without session loss. */
export function useForceChangePasswordViewModel() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { authRepository } = useServices();
  const { operationSuccess, operationError } = useEnhancedToast();

  const user = useAppStore((state) => state.user);
  const currentSubscriptionStatus = useAppStore((state) => state.subscriptionStatus);
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const setMustChangePassword = useAppStore((state) => state.setMustChangePassword);
  const setRequireMfaEnrollment = useAppStore((state) => state.setRequireMfaEnrollment);
  const setDefaultRedirectPath = useAppStore((state) => state.setDefaultRedirectPath);
  const logout = useAppStore((state) => state.logout);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: policy = null,
    isLoading: isPolicyLoading,
    error: policyErrorObj,
    refetch: refetchPolicy,
  } = useQuery({
    queryKey: ["auth", "force-change", "password-policy"],
    queryFn: () => authRepository.getPasswordPolicy(),
    staleTime: 5 * 60 * 1000,
  });

  const policyError = policyErrorObj instanceof Error ? policyErrorObj.message : null;
  const evaluation = evaluatePasswordPolicy(newPassword, policy);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    !isSubmitting &&
    !isPolicyLoading &&
    policy !== null &&
    evaluation.allMet &&
    passwordsMatch;

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      setSubmitError(null);

      if (!policy) {
        setSubmitError(policyError || t("common.passwordPolicy.loadFailed"));
        return;
      }

      const violation = findFirstPolicyViolation(newPassword, policy);
      if (violation) {
        setSubmitError(t(violation.key, violation.params));
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
        let resolvedSubStatus: string | null =
          result?.subscriptionStatus ?? currentSubscriptionStatus ?? null;
        let resolvedRequireMfaEnrollment: boolean = Boolean(result?.requireMfaEnrollment);

        try {
          const refreshRes = await authRepository.refreshToken();
          if (refreshRes.kind === "ok") {
            resolvedSubStatus = refreshRes.value.subscriptionStatus ?? resolvedSubStatus;
            resolvedRequireMfaEnrollment =
              refreshRes.value.requireMfaEnrollment ?? resolvedRequireMfaEnrollment;
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
        const queryRedirect =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect")
            : null;
        const targetUrl = buildPostAuthEntryUrl({
          mustChangePassword: false,
          requireMfaEnrollment: resolvedRequireMfaEnrollment,
          subscriptionStatus: resolvedSubStatus,
          redirect: queryRedirect,
        });
        useNavigationStore.getState().clearRouteData();
        useNavigationStore.getState().reset();
        setDefaultRedirectPath("/");
        setMustChangePassword(false);
        setRequireMfaEnrollment?.(resolvedRequireMfaEnrollment);

        await queryClient.invalidateQueries();
        operationSuccess(t("profile.security.passwordChanged"));
        if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
          window.location.href = targetUrl;
        } else {
          router.replace(targetUrl);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("profile.common.error");
        setSubmitError(msg);
        operationError(t("profile.security.updatePassword"), undefined, msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      policy,
      policyError,
      newPassword,
      confirmPassword,
      user,
      currentSubscriptionStatus,
      authRepository,
      setAuth,
      setSubscriptionInfo,
      setMustChangePassword,
      setRequireMfaEnrollment,
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
    policy,
    isPolicyLoading,
    policyError,
    refetchPolicy,
    evaluation,
    isSubmitting,
    submitError,
    passwordsMatch,
    showMismatch,
    canSubmit,
    handleSubmit,
    handleLogout,
  };
}
