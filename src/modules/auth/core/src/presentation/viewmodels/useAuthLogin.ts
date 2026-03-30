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
  const { operationError, operationSuccess } = useEnhancedToast();
  const { refreshNavigation } = useNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password, tenantId, tenantCode }: { username: string; password: string; tenantId?: string; tenantCode?: string }) => {
      // Construct domain entity — repository handles mapping to API model
      const request = new LoginRequest({ username, password, tenantId });
      return authRepository.login(request);
    },
    onSuccess: async (user, variables) => {
      // 1. Set user in store with permissions and roles
      setAuth(
        user,
        user.permissions || [],
        []
      );

      // 2. Persist tenant code for tenant-aware logout redirect
      if (variables.tenantCode) {
        useAppStore.getState().setTenantCode(variables.tenantCode);
      }

      // 3. Show success toast
      operationSuccess("Login successful!");

      // 4. Fetch navigation data immediately after login (force refresh)
      try {
        await refreshNavigation(false, true);
      } catch (error) {
        appLogger.error("Failed to fetch navigation after login:", error);
      }

      // 5. Invalidate any cached queries to ensure fresh data on protected pages
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      // Don't show toast for 2FA required — it's not an error, it's a flow step
      if (error instanceof TwoFactorRequiredError) return;
      operationError(error.message || "Login failed");
    },
  });
}
