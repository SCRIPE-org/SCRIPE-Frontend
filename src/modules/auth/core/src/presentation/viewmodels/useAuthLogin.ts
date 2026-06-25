/**
 * useAuthLogin — Shared Login Mutation Hook
 *
 * Used by useLoginViewModel (signin submodule) and exported for external use.
 * Flow: View → ViewModel → useAuthLogin → AuthRepository → AuthService → API
 *
 * @module auth/core/presentation
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { LoginRequest } from "../../../domain/entities/Auth";
import {
  TwoFactorRequiredError,
  WorkspaceSelectionRequiredError,
} from "../../../domain/errors/AuthErrors";

/**
 * React hook/ViewModel orchestrating state and data flows for auth login.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function useAuthLogin() {
  const { authRepository } = useServices();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const setDefaultRedirectPath = useAppStore((state) => state.setDefaultRedirectPath);
  const { operationError, operationSuccess } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      identifier,
      password,
      tenantId,
      tenantCode,
      isPlatformAdmin,
      staySignedIn,
    }: {
      identifier: string;
      password: string;
      tenantId?: string;
      tenantCode?: string;
      isPlatformAdmin?: boolean;
      staySignedIn?: boolean;
    }) => {
      // Construct domain entity — repository handles mapping to API model
      const request = new LoginRequest({ identifier, password, tenantId, isPlatformAdmin, staySignedIn });
      return authRepository.login(request);
    },
    onSuccess: async (result, variables) => {
      const {
        user,
        subscriptionStatus,
        gracePhase,
        editionName,
        mustChangePassword,
        defaultRedirectPath,
      } = result;

      // 1. Set user in store with permissions and roles
      setAuth(user, user.permissions || [], [], true);

      // 2. Store subscription status for payment wall / grace banner
      setSubscriptionInfo(subscriptionStatus, gracePhase, editionName);

      // 2b. Store must-change-password flag for route guard enforcement
      useAppStore.getState().setMustChangePassword(mustChangePassword ?? false);

      // 2c. Store backend-provided redirect path — authoritative, not guessed
      setDefaultRedirectPath(defaultRedirectPath ?? "/");

      // 3. Persist tenant code for tenant-aware logout redirect
      if (variables.tenantCode) {
        useAppStore.getState().setTenantCode(variables.tenantCode);
      }

      // 4. Show success toast (localized)
      operationSuccess(t("auth.loginSuccess"));

      // 5. Skip navigation & data fetch if user must change password first
      // They'll be redirected to /change-password immediately — no need to load menus
      if (!mustChangePassword) {
        // v2: NavigationProvider's TanStack queries fire automatically when
        // isAuthenticated becomes true — no explicit refresh call needed here.
        // Just invalidate cached queries to ensure fresh data on protected pages.
        queryClient.invalidateQueries();
      }
    },
    onError: (error: Error) => {
      // Don't show toast for 2FA required — it's not an error, it's a flow step
      if (error instanceof TwoFactorRequiredError || error.name === "TwoFactorRequiredError")
        return;
      // Don't show toast for workspace selection — it's a UX step, not an error
      if (
        error instanceof WorkspaceSelectionRequiredError ||
        error.name === "WorkspaceSelectionRequiredError"
      )
        return;
      operationError(error.message || t("auth.loginFailed"));
    },
  });
}
