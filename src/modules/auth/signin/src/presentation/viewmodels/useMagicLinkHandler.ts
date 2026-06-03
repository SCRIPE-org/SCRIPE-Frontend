"use client";

import { useState, useCallback } from "react";
import type { LoginStep } from "./use-login-viewmodel";
import { authContainer } from "@modules/auth/di";

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
export function useMagicLinkHandler({
  setLoginStep,
  setError,
}: UseMagicLinkHandlerProps) {
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const requestMagicLink = useCallback(
    async (identifier: string, tenantId?: string) => {
      const email = identifier.trim();
      if (!email || isSending) return;

      setIsSending(true);
      setError("");

      try {
        const authService = authContainer.authService;
        await authService.requestMagicLink(email, tenantId);
        setMagicLinkEmail(email);
        setLoginStep("magic-link-sent" as never);
      } catch {
        setError("auth.connectionError");
      } finally {
        setIsSending(false);
      }
    },
    [isSending, setError, setLoginStep]
  );

  const resendMagicLink = useCallback(
    async (email: string, tenantId?: string) => {
      const authService = authContainer.authService;
      await authService.requestMagicLink(email, tenantId);
    },
    []
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
