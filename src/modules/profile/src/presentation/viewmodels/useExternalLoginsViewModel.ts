"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "../../../di";
import { useI18n } from "@core/providers/i18n-provider";
import { useSsoProviders } from "@modules/auth/hooks/useSsoProviders";
import { useToast } from "@core/hooks/use-toast";

export const externalLoginKeys = {
      all: ["profile", "external-logins"] as const,
};

export function useExternalLoginsViewModel() {
      const repo = container.profileRepository;
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const { toast } = useToast();

      // Re-use the hook to get available providers and the link initiator
      const { providers, initiateSsoLogin, isLoading: isLoadingProviders } = useSsoProviders();

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
            onError: (err: any) => {
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
