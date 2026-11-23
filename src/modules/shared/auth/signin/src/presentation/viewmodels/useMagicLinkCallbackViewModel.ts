/**
 * useMagicLinkCallbackViewModel — Business logic for Magic-Link sign-in verification.
 *
 * Enforces SCRIPE MVVM: View -> ViewModel -> Repository -> Service -> HTTP.
 * Supports single-workspace login, multi-workspace selection, and hybrid passwordless
 * 2FA step-up (`requires2FA + twoFactorPendingToken`, BAM-01 / BAM-09).
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { extractAndScrubMagicLinkToken } from "../utils/magicLinkUrl";
import type { User } from "@modules/auth/core/domain/entities/User";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import type { AdminRole, PermissionCode } from "@core/common/types/permissions";
import { buildPostAuthEntryUrl } from "../utils/redirect-safety";

/** States of the magic-link callback verification screen. */
export type MagicLinkVerifyState =
  | "verifying"
  | "success"
  | "workspace-selection"
  | "two-factor"
  | "error";

/** Public contract returned by `useMagicLinkCallbackViewModel`. */
export interface UseMagicLinkCallbackViewModelReturn {
  state: MagicLinkVerifyState;
  direction: string;
  availableWorkspaces: WorkspaceChoice[];
  isSelectingWorkspace: boolean;
  workspaceSelectionError?: string;
  selectWorkspace: (workspace: WorkspaceChoice) => Promise<void>;
  twoFactorCode: string;
  setTwoFactorCode: (code: string) => void;
  useBackupCode: boolean;
  isVerifying2FA: boolean;
  twoFactorError: string;
  handleVerify2FA: () => Promise<void>;
  toggleBackupCode: () => void;
  goBackToLogin: () => void;
}

interface SessionPayload {
  user: User;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  defaultRedirectPath?: string | null;
}

/**
 * ViewModel hook for `/magic-link` token redemption, multi-workspace picking,
 * and passwordless 2FA pending-token verification.
 */
