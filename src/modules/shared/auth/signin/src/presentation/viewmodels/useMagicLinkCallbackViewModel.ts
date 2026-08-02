/**
 * useMagicLinkCallbackViewModel — Business logic for Magic-Link sign-in verification.
 *
 * Extracted from MagicLinkCallbackView.tsx to enforce SCRIPE MVVM architecture:
 * View → ViewModel → Repository → Service → HTTP
 *
 * The user lands here after clicking the link in their email.
 * URL: /magic-link?token=<raw-token>[&tenantId=<encrypted-id>]
 *
 * Multi-workspace flow:
 *   - If the magic link email belongs to ONE workspace → direct login
 *   - If it belongs to MULTIPLE workspaces → redirect to /hub?token=<token> workspace picker
 *
 * States:
 *   - verifying: spinner while POST /auth/magic-link/verify runs
 *   - success: brief success flash → redirect to dashboard
 *   - workspace-selection: redirect to workspace hub picker
 *   - expired/invalid: error with "request a new link" CTA
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { authContainer } from "@modules/auth/di";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Exported type defining parameters and fields for magic link verify state configurations.
 */
export type MagicLinkVerifyState = "verifying" | "success" | "workspace-selection" | "error";

/**
 * Interface defining property specifications, keys types, and structural contract rules for use magic link callback view model return.
 */
export interface UseMagicLinkCallbackViewModelReturn {
  state: MagicLinkVerifyState;
  direction: string;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * React hook/ViewModel orchestrating state and data flows for magic link callback view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useMagicLinkCallbackViewModel(): UseMagicLinkCallbackViewModelReturn {
  const { direction } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);

  const token = searchParams?.get("token") ?? "";
  const tenantId = searchParams?.get("tenantId") ?? undefined;

  const [state, setState] = useState<MagicLinkVerifyState>(token ? "verifying" : "error");

  // Guard: track which token has already been sent to the backend.
  // React StrictMode (Next.js dev) double-invokes effects (mount → cleanup → remount).
  // The magic-link token is single-use — the first POST consumes it, the second gets
  // "expired/invalid". Storing the token in a ref (which persists across StrictMode
  // remounts) ensures we only call verifyMagicLink once per unique token.
  const verifiedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) return;
    if (verifiedTokenRef.current === token) return; // already in-flight or completed
    verifiedTokenRef.current = token;

    let cancelled = false;

    (async () => {
      try {
        const { authRepository } = authContainer;
        const response = await authRepository.verifyMagicLink(token, tenantId);

        if (cancelled) return;

        // ── Multi-workspace: redirect to hub for picker ──────────────────
        if (response.requiresWorkspaceSelection && response.availableWorkspaces?.length) {
          // Encode workspace data as query param for the hub page
          // The /hub page reads this and shows the workspace picker
          setState("workspace-selection");
          const workspacesParam = encodeURIComponent(JSON.stringify(response.availableWorkspaces));
          // Store the access token temporarily so the hub can use it to select a workspace
          // In practice, if the backend returned `requiresWorkspaceSelection` it means
          // it didn't issue a full token yet — the hub will call the workspace-specific login
          const tokenParam = encodeURIComponent(token);
          router.replace(
            `/hub?workspaces=${workspacesParam}&token=${tokenParam}&method=magic-link`
          );
          return;
        }

        // ── Single workspace: direct login ───────────────────────────────
        if (response.user) {
          // Show success animation. Auth state is set right before navigation
          // (inside the timeout) so the route guard doesn't preempt the animation.
          setState("success");

          setTimeout(() => {
            if (cancelled) return;
            setAuth(response.user!, response.user!.permissions ?? [], [], true);
            setSubscriptionInfo(
              response.subscriptionStatus ?? null,
              response.gracePhase ?? null,
              response.editionName ?? null
            );
            useAppStore.getState().setMustChangePassword(response.mustChangePassword ?? false);
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
  }, [token, tenantId, router, setAuth, setSubscriptionInfo]);

  return {
    state,
    direction,
  };
}
