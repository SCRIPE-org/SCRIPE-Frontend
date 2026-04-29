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
import { useNavigation } from "@core/providers/navigation-provider";
import { appLogger } from "@/core/common/logger";
import { LoginRequest } from "../../../domain/entities/Auth";
import { TwoFactorRequiredError } from "../../../domain/errors/AuthErrors";

export function useAuthLogin() {
  const { authRepository } = useServices();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const { operationError, operationSuccess } = useEnhancedToast();
  const { refreshNavigation } = useNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identifier, password, tenantId, tenantCode }: { identifier: string; password: string; tenantId?: string; tenantCode?: string }) => {
      // Construct domain entity — repository handles mapping to API model
      const request = new LoginRequest({ identifier, password, tenantId });
      return authRepository.login(request);
    },
    onSuccess: async (result, variables) => {
      const { user, subscriptionStatus, gracePhase, editionName, mustChangePassword } = result;

      // 1. Set user in store with permissions and roles
      setAuth(
        user,
        user.permissions || [],
        []
      );

      // 2. Store subscription status for payment wall / grace banner
      setSubscriptionInfo(subscriptionStatus, gracePhase, editionName);

      // 2b. Store must-change-password flag for route guard enforcement
      useAppStore.getState().setMustChangePassword(mustChangePassword ?? false);

      // 3. Persist tenant code for tenant-aware logout redirect
      if (variables.tenantCode) {
        useAppStore.getState().setTenantCode(variables.tenantCode);
      }

      // 4. Show success toast
      operationSuccess("Login successful!");

      // 5. Skip navigation & data fetch if user must change password first
      // They'll be redirected to /change-password immediately — no need to load menus
      if (!mustChangePassword) {
        // Fetch navigation data immediately after login (force refresh)
        try {
          await refreshNavigation(false, true);
        } catch (error) {
          appLogger.error("Failed to fetch navigation after login:", error);
        }

        // Invalidate any cached queries to ensure fresh data on protected pages
        queryClient.invalidateQueries();
      }
    },
    onError: (error: Error) => {
      // Don't show toast for 2FA required — it's not an error, it's a flow step
      if (error instanceof TwoFactorRequiredError) return;
      operationError(error.message || "Login failed");
    },
  });
}
