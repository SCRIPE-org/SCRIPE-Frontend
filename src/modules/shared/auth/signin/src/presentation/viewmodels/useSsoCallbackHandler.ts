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
  handleOidcCallback,
  handleSamlCallback,
  completeAdminLogin,
  type SsoTwoFactorPendingData,
} from "../utils/ssoCallbackHandlers";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import type { AdminRole, PermissionCode } from "@core/common/types/permissions";
import { buildPostAuthEntryUrl } from "../utils/redirect-safety";

/** Supported SSO callback protocol types. */
export type SsoCallbackKind = "oidc" | "saml";

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

/**
 * ViewModel hook coordinating OIDC/OAuth2 and SAML 2.0 callback completion,
 * multi-workspace selection, and hybrid IdP MFA (`twoFactorPendingToken`) verification.
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

  const [workspaceData, setWorkspaceData] = useState<{
    workspaces: WorkspaceChoice[];
    token: string;
  } | null>(null);
  const [workspaceEmail, setWorkspaceEmail] = useState<string>("");
  const [isSelectingWorkspace, setIsSelectingWorkspace] = useState(false);
  const [selectionError, setSelectionError] = useState<string | undefined>(undefined);

  // Hybrid MFA step-up state (BAM-01)
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

  const handleSelectWorkspace = async (workspace: WorkspaceChoice) => {
    if (!workspaceData) return;
    setIsSelectingWorkspace(true);
    setSelectionError(undefined);
    try {
      const { ssoRepository: ssoRepo, authRepository: authRepo } = servicesRef.current;
      const targetTenantId = workspace.isPlatformAdmin ? "" : workspace.tenantId;
      const result = await ssoRepo.completeWorkspaceSelection(
        workspaceData.token,
        targetTenantId
      );

      // Hybrid MFA step-up after workspace selection
      if (result.requires2FA && result.twoFactorPendingToken) {
        setTwoFactorPending({
          token: result.twoFactorPendingToken,
          staySignedIn: Boolean(result.staySignedIn),
          email: result.email,
        });
        setTwoFactorCode("");
        setTwoFactorError("");
        setState("two_factor");
        return;
      }

      if (result.type === "admin" && result.accessToken) {
        const deps = {
          authRepository: authRepo,
          ssoRepository: ssoRepo,
          setAuth,
          setSubscriptionInfo,
          setMustChangePassword,
          setRequireMfaEnrollment,
          refreshNavigation,
          invalidateQueries: () => queryClient.invalidateQueries(),
          operationSuccess,
          t,
        };
        const setters = {
          setState,
          setErrorInfo,
          redirectTo: navigateToTarget,
        };
        await completeAdminLogin(
          result.accessToken,
          {
            status: result.subscriptionStatus,
            gracePhase: result.gracePhase,
            editionName: result.editionName,
            mustChangePassword: result.mustChangePassword,
            requireMfaEnrollment: result.requireMfaEnrollment,
          },
          deps,
          setters
        );
      } else {
        setState("error");
        setErrorInfo({
          title: t("auth.sso.callbackError"),
          message: t("auth.sso.unsupportedAccountType"),
        });
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
      const { authRepository: authRepo } = servicesRef.current;
      const result = await authRepo.verify2FA(
        "",
        null,
        twoFactorCode.trim(),
        undefined,
        twoFactorPending.token,
        twoFactorPending.staySignedIn
      );

      const { user } = result;
      setAuth(
        user,
        (user.permissions || []) as PermissionCode[],
        (user.roles || []) as AdminRole[],
        true
      );
      setSubscriptionInfo(result.subscriptionStatus, result.gracePhase, result.editionName);
      const mustChange = Boolean(result.mustChangePassword);
      const requireMfa = Boolean(result.requireMfaEnrollment);
      setMustChangePassword(mustChange);
      setRequireMfaEnrollment?.(requireMfa);
      setDefaultRedirectPath("/");

      if (!mustChange && !requireMfa && result.subscriptionStatus !== "PendingPayment") {
        queryClient.invalidateQueries();
      }

      const targetPath = buildPostAuthEntryUrl({
        mustChangePassword: mustChange,
        requireMfaEnrollment: requireMfa,
        subscriptionStatus: result.subscriptionStatus,
        redirect: searchParams?.get("redirect"),
      });

      operationSuccess(t("auth.welcomeBack"));
      setState("success");
      setTimeout(() => {
        navigateToTarget(targetPath);
      }, 200);
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

  const handleBack = () => {
    router.replace("/login");
  };

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const { authRepository: authRepo, ssoRepository: ssoRepo } = servicesRef.current;

    const deps = {
      authRepository: authRepo,
      ssoRepository: ssoRepo,
      setAuth,
      setSubscriptionInfo,
      setMustChangePassword,
      setRequireMfaEnrollment,
      refreshNavigation,
      invalidateQueries: () => queryClient.invalidateQueries(),
      operationSuccess,
      t,
    };

    const setters = {
      setState,
      setErrorInfo,
      redirectTo: navigateToTarget,
      setWorkspaceSelectionData: (data: {
        workspaces: WorkspaceChoice[];
        token: string;
        email?: string;
      }) => {
        setWorkspaceData(data);
        setWorkspaceEmail(data.email || "");
      },
      setTwoFactorPending: (data: SsoTwoFactorPendingData) => {
        setTwoFactorPending(data);
        setTwoFactorCode("");
        setTwoFactorError("");
      },
    };

    setTimeout(() => {
      if (kind === "oidc") {
        void handleOidcCallback(searchParams, deps, setters);
      } else {
        void handleSamlCallback(searchParams, deps, setters);
      }
    }, 0);
  }, [
    kind,
    navigateToTarget,
    operationSuccess,
    queryClient,
    refreshNavigation,
    searchParams,
    setAuth,
    setMustChangePassword,
    setRequireMfaEnrollment,
    setSubscriptionInfo,
    t,
  ]);

  return {
    state, errorInfo, workspaceData, workspaceEmail, isSelectingWorkspace, selectionError,
    handleSelectWorkspace, handleBack, twoFactorCode, setTwoFactorCode,
    useBackupCode, isVerifying2FA, twoFactorError, handleVerify2FA, toggleBackupCode,
  };
}
