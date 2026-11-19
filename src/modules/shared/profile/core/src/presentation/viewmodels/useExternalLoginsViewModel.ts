"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { useI18n } from "@core/providers/i18n-provider";
import { sanitizeHttpUrl } from "@core/common/sanitize";
import { useSudoStore } from "@core/store/useSudoStore";
import { toast } from "@core/ui/sileo-toast";
import type { AvailableSsoProvider } from "../../domain/entities/SovereignAccountEntities";
import {
  useAccountSecuritySliceViewModel,
  sovereignAccountKeys,
} from "./useSovereignAccountSlicesViewModel";
import { ensureSudoElevation, isSudoCancelledError } from "../utils/sudoElevation";
import { findOrphanedExternalLogins } from "../utils/enterprise-sso.utils";
import { resolveProfileSaveErrorMessage } from "../utils/concurrency";

/**
 * TanStack Query cache keys for linked external logins on `/account/security`.
 */
export const externalLoginKeys = {
  all: ["profile", "external-logins"] as const,
};

/**
 * ViewModel hook coordinating live DB Enterprise SSO providers (`availableSsoProviders`),
 * orphaned external login bindings, Sudo-gated federated link initiation (`/initiate-link`),
 * and Sudo-gated unlinking.
 */
export function useExternalLoginsViewModel() {
  const repo = container.profileRepository;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isSudoActive = useSudoStore((s) => s.isActive);
  const { security, isLoadingSecurity } = useAccountSecuritySliceViewModel();

  const {
    data: externalLogins,
    isLoading: isLoadingLogins,
    isError: isLoginsError,
    error: loginsError,
    refetch,
  } = useQuery({
    queryKey: externalLoginKeys.all,
    queryFn: () => repo.getExternalLogins(),
  });

  const invalidateSsoQueries = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: externalLoginKeys.all });
    void queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.security() });
    void queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.context() });
  }, [queryClient]);

  const initiateLinkMutation = useMutation({
    mutationFn: async (provider: AvailableSsoProvider) => {
      const sudoToken = await ensureSudoElevation();
      const protocol = provider.protocol.trim().toLowerCase();
      const callbackPath = protocol === "saml" ? "/sso/saml/callback" : "/sso/callback";
      const redirectUri =
        typeof window !== "undefined" ? `${window.location.origin}${callbackPath}` : undefined;

      const result = await repo.initiateExternalLoginLink(
        {
          identityProviderId: provider.encryptedId,
          redirectUri,
        },
        sudoToken
      );

      if (typeof window !== "undefined") {
        sessionStorage.setItem("sso_linking", "true");
        sessionStorage.setItem("sso_linking_origin", "/account/security");
        if (protocol !== "saml") {
          sessionStorage.setItem("sso_provider_id", provider.encryptedId);
          if (result.state) {
            sessionStorage.setItem("sso_state", result.state);
          } else {
            sessionStorage.removeItem("sso_state");
          }
        }
        sessionStorage.removeItem("sso_code_verifier");
        if (result.authorizationUrl) {
          const safeAuthUrl = sanitizeHttpUrl(result.authorizationUrl);
          if (!safeAuthUrl) {
            throw new Error("Invalid SSO authorization redirect URL.");
          }
          window.location.href = safeAuthUrl;
        }
      }

      return result;
    },
    onError: (err: unknown) => {
      if (isSudoCancelledError(err)) return;
      toast.error(resolveProfileSaveErrorMessage(err, t));
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async (externalLoginId: string) => {
      const sudoToken = await ensureSudoElevation();
      return repo.unlinkExternalLogin(externalLoginId, sudoToken);
    },
    onSuccess: () => {
      invalidateSsoQueries();
      toast.success(t("profile.security.ssoAccountUnlinkedNotice"));
    },
    onError: (err: unknown) => {
      if (isSudoCancelledError(err)) return;
      toast.error(resolveProfileSaveErrorMessage(err, t));
    },
  });

  const availableSsoProviders = security?.availableSsoProviders ?? [];
  const loginsList = externalLogins ?? [];
  const orphanedExternalLogins = findOrphanedExternalLogins(availableSsoProviders, loginsList);

  const rawLinkError = initiateLinkMutation.error;
  const linkErrorMessage =
    rawLinkError && !isSudoCancelledError(rawLinkError)
      ? resolveProfileSaveErrorMessage(rawLinkError, t)
      : null;

  return {
    availableSsoProviders,
    externalLogins: loginsList,
    orphanedExternalLogins,
    isLoading: isLoadingLogins || isLoadingSecurity,
    isError: isLoginsError,
    error: loginsError instanceof Error ? loginsError.message : null,
    refetch,
    isSudoActive,
    isUnlinking: unlinkMutation.isPending,
    unlink: unlinkMutation.mutate,
    unlinkAsync: unlinkMutation.mutateAsync,
    initiateFederatedLink: initiateLinkMutation.mutateAsync,
    isInitiatingLink: initiateLinkMutation.isPending,
    linkErrorMessage,
    resetLinkError: initiateLinkMutation.reset,
    invalidateSsoQueries,
  };
}
