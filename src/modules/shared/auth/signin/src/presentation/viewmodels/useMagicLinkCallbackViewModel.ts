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
 *   - If it belongs to MULTIPLE workspaces → show an IN-PAGE workspace
 *     picker (same pattern as useSsoCallbackHandler's "workspace_selection"
 *     state) and complete the login for the chosen workspace by re-calling
 *     verifyMagicLink with that workspace's tenantId — the same magic-link
 *     token is reusable for this second call because the backend didn't
 *     issue a session yet (requiresWorkspaceSelection means no token was
 *     consumed).
 *
 *     NOTE: this deliberately does NOT redirect to /hub — /hub is a
 *     protected SYSTEM_PAGE and the user has no auth token at this point,
 *     so RouteGuard would bounce them to /login before /hub ever reads the
 *     query params.
 *
 * States:
 *   - verifying: spinner while POST /auth/magic-link/verify runs
 *   - success: brief success flash → redirect to dashboard
 *   - workspace-selection: in-page workspace picker (see above)
 *   - expired/invalid: error with "request a new link" CTA
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { authContainer } from "@modules/auth/di";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

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
  availableWorkspaces: WorkspaceChoice[];
  isSelectingWorkspace: boolean;
  workspaceSelectionError?: string;
  selectWorkspace: (workspace: WorkspaceChoice) => Promise<void>;
  goBackToLogin: () => void;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * React hook/ViewModel orchestrating state and data flows for magic link callback view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useMagicLinkCallbackViewModel(): UseMagicLinkCallbackViewModelReturn {
  const { direction, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);

  const token = searchParams?.get("token") ?? "";
  const tenantId = searchParams?.get("tenantId") ?? undefined;

  const [state, setState] = useState<MagicLinkVerifyState>(token ? "verifying" : "error");
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceChoice[]>([]);
  const [isSelectingWorkspace, setIsSelectingWorkspace] = useState(false);
  const [workspaceSelectionError, setWorkspaceSelectionError] = useState<string | undefined>(
    undefined
  );

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

        // ── Multi-workspace: show the picker in-page ─────────────────────
        // No session/token has been issued yet, so we cannot redirect to any
        // authenticated route — RouteGuard would bounce it straight back to
        // /login. Render the picker here and complete login on selection.
        if (response.requiresWorkspaceSelection && response.availableWorkspaces?.length) {
          setAvailableWorkspaces(response.availableWorkspaces as WorkspaceChoice[]);
          setState("workspace-selection");
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

  // ── Workspace selection: re-verify the SAME magic-link token, now scoped
  // to the chosen tenant. The first verifyMagicLink call above never issued
  // a session (requiresWorkspaceSelection means the token wasn't consumed),
  // so this is safe and mirrors how the credentials-login workspace picker
  // re-submits with a tenantId.
  const selectWorkspace = useCallback(
    async (workspace: WorkspaceChoice) => {
      if (!token) return;
      setWorkspaceSelectionError(undefined);
      setIsSelectingWorkspace(true);

      try {
        const { authRepository } = authContainer;
        const response = await authRepository.verifyMagicLink(token, workspace.tenantId);

        if (!response.user) {
          setWorkspaceSelectionError(t("auth.loginFailed") || "Login failed");
          return;
        }

        setAuth(response.user, response.user.permissions ?? [], [], true);
        setSubscriptionInfo(
          response.subscriptionStatus ?? null,
          response.gracePhase ?? null,
          response.editionName ?? null
        );
        useAppStore.getState().setMustChangePassword(response.mustChangePassword ?? false);

        setState("success");
        setTimeout(() => {
          router.replace(
            response.mustChangePassword ? "/change-password" : response.defaultRedirectPath || "/"
          );
        }, 600);
      } catch (err) {
        setWorkspaceSelectionError(
          err instanceof Error ? err.message : t("auth.loginFailed") || "Login failed"
        );
      } finally {
        setIsSelectingWorkspace(false);
      }
    },
    [token, setAuth, setSubscriptionInfo, router, t]
  );

  const goBackToLogin = useCallback(() => {
    router.replace("/login");
  }, [router]);

  return {
    state,
    direction,
    availableWorkspaces,
    isSelectingWorkspace,
    workspaceSelectionError,
    selectWorkspace,
    goBackToLogin,
  };
}