export function useMagicLinkCallbackViewModel(): UseMagicLinkCallbackViewModelReturn {
  const { direction, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const setMustChangePassword = useAppStore((state) => state.setMustChangePassword);
  const setRequireMfaEnrollment = useAppStore((state) => state.setRequireMfaEnrollment);
  const setDefaultRedirectPath = useAppStore((state) => state.setDefaultRedirectPath);
  const { authRepository } = useServices();
  const authRepositoryRef = useRef(authRepository);
  authRepositoryRef.current = authRepository;

  const queryToken = (searchParams?.get("token") ?? "").trim();
  const [token, setToken] = useState<string>(queryToken);
  const tenantId = searchParams?.get("tenantId") ?? searchParams?.get("_tenant") ?? undefined;
  const queryRedirect = searchParams?.get("redirect") ?? null;

  const [state, setState] = useState<MagicLinkVerifyState>("verifying");
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceChoice[]>([]);
  const [isSelectingWorkspace, setIsSelectingWorkspace] = useState(false);
  const [workspaceSelectionError, setWorkspaceSelectionError] = useState<string | undefined>(
    undefined
  );

  // Hybrid 2FA step-up state (BAM-01 / BAM-09)
  const [twoFactorPendingToken, setTwoFactorPendingToken] = useState<string | null>(null);
  const [twoFactorStaySignedIn, setTwoFactorStaySignedIn] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");

  // Guard against React StrictMode / re-render re-invoking single-use magic-link verification
  const verifiedTokenRef = useRef<string | null>(null);

  const enterTwoFactorStep = useCallback((pendingToken: string, staySignedIn: boolean) => {
    setTwoFactorPendingToken(pendingToken);
    setTwoFactorStaySignedIn(staySignedIn);
    setTwoFactorCode("");
    setTwoFactorError("");
    setState("two-factor");
  }, []);

  const hydrateAndRedirect = useCallback(
    (payload: SessionPayload, delayMs: number, isCancelled?: () => boolean) => {
      const mustChange = Boolean(payload.mustChangePassword);
      const requireMfa = Boolean(payload.requireMfaEnrollment);
      const targetPath = buildPostAuthEntryUrl({
        mustChangePassword: mustChange,
        requireMfaEnrollment: requireMfa,
        subscriptionStatus: payload.subscriptionStatus,
        redirect: queryRedirect,
      });
      setState("success");

      const apply = () => {
        if (isCancelled?.()) return;
        setAuth(
          payload.user,
          (payload.user.permissions ?? []) as PermissionCode[],
          (payload.user.roles ?? []) as AdminRole[],
          true
        );
        setSubscriptionInfo(
          payload.subscriptionStatus ?? null,
          payload.gracePhase ?? null,
          payload.editionName ?? null
        );
        setMustChangePassword(mustChange);
        setRequireMfaEnrollment?.(requireMfa);
        setDefaultRedirectPath("/");
        if (!mustChange && !requireMfa && payload.subscriptionStatus !== "PendingPayment") {
          queryClient.invalidateQueries();
        }
        if (targetPath.startsWith("http://") || targetPath.startsWith("https://")) {
          window.location.href = targetPath;
        } else {
          router.replace(targetPath);
        }
      };

      setTimeout(apply, delayMs);
    },
    [
      queryRedirect,
      setAuth,
      setSubscriptionInfo,
      setMustChangePassword,
      setRequireMfaEnrollment,
      setDefaultRedirectPath,
      queryClient,
      router,
    ]
  );

  const enterTwoFactorStepRef = useRef(enterTwoFactorStep);
  enterTwoFactorStepRef.current = enterTwoFactorStep;
  const hydrateAndRedirectRef = useRef(hydrateAndRedirect);
  hydrateAndRedirectRef.current = hydrateAndRedirect;

  useEffect(() => {
    const resolvedToken = extractAndScrubMagicLinkToken(queryToken);
    if (resolvedToken) {
      setToken(resolvedToken);
    }

    const activeToken = resolvedToken || verifiedTokenRef.current || "";
    if (!activeToken) {
      setState("error");
      return;
    }
    if (verifiedTokenRef.current === activeToken) return;
    verifiedTokenRef.current = activeToken;
    let cancelled = false;

    (async () => {
      try {
        const response = await authRepositoryRef.current.verifyMagicLink(activeToken, tenantId);
        if (cancelled) return;

        if (response.requires2FA && response.twoFactorPendingToken) {
          enterTwoFactorStepRef.current(
            response.twoFactorPendingToken,
            Boolean(response.staySignedIn)
          );
          return;
        }
        if (response.requiresWorkspaceSelection && response.availableWorkspaces?.length) {
          setAvailableWorkspaces(response.availableWorkspaces as WorkspaceChoice[]);
          setState("workspace-selection");
          return;
        }
        if (response.user) {
          hydrateAndRedirectRef.current(
            { ...response, user: response.user },
            1200,
            () => cancelled
          );
          return;
        }
        setState("error");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryToken, tenantId]);

  const selectWorkspace = useCallback(
    async (workspace: WorkspaceChoice) => {
      const activeToken = token || verifiedTokenRef.current || "";
      if (!activeToken) return;
      setWorkspaceSelectionError(undefined);
      setIsSelectingWorkspace(true);

      try {
        const targetTenantId = workspace.isPlatformAdmin ? undefined : workspace.tenantId;
        const response = await authRepositoryRef.current.verifyMagicLink(
          activeToken,
          targetTenantId,
          false,
          workspace.isPlatformAdmin
        );

        if (response.requires2FA && response.twoFactorPendingToken) {
          enterTwoFactorStep(response.twoFactorPendingToken, Boolean(response.staySignedIn));
          return;
        }
        if (!response.user) {
          setWorkspaceSelectionError(t("auth.loginFailed"));
          return;
        }
        hydrateAndRedirect({ ...response, user: response.user }, 600);
      } catch (err) {
        setWorkspaceSelectionError(err instanceof Error ? err.message : t("auth.loginFailed"));
      } finally {
        setIsSelectingWorkspace(false);
      }
    },
    [token, enterTwoFactorStep, hydrateAndRedirect, t]
  );

  const handleVerify2FA = useCallback(async () => {
    if (!twoFactorPendingToken) return;
    if (!twoFactorCode.trim()) {
      setTwoFactorError(t("auth.twoFactor.enterCode"));
      return;
    }

    setTwoFactorError("");
    setIsVerifying2FA(true);
    try {
      const result = await authRepositoryRef.current.verify2FA(
        "",
        null,
        twoFactorCode.trim(),
        undefined,
        twoFactorPendingToken,
        twoFactorStaySignedIn
      );
      hydrateAndRedirect(result, 400);
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : t("auth.twoFactor.invalidCode"));
    } finally {
      setIsVerifying2FA(false);
    }
  }, [twoFactorPendingToken, twoFactorStaySignedIn, twoFactorCode, hydrateAndRedirect, t]);

  const toggleBackupCode = useCallback(() => {
    setUseBackupCode((prev) => !prev);
    setTwoFactorCode("");
    setTwoFactorError("");
  }, []);

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
    twoFactorCode,
    setTwoFactorCode,
    useBackupCode,
    isVerifying2FA,
    twoFactorError,
    handleVerify2FA,
    toggleBackupCode,
    goBackToLogin,
  };
}
