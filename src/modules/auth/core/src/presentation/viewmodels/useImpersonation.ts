/**
 * Cookie-Based Impersonation Hook
 *
 * Clean Architecture:
 * View → ViewModel → useImpersonation → AuthRepository → AuthService → API
 *
 * Impersonation state is persisted in sessionStorage ("nexora_impersonating")
 * so the header banner survives page reloads within the same tab.
 *
 * Flow:
 * 1. startImpersonation(adminId) → repo.impersonate(adminId)
 *    → AuthService.impersonate() → POST /v1/auth/admin/impersonate/{id}
 *    → CookieAuthMiddleware sets httpOnly cookie for refresh token
 *    → AuthRepository stores access token + sets sessionStorage flag
 *    → Page reload → refresh works via httpOnly cookie → banner shows
 *
 * 2. stopImpersonation() → repo.stopImpersonation()
 *    → AuthService.stopImpersonation() → POST /v1/auth/admin/stop-impersonation
 *    → Backend reads ImpersonatorAdminId from current refresh token
 *    → Generates new tokens for original admin
 *    → CookieAuthMiddleware replaces httpOnly cookie
 *    → AuthRepository restores original admin session + clears sessionStorage flag
 */

import { useState, useCallback } from "react";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useQueryClient } from "@tanstack/react-query";
import { appLogger } from "@core/common/logger";
import { getAuthContainer } from "@modules/auth/di";
import { STORAGE_KEYS } from "@core/config/storage-keys";

/**
 * Check if we're currently impersonating (read from sessionStorage).
 * This survives page reloads within the same tab but not new tabs.
 */
function getImpersonationState(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEYS.IMPERSONATING) === "true";
}

export function useImpersonation() {
  const { success, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();
  // Initialize from sessionStorage so impersonation state survives page reloads
  const [isImpersonating, setIsImpersonating] = useState(getImpersonationState);
  const [isImpersonationLoading, setIsImpersonationLoading] = useState(false);

  /**
   * Start impersonating another admin.
   * Uses AuthRepository → AuthService (clean architecture).
   */
  const startImpersonation = useCallback(
    async (adminId: string) => {
      setIsImpersonationLoading(true);
      try {
        const repo = getAuthContainer().authRepository;
        await repo.impersonate(adminId);

        setIsImpersonating(true);
        success({
          title: "Impersonation started",
          description: "You are now viewing as another admin.",
        });
        appLogger.auth(`Impersonation started for admin: ${adminId}`);

        // Navigate to home with full reload — fresh data with new identity
        window.location.href = "/";
      } catch (err) {
        appLogger.error("Impersonation failed:", err);
        toastError({
          title: "Impersonation failed",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setIsImpersonationLoading(false);
      }
    },
    [queryClient, success, toastError]
  );

  /**
   * Stop impersonation and restore original admin session.
   * Uses AuthRepository → AuthService (clean architecture).
   */
  const stopImpersonation = useCallback(async () => {
    setIsImpersonationLoading(true);
    try {
      const repo = getAuthContainer().authRepository;
      await repo.stopImpersonation();

      setIsImpersonating(false);
      success({
        title: "Impersonation ended",
        description: "Your original session has been restored.",
      });
      appLogger.auth("Impersonation stopped, original admin restored");

      // Navigate to home with full reload — fresh data with original identity
      window.location.href = "/";
    } catch (err) {
      appLogger.error("Stop impersonation failed:", err);
      toastError({
        title: "Stop impersonation failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsImpersonationLoading(false);
    }
  }, [queryClient, success, toastError]);

  return {
    isImpersonating,
    isImpersonationLoading,
    startImpersonation,
    stopImpersonation,
  };
}
