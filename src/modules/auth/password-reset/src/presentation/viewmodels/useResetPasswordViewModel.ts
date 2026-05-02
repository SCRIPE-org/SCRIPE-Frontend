"use client";

import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { getAuthContainer } from "@modules/auth/di";

export function useResetPasswordViewModel(params: {
  email: string;
  otp: string;
  invalidLinkMessage: string;
  fallbackErrorMessage: string;
}) {
  const { email, otp, invalidLinkMessage, fallbackErrorMessage } = params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(
    () => password.length >= 8 && password === confirmPassword,
    [confirmPassword, password]
  );

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!isValid) return;

      setIsSubmitting(true);
      setError(null);

      try {
        if (!otp || !email) {
          setError(invalidLinkMessage);
          return;
        }

        await getAuthContainer().passwordResetRepository.resetPassword({
          email,
          otp,
          newPassword: password,
        });

        setIsSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : fallbackErrorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, fallbackErrorMessage, invalidLinkMessage, isValid, otp, password]
  );

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    isSuccess,
    error,
    isValid,
    submit,
  };
}
