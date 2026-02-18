/**
 * Cookie-Based Impersonation Hook
 *
 * Clean Architecture:
 * View → ViewModel → useImpersonation → AuthRepository → AuthService → API
 *
 * Flow:
 * 1. startImpersonation(adminId) → repo.impersonate(adminId)
 *    → AuthService.impersonate() → POST /v1/auth/admin/impersonate/{id}
 *    → CookieAuthMiddleware sets httpOnly cookie for refresh token
 *    → AuthRepository stores access token
 *    → Page reload → refresh works via httpOnly cookie
 *
 * 2. stopImpersonation() → repo.stopImpersonation()
 *    → AuthService.stopImpersonation() → POST /v1/auth/admin/stop-impersonation
 *    → Backend reads ImpersonatorAdminId from current refresh token
 *    → Generates new tokens for original admin
 *    → CookieAuthMiddleware replaces httpOnly cookie
 *    → AuthRepository restores original admin session
 */

import { useState, useCallback } from "react";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useQueryClient } from "@tanstack/react-query";
import { appLogger } from "@core/common/logger";
import { getAuthContainer } from "@modules/auth/di";

export function useImpersonation() {
  const { success, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Start impersonating another admin.
   * Uses AuthRepository → AuthService (clean architecture).
   */
  const startImpersonation = useCallback(
    async (adminId: string) => {
      setIsLoading(true);
      try {
        const repo = getAuthContainer().authRepository;
        await repo.impersonate(adminId);

        setIsImpersonating(true);
        success({ title: "Impersonation started", description: "You are now viewing as another admin." });
        appLogger.auth(`Impersonation started for admin: ${adminId}`);

        // Full reload to re-fetch all data with new identity
        await queryClient.invalidateQueries();
        window.location.reload();
      } catch (err) {
        appLogger.error("Impersonation failed:", err);
        toastError({
          title: "Impersonation failed",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient, success, toastError]
  );

  /**
   * Stop impersonation and restore original admin session.
   * Uses AuthRepository → AuthService (clean architecture).
   */
  const stopImpersonation = useCallback(async () => {
    setIsLoading(true);
    try {
      const repo = getAuthContainer().authRepository;
      await repo.stopImpersonation();

      setIsImpersonating(false);
      success({ title: "Impersonation ended", description: "Your original session has been restored." });
      appLogger.auth("Impersonation stopped, original admin restored");

      // Full reload to re-fetch all data with original identity
      await queryClient.invalidateQueries();
      window.location.reload();
    } catch (err) {
      appLogger.error("Stop impersonation failed:", err);
      toastError({
        title: "Stop impersonation failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, success, toastError]);

  return {
    isImpersonating,
    isImpersonationLoading: isLoading,
    startImpersonation,
    stopImpersonation,
  };
}
