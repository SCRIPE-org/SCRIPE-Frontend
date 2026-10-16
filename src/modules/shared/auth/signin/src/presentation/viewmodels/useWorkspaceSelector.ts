"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  WorkspaceSelectionRequiredError,
  TwoFactorRequiredError,
} from "@modules/auth/core/domain/errors/AuthErrors";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import type { LoginStep } from "./use2FAHandler";
import { getSafeRedirectPath } from "../utils/redirect-safety";

interface UseWorkspaceSelectorOptions {
  redirectPath: string;
  formIdentifier: string;
  formPassword: string;
  loginMutateAsync: (params: {
    identifier: string;
    password: string;
    tenantId?: string;
    tenantCode?: string;
    isPlatformAdmin?: boolean;
  }) => Promise<unknown>;
  setIsRedirecting: (v: boolean) => void;
  setLoginStep: (step: LoginStep) => void;
  setError: (msg: string) => void;
  setTenantId: (id: string | undefined) => void;
  isRedirectTriggered: () => boolean;
  onRedirectTriggered: () => void;
  handleRedirect: (path: string) => void;
  enterTwoFactor: () => void;
  /** Called by enterTwoFactor so 2FA knows which tenantId to verify against */
  onTenantResolved: (id: string | undefined) => void;
}

/**
 * useWorkspaceSelector — manages multi-tenant workspace selection state.
 *
 * Extracted from useLoginViewModel to keep that hook focused.
 * Handles: showing the workspace list, selecting a workspace,
 * dispatching the follow-on login, and routing to 2FA if needed.
 */
export function useWorkspaceSelector(opts: UseWorkspaceSelectorOptions) {
  const {
    redirectPath,
    formIdentifier,
    formPassword,
    loginMutateAsync,
    setIsRedirecting,
    setLoginStep,
    setError,
    setTenantId,
    isRedirectTriggered,
    onRedirectTriggered,
    handleRedirect,
    enterTwoFactor,
    onTenantResolved,
  } = opts;

  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceChoice[]>([]);
  const { t } = useI18n();

  const showWorkspaces = useCallback(
    (workspaces: WorkspaceChoice[]) => {
      setAvailableWorkspaces(workspaces);
      setLoginStep("workspace-selection");
      setError("");
    },
    [setLoginStep, setError]
  );

  /**
   * Select a workspace from the post-credential picker.
   *
   * For tenant workspaces   → hits CASE A (tenant-scoped login, issues JWT for that tenant)
   * For platform admin      → hits CASE A' (isPlatformAdmin = true, issues platform JWT)
   *                           WITHOUT isPlatformAdmin, backend re-runs CASE B → infinite loop!
   */
  const selectWorkspace = useCallback(
    async (workspace: WorkspaceChoice) => {
      if (!workspace.isActivated || workspace.isDisabled) return;

      setError("");

      const chosenTenantId = workspace.isPlatformAdmin ? undefined : workspace.tenantId;
      const tenantCode = workspace.isPlatformAdmin ? undefined : workspace.tenantCode;

      try {
        await loginMutateAsync({
          identifier: formIdentifier,
          password: formPassword,
          tenantId: chosenTenantId,
          tenantCode,
          isPlatformAdmin: workspace.isPlatformAdmin,
        });

        setIsRedirecting(true);
        if (!isRedirectTriggered()) {
          onRedirectTriggered();
          const { useAppStore } = await import("@core/store/useAppStore");
          const mustChange = useAppStore.getState().mustChangePassword;
          // redirectPath can originate from the attacker-controlled `?redirect=`
          // query param — validate same-origin/relative before navigating
          // (handleRedirect re-validates too, this is defense-in-depth).
          const targetPath = mustChange ? "/change-password" : getSafeRedirectPath(redirectPath);
          setTimeout(() => handleRedirect(targetPath), 100);
        }
      } catch (err: unknown) {
        if (err instanceof TwoFactorRequiredError) {
          // Persist the selected tenantId so handleVerify2FA verifies against the right tenant
          onTenantResolved(chosenTenantId);
          setTenantId(chosenTenantId);
          enterTwoFactor();
          return;
        }
        if (err instanceof WorkspaceSelectionRequiredError) {
          setError(t("auth.loginFailed"));
          return;
        }
        setError(err instanceof Error ? err.message : t("auth.loginFailed"));
      }
    },
    [
      formIdentifier,
      formPassword,
      loginMutateAsync,
      redirectPath,
      setIsRedirecting,
      setError,
      setTenantId,
      isRedirectTriggered,
      onRedirectTriggered,
      handleRedirect,
      enterTwoFactor,
      onTenantResolved,
      t,
    ]
  );

  const clearWorkspaces = useCallback(() => {
    setAvailableWorkspaces([]);
  }, []);

  /**
   * unlockWorkspace — called when user submits the inline password form on a locked workspace.
   */
  const unlockWorkspace = useCallback(
    async (workspace: WorkspaceChoice, password: string): Promise<void> => {
      const chosenTenantId = workspace.isPlatformAdmin ? undefined : workspace.tenantId;
      const tenantCode = workspace.isPlatformAdmin ? undefined : workspace.tenantCode;

      try {
        await loginMutateAsync({
          identifier: formIdentifier,
          password,
          tenantId: chosenTenantId,
          tenantCode,
          isPlatformAdmin: workspace.isPlatformAdmin,
        });

        // Login succeeded — redirect
        setIsRedirecting(true);
        if (!isRedirectTriggered()) {
          onRedirectTriggered();
          const { useAppStore } = await import("@core/store/useAppStore");
          const mustChange = useAppStore.getState().mustChangePassword;
          const targetPath = mustChange ? "/change-password" : getSafeRedirectPath(redirectPath);
          setTimeout(() => handleRedirect(targetPath), 100);
        }
      } catch (err: unknown) {
        if (err instanceof TwoFactorRequiredError) {
          onTenantResolved(chosenTenantId);
          setTenantId(chosenTenantId);
          enterTwoFactor();
          return;
        }
        // Rethrow so WorkspaceCard can display inline error
        throw err;
      }
    },
    [
      formIdentifier,
      loginMutateAsync,
      redirectPath,
      setIsRedirecting,
      setTenantId,
      isRedirectTriggered,
      onRedirectTriggered,
      handleRedirect,
      enterTwoFactor,
      onTenantResolved,
    ]
  );

  return { availableWorkspaces, showWorkspaces, selectWorkspace, clearWorkspaces, unlockWorkspace };
}
