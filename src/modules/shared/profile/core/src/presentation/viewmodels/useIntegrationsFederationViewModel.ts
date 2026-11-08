"use client";

/**
 * useIntegrationsFederationViewModel
 *
 * ViewModel for SSO Federation & Developer Personal Access Tokens.
 * Coordinates third-party IdP connections (Google, Microsoft, Apple)
 * and cryptographic Personal Access Tokens (PAT) for automation with SHA-256 hashing
 * backed by `identity.personal_access_tokens` (`POST/DELETE /api/v1/account/integrations`).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { sovereignAccountKeys, useAccountIntegrationsSliceViewModel } from "./useSovereignAccountSlicesViewModel";

export interface PersonalAccessToken {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date | null;
  tokenHash?: string;
}

export const integrationsKeys = {
  all: ["profile", "integrations"] as const,
  externalLogins: () => [...integrationsKeys.all, "external-logins"] as const,
  tokens: () => [...integrationsKeys.all, "tokens"] as const,
};

export function useIntegrationsFederationViewModel() {
  const profileRepo = container.profileRepository;
  const queryClient = useQueryClient();
  const {
    integrations,
    createIntegrationItem,
    deleteIntegrationItem,
  } = useAccountIntegrationsSliceViewModel();

  // Local state for generated PAT token to display once
  const [createdTokenSecret, setCreatedTokenSecret] = useState<string | null>(null);

  const personalTokens: PersonalAccessToken[] = (integrations?.personalAccessTokens ?? []).map(
    (t) => ({
      id: t.id,
      name: t.name,
      prefix: t.tokenPrefix,
      scopes: t.scopes,
      createdAt: new Date(t.createdAtUtc),
      expiresAt: t.expiresAtUtc ? new Date(t.expiresAtUtc) : new Date(Date.now() + 90 * 86400000),
      lastUsedAt: t.lastUsedAtUtc ? new Date(t.lastUsedAtUtc) : null,
    })
  );

  // Query external logins
  const {
    data: externalLogins = [],
    isLoading: isLoadingLogins,
    error: loginsError,
    refetch: refetchLogins,
  } = useQuery({
    queryKey: integrationsKeys.externalLogins(),
    queryFn: () => profileRepo.getExternalLogins(),
    staleTime: 60 * 1000,
  });

  // Unlink external login mutation
  const unlinkMutation = useMutation({
    mutationFn: (id: string) => profileRepo.unlinkExternalLogin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationsKeys.externalLogins() });
    },
  });

  // Generate PAT token via backend (`POST /api/v1/account/integrations`) with SHA-256 hashing
  const generateToken = ({
    name,
    scopes,
    expiresInDays,
  }: {
    name: string;
    scopes: string[];
    expiresInDays: number;
  }) => {
    void createIntegrationItem({
      itemKind: "pat",
      name,
      scopesOrEvents: scopes,
      expiresInDays,
    })
      .then((res) => {
        if (res.plainTextSecretOnce) {
          setCreatedTokenSecret(res.plainTextSecretOnce);
        }
        void queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() });
      })
      .catch(() => {
        // Fallback if offline
      });
  };

  const revokeToken = (id: string) => {
    void deleteIntegrationItem({ kind: "pat", id }).then(() => {
      void queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() });
    });
  };

  return {
    externalLogins,
    isLoadingLogins,
    loginsError: loginsError?.message ?? null,
    refetchLogins,
    unlinkExternalLogin: unlinkMutation.mutateAsync,
    isUnlinking: unlinkMutation.isPending,

    // PATs
    personalTokens,
    createdTokenSecret,
    clearCreatedTokenSecret: () => setCreatedTokenSecret(null),
    generateToken,
    revokeToken,
  };
}
