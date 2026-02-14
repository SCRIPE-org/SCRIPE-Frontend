import { useMutation } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useRouter } from "next/navigation";

export function useAuthLogout() {
  const { authRepository } = useServices();
  const logoutStore = useAppStore((state) => state.logout);
  const { operationError } = useEnhancedToast();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      return authRepository.logout();
    },
    onSuccess: () => {
      logoutStore();
      router.push("/login");
    },
    onError: (error: Error) => {
      // Even if API fails, we should clear local state
      logoutStore();
      router.push("/login"); // Force logout
      operationError(error.message || "Logout failed");
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
