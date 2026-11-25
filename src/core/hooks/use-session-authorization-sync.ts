"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { syncCurrentSessionAuthorization } from "@core/hooks/use-authorization-sync";
import { useOptionalNavigation } from "@core/providers/navigation-provider";
import { getAuthRepository } from "@core/services/module-bridges";

/**
 * Returns a stable callback that synchronizes current-session authorization caches,
 * refreshed principal state, and workspace navigation when RBAC or billing entitlements change.
 *
 * Uses `useOptionalNavigation()` and `getAuthRepository()` so ViewModels remain safe inside
 * isolated unit-test wrappers without `<NavigationProvider>` or `<ServiceProvider>`.
 */
export function useSessionAuthorizationSync() {
  const queryClient = useQueryClient();
  const navigation = useOptionalNavigation();
  const refreshNavigation = navigation?.refreshNavigation ?? null;

  return useCallback(
    async (targetTenantId?: string | null): Promise<void> => {
      const authRepository = await getAuthRepository();
      await syncCurrentSessionAuthorization({
        queryClient,
        authRepository,
        refreshNavigation,
        targetTenantId: targetTenantId ?? null,
      });
    },
    [queryClient, refreshNavigation]
  );
}
