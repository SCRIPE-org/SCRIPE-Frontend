"use client";

import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { getAuthContainer } from "@modules/auth/di";

export function useForgotPasswordViewModel() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!email.trim()) return;

      try {
        await getAuthContainer().passwordResetRepository.requestReset(email.trim());
      } catch {
        // Anti-enumeration: show the same success state for missing and existing accounts.
      }

      setIsSubmitted(true);
    },
    [email]
  );

  const reset = useCallback(() => {
    setEmail("");
    setIsSubmitted(false);
  }, []);

  return {
    email,
    setEmail,
    isSubmitted,
    submit,
    reset,
    canSubmit: email.trim().length > 0,
  };
}
