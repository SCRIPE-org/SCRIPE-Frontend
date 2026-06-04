"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { authContainer } from "@modules/auth/di";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MagicLinkVerifyState = "verifying" | "success" | "error";

export interface UseMagicLinkCallbackViewModelReturn {
  state: MagicLinkVerifyState;
  direction: string;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * useMagicLinkCallbackViewModel — Business logic for Magic-Link sign-in verification.
 *
 * Extracted from MagicLinkCallbackView.tsx to enforce SCRIPE MVVM architecture:
 * View → ViewModel → Repository → Service → HTTP
 *
 * Previously, the View directly called `authContainer.authService.verifyMagicLink()`
 * — skipping the Repository layer entirely. Now it properly goes through
 * `authContainer.authRepository.verifyMagicLink()`.
 *
 * The user lands here after clicking the link in their email.
 * URL: /magic-link?token=<raw-token>[&tenantId=<encrypted-id>]
 *
 * States:
 *   - verifying: spinner while POST /auth/magic-link/verify runs
 *   - success: brief success flash → redirect
 *   - expired/invalid: error with "request a new link" CTA
 */
export function useMagicLinkCallbackViewModel(): UseMagicLinkCallbackViewModelReturn {
  const { direction } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL params at render time (safe: these won't change on this callback page)
  const token = searchParams?.get("token") ?? "";
  const tenantId = searchParams?.get("tenantId") ?? undefined;

  // Derive initial state from token presence — no need for a synchronous setState in the effect
  const [state, setState] = useState<MagicLinkVerifyState>(token ? "verifying" : "error");

  useEffect(() => {
    // If no token, initial state is already "error" — nothing to do
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        // Goes through Repository → Service → HTTP (proper data flow)
        const { authRepository } = authContainer;
        const response = await authRepository.verifyMagicLink(token, tenantId);

        if (cancelled) return;

        // Token storage is already handled by the repository
        if (response.accessToken) {
          // Single batched Zustand update (static setState — valid outside React render)
          useAppStore.setState({
            isAuthenticated: true,
            mustChangePassword: response.mustChangePassword ?? false,
            defaultRedirectPath: response.defaultRedirectPath ?? "/",
          });
          setState("success");

          setTimeout(() => {
            if (cancelled) return;
            router.replace(
              response.mustChangePassword ? "/change-password" : response.defaultRedirectPath || "/"
            );
          }, 1200);
        } else {
          setState("error");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, tenantId, router]);

  return {
    state,
    direction,
  };
}
