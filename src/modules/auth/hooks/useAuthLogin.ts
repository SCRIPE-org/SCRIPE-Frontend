import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { AuthMapper } from "../core/data/mappers/AuthMapper";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useNavigation } from "@core/providers/navigation-provider";

export function useAuthLogin() {
      const { authRepository } = useServices();
      const setUser = useAppStore((state) => state.setUser);
      const { operationError, operationSuccess } = useEnhancedToast();
      const { refreshNavigation } = useNavigation();
      const queryClient = useQueryClient();

      return useMutation({
            mutationFn: async ({ username, password }: { username: string; password: string }) => {
                  const request = AuthMapper.loginRequestFromJson({ username, password });
                  return authRepository.login(request);
            },
            onSuccess: async (user) => {
                  // 1. Set user in store (this triggers isAuthenticated = true)
                  setUser(user);

                  // 2. Show success toast
                  operationSuccess("Login successful!");

                  // 3. Fetch navigation data immediately after login (force refresh)
                  try {
                        await refreshNavigation(false, true); // skipLoading=false, forceRefresh=true
                  } catch (error) {
                        console.error("Failed to fetch navigation after login:", error);
                  }

                  // 4. Invalidate any cached queries to ensure fresh data on protected pages
                  queryClient.invalidateQueries();
            },
            onError: (error: Error) => {
                  operationError(error.message || "Login failed");
            }
      });
}
