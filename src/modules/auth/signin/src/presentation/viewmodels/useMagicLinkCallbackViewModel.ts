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

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { authContainer } from "@modules/auth/di";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MagicLinkVerifyState =
  | "verifying"
  | "success"
  | "workspace-selection"
  | "error";

export interface UseMagicLinkCallbackViewModelReturn {
  state: MagicLinkVerifyState;
  direction: string;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function useMagicLinkCallbackViewModel(): UseMagicLinkCallbackViewModelReturn {
  const { direction } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams?.get("token") ?? "";
  const tenantId = searchParams?.get("tenantId") ?? undefined;

  const [state, setState] = useState<MagicLinkVerifyState>(token ? "verifying" : "error");

  useEffect(() => {
    if (!token) return;

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
          const workspacesParam = encodeURIComponent(
            JSON.stringify(response.availableWorkspaces)
          );
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
        if (response.accessToken) {
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
