import { useMutation } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { AuthMapper } from "../core/data/mappers/AuthMapper";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

export function useAuthLogin() {
      const { authRepository } = useServices();
      const setUser = useAppStore((state) => state.setUser);
      const { operationError } = useEnhancedToast();

      return useMutation({
            mutationFn: async ({ username, password }: { username: string; password: string }) => {
                  const request = AuthMapper.loginRequestFromJson({ username, password });
                  return authRepository.login(request);
            },
            onSuccess: (user) => {
                  setUser(user);
            },
            onError: (error: Error) => {
                  operationError(error.message || "Login failed");
            }
      });
}
