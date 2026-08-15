import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

/**
 * Tenant-aware logout hook.
 * Reads the stored `tenantCode` BEFORE clearing auth state,
 * then redirects back to the tenant's login page.
 */
export function useAuthLogout() {
  const { authRepository } = useServices();
  const logoutStore = useAppStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { operationError } = useEnhancedToast();
  const router = useRouter();

  // Snapshot tenantCode before logout clears it
  const tenantCodeRef = useRef<string | null>(null);

  const getLogoutRedirectUrl = useCallback((): string => {
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
      return authRepository.logout();
    },
    onSuccess: () => {
      const redirectUrl = getLogoutRedirectUrl();
      logoutStore();
      queryClient.clear();
      router.push(redirectUrl);
    },
    onError: (error: Error) => {
      const redirectUrl = getLogoutRedirectUrl();
      // Even if API fails, we should clear local state
      logoutStore();
      queryClient.clear();
      router.push(redirectUrl);
      operationError("Logout", undefined, error.message);
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
