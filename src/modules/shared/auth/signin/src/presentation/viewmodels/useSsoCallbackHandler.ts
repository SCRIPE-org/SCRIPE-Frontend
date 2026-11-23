"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useNavigation } from "@core/providers/navigation-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import {
  buildVerifiedCrossOriginCallbackUrl,
  completePrincipalLogin,
  handleOidcCallback,
  handleSamlCallback,
  resolveSsoErrorOutcome,
  type SsoTwoFactorPendingData,
} from "../utils/ssoCallbackHandlers";
import { executeSsoTwoFactorVerification } from "../utils/ssoTwoFactorBridge";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

/** Supported SSO callback protocol types. */
export type SsoCallbackKind = "oidc" | "saml" | "continue";

/** State machine for the SSO callback page. */
export type SsoCallbackState =
  | "processing"
  | "success"
  | "error"
  | "no_linked_account"
  | "workspace_selection"
  | "two_factor";

/** Structured error presentation for failed SSO callbacks. */
export interface SsoCallbackError {
  title: string;
  message: string;
}

function scrubSensitiveSsoUrlParams(): void {
  if (typeof window === "undefined") return;
  try {
    const current = new URL(window.location.href);
    if (!current.searchParams.has("code") && !current.searchParams.has("state")) return;
    current.searchParams.delete("code");
    current.searchParams.delete("state");
    window.history.replaceState({}, "", `${current.pathname}${current.search}${current.hash}`);
  } catch {
    // Ignore history API restrictions
  }
}

/**
 * ViewModel hook coordinating OIDC/OAuth2, SAML 2.0, and central `/sso/continue`
 * callback completion, multi-workspace selection, and hybrid IdP MFA verification.
 */
