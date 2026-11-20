"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { broadcastTenantContext } from "@core/services/api-factory";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";

const TENANT_BREADCRUMBS_STORAGE_KEY = "scr_tenant_breadcrumbs";

/**
 * Shared safe recovery navigation and session-termination actions for
 * context & navigation gates rendered outside DashboardLayout.
 */
export function useGateActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { authRepository } = useServices();
  const logout = useAppStore((s) => s.logout);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const goToHub = useCallback(() => {
    startRoutingProgress();
    router.push("/hub");
  }, [router]);

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    startRoutingProgress();
    router.push("/hub");
  }, [router]);

  const navigateTo = useCallback(
    (path: string) => {
      startRoutingProgress();
      router.push(path);
    },
    [router]
  );

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await authRepository.logout().catch(() => undefined);
    } finally {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(STORAGE_KEYS.tenant_context);
          sessionStorage.removeItem(TENANT_BREADCRUMBS_STORAGE_KEY);
          localStorage.removeItem(STORAGE_KEYS.NAV_STORE);
        } catch {
          /* ignore storage errors */
        }
      }
      broadcastTenantContext(null);
      useNavigationStore.getState().reset();
      queryClient.clear();
      logout();
      startRoutingProgress();
      router.replace("/login");
      setIsSigningOut(false);
    }
  }, [authRepository, queryClient, logout, router]);

  return {
    goToHub,
    goBack,
    navigateTo,
    signOut,
    isSigningOut,
  };
}
