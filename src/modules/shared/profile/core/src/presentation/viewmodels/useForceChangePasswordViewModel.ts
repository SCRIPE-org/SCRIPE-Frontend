import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { container } from "@modules/profile/di";

/**
 * React hook/ViewModel orchestrating state and data flows for force change password view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function useForceChangePasswordViewModel() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const { operationSuccess, operationError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const { profileRepository } = container;

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

        // The backend revokes every refresh token for this admin as part of a successful
        // password change (OWASP V3.3.3 — the old credential may have been compromised,
        // so old sessions must not survive it). The refresh token this tab is holding is
        // now dead, so calling refreshToken() here always fails with "Token has been
        // revoked" — confirmed live. There is no session left to restore; the correct move
        // is the same clean break as a manual logout, then let the admin sign back in with
        // the password they just set.
        logout();
        queryClient.clear();
        operationSuccess(t("profile.security.passwordChanged"));
        router.replace("/login");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Password change failed";
        setSubmitError(msg);
        operationError("Change password", undefined, msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isValid,
      currentPassword,
      newPassword,
      profileRepository,
      logout,
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