export function useSsoCallbackHandler(kind: SsoCallbackKind) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const setMustChangePassword = useAppStore((state) => state.setMustChangePassword);
  const setRequireMfaEnrollment = useAppStore((state) => state.setRequireMfaEnrollment);
  const setDefaultRedirectPath = useAppStore((state) => state.setDefaultRedirectPath);
  const { authRepository, ssoRepository } = useServices();
  const servicesRef = useRef({ authRepository, ssoRepository });
  servicesRef.current = { authRepository, ssoRepository };
  const { refreshNavigation } = useNavigation();
  const queryClient = useQueryClient();
  const { success: operationSuccess } = useEnhancedToast();
  const hasProcessed = useRef(false);

  const [state, setState] = useState<SsoCallbackState>("processing");
  const [errorInfo, setErrorInfo] = useState<SsoCallbackError | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [handoffContext, setHandoffContext] = useState<{
    returnOrigin?: string | null;
    returnPath?: string | null;
  }>({});
  const [workspaceData, setWorkspaceData] = useState<{
    workspaces: WorkspaceChoice[];
    token: string;
  } | null>(null);
  const [workspaceEmail, setWorkspaceEmail] = useState<string>("");
  const [isSelectingWorkspace, setIsSelectingWorkspace] = useState(false);
  const [selectionError, setSelectionError] = useState<string | undefined>(undefined);
  const [twoFactorPending, setTwoFactorPending] = useState<SsoTwoFactorPendingData | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");

  const navigateToTarget = useCallback(
    (targetUrl: string) => {
      if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
        window.location.href = targetUrl;
      } else {
        router.replace(targetUrl);
      }
    },
    [router]
  );

  const buildDeps = useCallback(
    () => ({
      authRepository: servicesRef.current.authRepository,
      ssoRepository: servicesRef.current.ssoRepository,
      setAuth,
      setSubscriptionInfo,
      setMustChangePassword,
      setRequireMfaEnrollment,
      refreshNavigation,
      invalidateQueries: () => queryClient.invalidateQueries(),
      operationSuccess,
      t,
    }),
    [operationSuccess, queryClient, refreshNavigation, setAuth, setMustChangePassword, setRequireMfaEnrollment, setSubscriptionInfo, t]
  );

  const handleSelectWorkspace = async (workspace: WorkspaceChoice) => {
    if (!workspaceData) return;
    setIsSelectingWorkspace(true);
    setSelectionError(undefined);
    try {
      const targetTenantId = workspace.isPlatformAdmin ? "" : workspace.tenantId;
      const result = await servicesRef.current.ssoRepository.completeWorkspaceSelection(
        workspaceData.token,
        targetTenantId
      );
      const returnOrigin =
        result.returnOrigin !== undefined
          ? result.returnOrigin
          : (handoffContext.returnOrigin ?? null);
      const returnPath =
        result.returnOrigin === null
          ? (result.returnPath ?? null)
          : (result.returnPath ?? handoffContext.returnPath ?? null);
      if (result.returnOrigin === null) {
        setHandoffContext({ returnOrigin: null, returnPath });
      }
      // Resolve central hybrid-2FA BEFORE forwarding to any cross-origin custom domain (#227/#228).
      if (result.requires2FA && result.twoFactorPendingToken) {
        setTwoFactorPending({
          token: result.twoFactorPendingToken,
          staySignedIn: Boolean(result.staySignedIn),
          email: result.email,
          principalType: result.type === "user" ? "user" : "admin",
          returnOrigin,
          returnPath,
        });
        setTwoFactorCode("");
        setTwoFactorError("");
        setState("two_factor");
        return;
      }
      const crossOrigin = buildVerifiedCrossOriginCallbackUrl(
        result.returnOrigin,
        result.handoffCode,
        result.handoffState,
        returnPath,
        result.returnOrigin ? [result.returnOrigin] : undefined
      );
      if (crossOrigin) {
        setState("success");
        setTimeout(() => navigateToTarget(crossOrigin), 150);
        return;
      }
      if ((result.type === "admin" || result.type === "user") && result.accessToken) {
        await completePrincipalLogin(
          result.type,
          result.accessToken,
          {
            status: result.subscriptionStatus,
            gracePhase: result.gracePhase,
            editionName: result.editionName,
            mustChangePassword: result.mustChangePassword,
            requireMfaEnrollment: result.requireMfaEnrollment,
            returnPath,
            returnOrigin,
          },
          buildDeps(),
          { setState, setErrorInfo, redirectTo: navigateToTarget }
        );
      } else {
        setState("error");
        setErrorInfo({ title: t("auth.sso.callbackError"), message: t("auth.sso.unsupportedAccountType") });
      }
    } catch (err: unknown) {
      setSelectionError(err instanceof Error ? err.message : t("auth.sso.callbackErrorGeneric"));
    } finally {
      setIsSelectingWorkspace(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorPending) return;
    if (!twoFactorCode.trim()) {
      setTwoFactorError(t("auth.twoFactor.enterCode"));
      return;
    }
    setTwoFactorError("");
    setIsVerifying2FA(true);
    try {
      await executeSsoTwoFactorVerification({
        authRepository: servicesRef.current.authRepository,
        twoFactorPending,
        twoFactorCode,
        handoffContext,
        queryRedirect: searchParams?.get("redirect") ?? null,
        setAuth,
        setSubscriptionInfo,
        setMustChangePassword,
        setRequireMfaEnrollment,
        setDefaultRedirectPath,
        invalidateQueries: () => queryClient.invalidateQueries(),
        operationSuccess,
        setState: (s) => setState(s),
        setTwoFactorError,
        navigateToTarget,
        t,
      });
    } catch (err: unknown) {
      setTwoFactorError(err instanceof Error ? err.message : t("auth.twoFactor.invalidCode"));
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const toggleBackupCode = () => {
    setUseBackupCode((prev) => !prev);
    setTwoFactorCode("");
    setTwoFactorError("");
  };

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const snapshot = new URLSearchParams(searchParams?.toString() ?? "");
    scrubSensitiveSsoUrlParams();

    const deps = buildDeps();
    const setters = {
      setState,
      setErrorInfo,
      setErrorCode,
      redirectTo: navigateToTarget,
      setWorkspaceSelectionData: (data: {
        workspaces: WorkspaceChoice[];
        token: string;
        email?: string;
        returnOrigin?: string | null;
        returnPath?: string | null;
      }) => {
        setWorkspaceData(data);
        setWorkspaceEmail(data.email || "");
        setHandoffContext({ returnOrigin: data.returnOrigin ?? null, returnPath: data.returnPath ?? null });
      },
      setTwoFactorPending: (data: SsoTwoFactorPendingData) => {
        setTwoFactorPending(data);
        setHandoffContext({ returnOrigin: data.returnOrigin ?? null, returnPath: data.returnPath ?? null });
        setTwoFactorCode("");
        setTwoFactorError("");
      },
    };
    setTimeout(() => {
      void (kind === "saml"
        ? handleSamlCallback(snapshot, deps, setters)
        : handleOidcCallback(snapshot, deps, setters));
    }, 0);
  }, [buildDeps, kind, navigateToTarget, searchParams]);

  const rawQueryError = searchParams?.get("error") ?? searchParams?.get("error_code");
  const resolvedErrorCode =
    errorCode ?? (rawQueryError ? resolveSsoErrorOutcome(rawQueryError, t).safeCode : null);

  return {
    state,
    errorInfo,
    errorCode: resolvedErrorCode,
    workspaceData,
    workspaceEmail,
    isSelectingWorkspace,
    selectionError,
    handleSelectWorkspace,
    handleBack: () => router.replace("/login"),
    twoFactorCode,
    setTwoFactorCode,
    useBackupCode,
    isVerifying2FA,
    twoFactorError,
    handleVerify2FA,
    toggleBackupCode,
  };
}
