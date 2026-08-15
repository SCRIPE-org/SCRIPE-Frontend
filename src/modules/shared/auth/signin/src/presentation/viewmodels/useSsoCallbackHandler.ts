"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useNavigation } from "@core/providers/navigation-provider";
import { useAppStore } from "@core/store/useAppStore";
import { getAuthContainer } from "@modules/auth/di";
import {
  handleOidcCallback,
  handleSamlCallback,
  completeAdminLogin,
} from "./useSsoCallbackHandlers";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

/**
 * Exported type defining parameters and fields for sso callback kind configurations.
 */
export type SsoCallbackKind = "oidc" | "saml";
/**
 * Exported type defining parameters and fields for sso callback state configurations.
 */
export type SsoCallbackState =
  | "processing"
  | "success"
  | "error"
  | "no_linked_account"
  | "workspace_selection";

/**
 * Interface defining property specifications, keys types, and structural contract rules for sso callback error.
 */
export interface SsoCallbackError {
  title: string;
  message: string;
}

/**
 * React hook/ViewModel orchestrating state and data flows for sso callback handler.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function useSsoCallbackHandler(kind: SsoCallbackKind) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const { refreshNavigation } = useNavigation();
  const queryClient = useQueryClient();
  // useSsoCallbackHandlers' SsoDeps.operationSuccess is typed (msg: string) => void — a
  // bare, already-localized message (see the deps.operationSuccess(deps.t(...)) call
  // sites below) — not useEnhancedToast's templated operationSuccess(operation,
  // itemName?), which wraps its first argument as "{operation} Successful" and would
  // tack the literal English word "Successful" onto an already-translated Arabic
  // string. `success` is the plain "show this message" toast method that actually
  // matches the contract this hook's dependents expect.
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

  const handleSelectWorkspace = async (workspace: WorkspaceChoice) => {
    if (!workspaceData) return;
    setIsSelectingWorkspace(true);
    setSelectionError(undefined);
    try {
      const { ssoRepository, authRepository } = getAuthContainer();
      const result = await ssoRepository.completeWorkspaceSelection(
        workspaceData.token,
        workspace.tenantId
      );

      if (result.type === "admin" && result.accessToken) {
        const deps = {
          authRepository,
          ssoRepository,
          setAuth,
          setSubscriptionInfo,
          refreshNavigation,
          invalidateQueries: () => queryClient.invalidateQueries(),
          operationSuccess,
          t,
        };
        const setters = {
          setState,
          setErrorInfo,
          redirectTo: (path: string) => router.replace(path),
        };
        await completeAdminLogin(
          result.accessToken,
          {
            status: result.subscriptionStatus,
            gracePhase: result.gracePhase,
            editionName: result.editionName,
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
    } catch (err: any) {
      setSelectionError(err.message || t("auth.sso.callbackErrorGeneric"));
    } finally {
      setIsSelectingWorkspace(false);
    }
  };

  const handleBack = () => {
    router.replace("/login");
  };

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const { authRepository, ssoRepository } = getAuthContainer();

    const deps = {
      authRepository,
      ssoRepository,
      setAuth,
      setSubscriptionInfo,
      refreshNavigation,
      invalidateQueries: () => queryClient.invalidateQueries(),
      operationSuccess,
      t,
    };

    const setters = {
      setState,
      setErrorInfo,
      redirectTo: (path: string) => router.replace(path),
      setWorkspaceSelectionData: (data: {
        workspaces: WorkspaceChoice[];
        token: string;
        email?: string;
      }) => {
        setWorkspaceData(data);
        setWorkspaceEmail(data.email || "");
      },
    };

    setTimeout(() => {
      if (kind === "oidc") {
        handleOidcCallback(searchParams, deps, setters);
      } else {
        handleSamlCallback(searchParams, deps, setters);
      }
    }, 0);
  }, [
    kind,
    operationSuccess,
    queryClient,
    refreshNavigation,
    router,
    searchParams,
    setAuth,
    setSubscriptionInfo,
    t,
  ]);

  return {
    state,
    errorInfo,
    workspaceData,
    workspaceEmail,
    isSelectingWorkspace,
    selectionError,
    handleSelectWorkspace,
    handleBack,
  };
}
