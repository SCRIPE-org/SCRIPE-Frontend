"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthContainer } from "@modules/auth/di";
import type { ValidateTokenResponse } from "../../../../core/domain/interfaces/IAccountSetupService";

export type PageState = "loading" | "valid" | "invalid" | "activating" | "success" | "error";

export function useAccountSetupViewModel(params: {
  token: string;
  missingTokenMessage: string;
  invalidTokenMessage: string;
  validationFailedMessage: string;
  activationFailedMessage: string;
  activationUnexpectedMessage: string;
  passwordValidationMessages: {
    minLength: string;
    hasUpper: string;
    hasLower: string;
    hasNumber: string;
    hasSpecial: string;
    matches: string;
  };
}) {
  const {
    token,
    missingTokenMessage,
    invalidTokenMessage,
    validationFailedMessage,
    activationFailedMessage,
    activationUnexpectedMessage,
    passwordValidationMessages,
  } = params;
  const [pageState, setPageState] = useState<PageState>(!token ? "invalid" : "loading");
  const [tokenData, setTokenData] = useState<ValidateTokenResponse | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>(!token ? missingTokenMessage : "");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const passwordChecks = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      matches: password === confirmPassword && confirmPassword.length > 0,
    }),
    [confirmPassword, password]
  );

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function validate() {
      try {
        const result = await getAuthContainer().accountSetupRepository.validateToken(token);
        if (cancelled) return;

        if (result.isValid) {
          setTokenData(result);
          setPageState("valid");
        } else {
          setPageState("invalid");
          setErrorMessage(result.error || invalidTokenMessage);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const details = (err as { details?: { error?: string; message?: string } })?.details;
        setPageState("invalid");
        setErrorMessage(details?.error || details?.message || validationFailedMessage);
      }
    }

    validate();
    return () => {
      cancelled = true;
    };
  }, [invalidTokenMessage, token, validationFailedMessage]);

  const activate = useCallback(async () => {
    setValidationErrors([]);

    if (!isPasswordValid) {
      const errors: string[] = [];
      if (!passwordChecks.minLength) errors.push(passwordValidationMessages.minLength);
      if (!passwordChecks.hasUpper) errors.push(passwordValidationMessages.hasUpper);
      if (!passwordChecks.hasLower) errors.push(passwordValidationMessages.hasLower);
      if (!passwordChecks.hasNumber) errors.push(passwordValidationMessages.hasNumber);
      if (!passwordChecks.hasSpecial) errors.push(passwordValidationMessages.hasSpecial);
      if (!passwordChecks.matches) errors.push(passwordValidationMessages.matches);
      setValidationErrors(errors);
      return;
    }

    setPageState("activating");
    try {
      const result = await getAuthContainer().accountSetupRepository.activateAccount({
        token,
        password,
        confirmPassword,
      });

      if (result.success) {
        setPageState("success");
      } else {
        setPageState("error");
        setErrorMessage(result.error || activationFailedMessage);
      }
    } catch (err: unknown) {
      const details = (err as { details?: { error?: string; message?: string } })?.details;
      setPageState("error");
      setErrorMessage(details?.error || details?.message || activationUnexpectedMessage);
    }
  }, [
    activationFailedMessage,
    activationUnexpectedMessage,
    confirmPassword,
    isPasswordValid,
    password,
    passwordChecks,
    passwordValidationMessages,
    token,
  ]);

  return {
    pageState,
    setPageState,
    tokenData,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    errorMessage,
    validationErrors,
    passwordChecks,
    isPasswordValid,
    activate,
  };
}
