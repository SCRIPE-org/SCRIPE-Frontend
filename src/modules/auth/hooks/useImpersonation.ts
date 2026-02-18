import { useState, useEffect, useCallback } from "react";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { getBaseApiService } from "@core/services/api-factory";
import { secureTokenService } from "@core/common/secure-token-service";
import { authBroadcast } from "@core/common/broadcast-auth";
import { useQueryClient } from "@tanstack/react-query";
import { appLogger } from "@core/common/logger";

/**
 * Cookie-Based Impersonation Hook
 *
 * Flow:
 * 1. startImpersonation(adminId) → POST /auth/admin/impersonate/{id}
 *    → Backend returns TokenResponse (access + refresh)
 *    → CookieAuthMiddleware sets httpOnly cookie for refresh token
 *    → Frontend stores access token in memory
 *    → Page reload → refresh works because httpOnly cookie has impersonated admin's refresh token
 *
 * 2. stopImpersonation() → POST /auth/admin/stop-impersonation
 *    → Backend reads ImpersonatorAdminId from current refresh token
 *    → Generates new tokens for original admin
 *    → CookieAuthMiddleware replaces httpOnly cookie
 *    → Frontend restores original admin session
 *
 * No more sessionStorage for backup tokens — the backend handles restoring
 * the original admin via ImpersonatorAdminId on the RefreshToken entity.
 */

const AUTH_ADMIN_IMPERSONATE = "/auth/admin/impersonate";
const AUTH_ADMIN_STOP_IMPERSONATION = "/auth/admin/stop-impersonation";

export function useImpersonation() {
  const { success, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check impersonation status on mount
  // Legacy: check if admin_backup_token exists in sessionStorage
  // Future: check a flag from /me response (isImpersonating)
  useEffect(() => {
    const hasLegacyBackup =
      typeof window !== "undefined" && sessionStorage.getItem("admin_backup_token") !== null;
    setIsImpersonating(hasLegacyBackup);
  }, []);

  /**
   * Start impersonation by calling the new cookie-based endpoint.
   * @param adminId - Encrypted admin ID to impersonate
   */
  const startImpersonation = useCallback(
    async (adminId: string) => {
      setIsLoading(true);
      try {
        const apiService = getBaseApiService();

        // Call the auth-prefixed endpoint
        // CookieAuthMiddleware intercepts the response and sets httpOnly cookie
        const response = await apiService.post<{
          accessToken: string;
          expiresAt: string;
        }>(`${AUTH_ADMIN_IMPERSONATE}/${adminId}`);

        if (response.accessToken) {
          // Set the impersonated access token in memory
          secureTokenService.setAccessToken(response.accessToken);

          // Broadcast to other tabs
          authBroadcast.broadcastImpersonationStart();

          // Clear persistent storage to force fresh load
          if (typeof window !== "undefined") {
            localStorage.removeItem("app-storage");
            localStorage.removeItem("navigation-cache");
            localStorage.removeItem("navigation-cache-expiry");
          }

          // Invalidate all queries and reload to reset all app state
          queryClient.clear();

          // Force full page reload to reset SignalR, stores, etc.
          window.location.href = "/?impersonated=true";
        }
      } catch (err) {
        appLogger.error("[Impersonation] Failed to start:", err);
        toastError({
          title: "Impersonation Failed",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient, toastError]
  );

  /**
   * Stop impersonation and restore the original admin session.
   * The backend reads ImpersonatorAdminId from the current refresh token.
   */
  const stopImpersonation = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiService = getBaseApiService();

      // POST to stop-impersonation — CookieAuthMiddleware injects the refresh token
      // from the httpOnly cookie and sets the new (original admin's) cookie on response
      const response = await apiService.post<{
        accessToken: string;
        expiresAt: string;
      }>(AUTH_ADMIN_STOP_IMPERSONATION);

      if (response.accessToken) {
        // Set the original admin's access token in memory
        secureTokenService.setAccessToken(response.accessToken);

        // Broadcast to other tabs
        authBroadcast.broadcastImpersonationStop();

        // Clear legacy sessionStorage backup if it exists
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("admin_backup_token");
          localStorage.removeItem("app-storage");
          localStorage.removeItem("navigation-cache");
          localStorage.removeItem("navigation-cache-expiry");
          // Clear drill-down state when stopping impersonation
          sessionStorage.removeItem("tenant_context");
        }

        setIsImpersonating(false);

        success({
          title: "Impersonation Ended",
          description: "You have returned to your admin account.",
        });

        // Invalidate all queries and reload
        queryClient.clear();
        window.location.href = "/?impersonation_ended=true";
      }
    } catch (err) {
      appLogger.error("[Impersonation] Failed to stop:", err);
      toastError({
        title: "Failed to Stop Impersonation",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, success, toastError]);

  return {
    isImpersonating,
    isLoading,
    startImpersonation,
    stopImpersonation,
  };
}
