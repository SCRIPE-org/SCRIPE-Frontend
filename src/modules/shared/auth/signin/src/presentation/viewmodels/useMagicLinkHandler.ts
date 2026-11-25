"use client";

import { useState, useCallback } from "react";
import { useServices } from "@core/providers/service-provider";
import type { LoginStep } from "./use-login-viewmodel";

interface UseMagicLinkHandlerProps {
  setLoginStep: (step: LoginStep | "magic-link-sent") => void;
  setError: (error: string) => void;
}

/**
 * Handles the passwordless magic-link login flow.
 * - requestMagicLink: sends the email and advances to the "magic-link-sent" step.
 * - resendMagicLink: resends with the stored email (for the sent screen).
 * - reset: goes back to credentials.
 */
export function useMagicLinkHandler({ setLoginStep, setError }: UseMagicLinkHandlerProps) {
  const { authRepository } = useServices();
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const requestMagicLink = useCallback(
    async (identifier: string, tenantId?: string) => {
      const email = identifier.trim();
      if (!email || isSending) return;

      setIsSending(true);
      setError("");

      try {
        await authRepository.requestMagicLink(email, tenantId);
        setMagicLinkEmail(email);
        setLoginStep("magic-link-sent" as never);
      } catch {
        setError("auth.connectionError");
      } finally {
        setIsSending(false);
      }
    },
    [authRepository, isSending, setError, setLoginStep]
  );

  const resendMagicLink = useCallback(
    async (email: string, tenantId?: string) => {
      await authRepository.requestMagicLink(email, tenantId);
    },
    [authRepository]
  );

  const resetMagicLink = useCallback(() => {
    setMagicLinkEmail("");
    setLoginStep("credentials" as never);
  }, [setLoginStep]);

  return {
    magicLinkEmail,
    isSending,
    requestMagicLink,
    resendMagicLink,
    resetMagicLink,
  };
}
