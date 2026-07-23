"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { useI18n } from "@core/providers/i18n-provider";
import { getComponent } from "@core/common/component-registry";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

/**
 * Exported constant defining parameters and fields for external login keys configurations.
 */
export const externalLoginKeys = {
  all: ["profile", "external-logins"] as const,
};

/**
 * React hook/ViewModel orchestrating state and data flows for external logins view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useExternalLoginsViewModel() {
  const repo = container.profileRepository;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { toast } = useEnhancedToast();

  // Re-use the hook dynamically from global registry to avoid cross-module references
  const useSsoProvidersHook = getComponent("useSsoProviders")!;
  const { providers, initiateSsoLogin, isLoading: isLoadingProviders } = useSsoProvidersHook();

  // 1. Fetch existing linked accounts
  const { data: externalLogins, isLoading: isLoadingLogins } = useQuery({
    queryKey: externalLoginKeys.all,
    queryFn: () => repo.getExternalLogins(),
  });

  // 2. Unlink Mutation
  const { mutate: unlink, isPending: isUnlinking } = useMutation({
    mutationFn: (id: string) => repo.unlinkExternalLogin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: externalLoginKeys.all });
      toast({
        title: t("common.success"),
        description: t("sso.accountUnlinked"),
        variant: "default",
      });
    },
    onError: (err: Error) => {
      toast({
        title: t("common.error"),
        description: err.message || t("sso.unlinkError"),
        variant: "destructive",
      });
    },
  });

  // 3. Link Action
  // We use special session storage state to tell the callback it's a "Link" flow
  const handleLink = (providerId: string, protocol: string) => {
    sessionStorage.setItem("sso_linking", "true");
    initiateSsoLogin(providerId, protocol);
  };

  return {
    externalLogins: externalLogins ?? [],
    providers,
    isLoading: isLoadingLogins || isLoadingProviders,
    isUnlinking,
    unlink,
    handleLink,
  };
}
