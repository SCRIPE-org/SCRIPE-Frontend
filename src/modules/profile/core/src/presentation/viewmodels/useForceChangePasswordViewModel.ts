import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { container } from "@modules/profile/di";
import { useServices } from "@core/providers/service-provider";

/**
 * React hook/ViewModel managing logic, state, and repository queries for force change password view model.
 */
export function useForceChangePasswordViewModel() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const setMustChangePassword = useAppStore((state) => state.setMustChangePassword);
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const logout = useAppStore((state) => state.logout);
  const { operationSuccess, operationError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const { profileRepository } = container;
  const { authRepository } = useServices();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Password strength
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasNumber &&
    hasSpecial &&
    passwordsMatch &&
    currentPassword.length > 0;

  const strengthItems = [
    { met: hasMinLength, label: t("profile.security.strength.minLength") },
    { met: hasUppercase, label: t("profile.security.strength.uppercase") },
    { met: hasNumber, label: t("profile.security.strength.number") },
    { met: hasSpecial, label: t("profile.security.strength.special") },
  ];

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await profileRepository.changePassword({
          currentPassword,
          newPassword,
        });

        const refreshResult = await authRepository.refreshToken();
        if (refreshResult.kind === "ok") {
          const refreshData = refreshResult.value;
          setSubscriptionInfo(
            refreshData.subscriptionStatus ?? null,
            refreshData.gracePhase ?? null,
            refreshData.editionName ?? null
          );

          try {
            const user = await authRepository.getMe();
            if (user) {
              setAuth(user, user.permissions || [], []);
            }
          } catch {
            /* non-critical */
          }
        }

        setMustChangePassword(false);
        operationSuccess(t("profile.security.passwordChanged"));
        queryClient.invalidateQueries();
        router.replace("/");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Password change failed";
        setSubmitError(msg);
        operationError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isValid,
      currentPassword,
      newPassword,
      profileRepository,
      authRepository,
      setMustChangePassword,
      setAuth,
      setSubscriptionInfo,
      operationSuccess,
      operationError,
      router,
      t,
      queryClient,
    ]
  );

  const handleLogout = useCallback(() => {
    logout();
    queryClient.clear();
    router.replace("/login");
  }, [logout, router, queryClient]);

  return {
    t,
    direction,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    isSubmitting,
    submitError,
    strengthItems,
    passwordsMatch,
    isValid,
    handleSubmit,
    handleLogout,
  };
}
