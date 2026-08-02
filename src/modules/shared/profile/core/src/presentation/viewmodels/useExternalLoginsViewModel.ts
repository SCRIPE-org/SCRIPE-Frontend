"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCoreSsoProviders } from "@core/hooks/use-auth-bridge";
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

  // Cross-module access goes through the core bridge, not the runtime component registry.
  // The registry entry for `useSsoProviders` is only populated as a side effect of importing
  // the auth module barrel; the profile route never imports it, so the lookup resolved to
  // `undefined` and calling it crashed the page. The bridge is a static import, so the hook
  // is always defined and its identity is stable across renders (Rules of Hooks).
  const { providers, initiateSsoLogin, isLoading: isLoadingProviders } = useCoreSsoProviders();

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
