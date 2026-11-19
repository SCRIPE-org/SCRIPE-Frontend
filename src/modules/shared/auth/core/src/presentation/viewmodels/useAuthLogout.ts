import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

/**
 * Tenant-aware logout hook.
 * Reads the stored `tenantCode` BEFORE clearing auth state,
 * then redirects back to the tenant's login page (or an explicit `redirectTo`).
 */
export function useAuthLogout() {
  const { authRepository } = useServices();
  const logoutStore = useAppStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { operationError } = useEnhancedToast();
  const router = useRouter();

  // Snapshot tenantCode and optional explicit redirect before logout clears state
  const tenantCodeRef = useRef<string | null>(null);
  const explicitRedirectRef = useRef<string | null>(null);

  const getLogoutRedirectUrl = useCallback((): string => {
    if (explicitRedirectRef.current) {
      return explicitRedirectRef.current;
    }
    const code = tenantCodeRef.current;
    if (code) {
      // Dev: use query param; Production: would use subdomain
      return `/login?_tenant=${code}`;
    }
    return "/login";
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      // Capture tenant code BEFORE clearing store
      tenantCodeRef.current = useAppStore.getState().tenantCode;
      useSudoStore.getState().reset();
      usePatOneTimeSecretStore.getState().clearPendingReceipt();
      return authRepository.logout();
    },
    onSuccess: () => {
      const redirectUrl = getLogoutRedirectUrl();
      explicitRedirectRef.current = null;
      logoutStore();
      queryClient.clear();
      router.push(redirectUrl);
    },
    onError: (error: Error) => {
      const redirectUrl = getLogoutRedirectUrl();
      explicitRedirectRef.current = null;
      // Even if API fails, we should clear local state
      logoutStore();
      queryClient.clear();
      router.push(redirectUrl);
      operationError("Logout", undefined, error.message);
    },
  });

  const handleLogout = useCallback(
    async (redirectTo?: string): Promise<void> => {
      explicitRedirectRef.current = redirectTo ?? null;
      try {
        await mutation.mutateAsync();
      } catch {
        // Error notification, local cleanup, and redirect are handled in onError
      }
    },
    [mutation]
  );

  return {
    logout: mutation.mutateAsync,
    handleLogout,
    isLoading: mutation.isPending,
  };
}
