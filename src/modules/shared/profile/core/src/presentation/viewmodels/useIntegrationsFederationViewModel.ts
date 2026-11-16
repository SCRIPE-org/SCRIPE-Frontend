"use client";

/**
 * useIntegrationsFederationViewModel
 *
 * ViewModel for SSO Federation & Developer Personal Access Tokens (PATs).
 * Coordinates external IdP connections and Sudo-protected Personal Access Tokens
 * (`GET/POST/DELETE /api/v1/account/integrations`, `POST /api/v1/account/integrations/pats/{id}/roll`).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import {
  sovereignAccountKeys,
  useAccountIntegrationsSliceViewModel,
} from "./useSovereignAccountSlicesViewModel";
import type {
  AccountIntegrationsRateLimitTelemetry,
  AccountPatQuota,
  PatScopeOption,
} from "../../domain/entities/SovereignAccountWorkstationEntities";
import {
  usePatOneTimeSecretStore,
  type PatOneTimeSecretReceipt,
} from "../stores/patOneTimeSecretStore";

/** Re-exported rate-limit, PAT quota, and scope taxonomy entities for integrations views. */
export type {
  AccountIntegrationsRateLimitTelemetry,
  AccountPatQuota,
  PatScopeOption,
  PatOneTimeSecretReceipt,
};

/** Normalized Personal Access Token summary rendered in the integrations vault. */
export interface PersonalAccessToken {
  id: string;
  name: string;
  description?: string | null;
  prefix: string;
  scopes: string[];
  scopeDetails: PatScopeOption[];
  allowedCidrs: string[];
  rateLimitPerMinute?: number;
  dailyRequestCount?: number;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  rowVersion?: string | null;
  tokenHash?: string;
}

/** React Query key factory for external SSO logins and personal access token queries. */
export const integrationsKeys = {
  all: ["profile", "integrations"] as const,
  externalLogins: () => [...integrationsKeys.all, "external-logins"] as const,
  tokens: () => [...integrationsKeys.all, "tokens"] as const,
};

/** ViewModel coordinating external SSO bindings and Personal Access Token issuance/rotation. */
export function useIntegrationsFederationViewModel() {
  const profileRepo = container.profileRepository;
  const queryClient = useQueryClient();
  const {
    integrations,
    isLoadingIntegrations,
    isIntegrationsError,
    integrationsError,
    refetchIntegrations,
    createIntegrationItem,
    isCreatingItem,
    updatePersonalAccessToken,
    isUpdatingPat,
    rollPersonalAccessToken,
    isRollingPat,
    deleteIntegrationItem,
    isDeletingItem,
  } = useAccountIntegrationsSliceViewModel();

  const { pendingReceipt, setPendingReceipt, clearPendingReceipt } = usePatOneTimeSecretStore();

  const scopeCatalog = integrations?.scopeCatalog ?? [];
  const personalTokens: PersonalAccessToken[] = (integrations?.personalAccessTokens ?? []).map(
    (item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? null,
      prefix: item.tokenPrefix,
      scopes: item.scopes,
      scopeDetails: item.scopeDetails ?? [],
      allowedCidrs: item.allowedCidrs ?? [],
      rateLimitPerMinute: item.rateLimitPerMinute ?? undefined,
      dailyRequestCount: item.dailyRequestCount ?? undefined,
      createdAt: new Date(item.createdAtUtc),
      expiresAt: item.expiresAtUtc ? new Date(item.expiresAtUtc) : null,
      lastUsedAt: item.lastUsedAtUtc ? new Date(item.lastUsedAtUtc) : null,
      rowVersion: item.rowVersion ?? null,
    })
  );

  const availableScopes = integrations?.availableScopes ?? [];

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

  const unlinkMutation = useMutation({
    mutationFn: (id: string) => profileRepo.unlinkExternalLogin(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: integrationsKeys.externalLogins() });
    },
  });

  const generateToken = async ({
    name,
    description,
    scopes,
    expiresInDays,
    allowedCidrs,
  }: {
    name: string;
    description?: string | null;
    scopes: string[];
    expiresInDays: number;
    allowedCidrs?: string[];
  }): Promise<{ id: string; secret: string | null }> => {
    const res = await createIntegrationItem({
      itemKind: "pat",
      name,
      description,
      scopesOrEvents: scopes,
      expiresInDays,
      allowedCidrs: allowedCidrs && allowedCidrs.length > 0 ? allowedCidrs : undefined,
    });
    const secret = res.plainTextSecretOnce ?? null;
    if (secret) {
      setPendingReceipt({
        tokenId: res.id,
        tokenName: name,
        plainTextSecret: secret,
        fingerprintOrPrefix: res.fingerprintOrPrefix,
        isRotated: false,
      });
    }
    await queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() });
    return { id: res.id, secret };
  };

  const updateToken = async (
    id: string,
    payload: {
      name: string;
      description?: string | null;
      scopes: string[];
      allowedCidrs?: string[] | null;
      expiresInDays?: number | null;
      rowVersion?: string | null;
    }
  ): Promise<void> => {
    await updatePersonalAccessToken(id, payload);
    await queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() });
  };

  const rollToken = async (id: string, tokenName?: string): Promise<string | null> => {
    const res = await rollPersonalAccessToken(id);
    const secret = res.plainTextSecretOnce ?? null;
    const resolvedName =
      tokenName ?? personalTokens.find((t) => t.id === id)?.name ?? "Personal Access Token";
    if (secret) {
      setPendingReceipt({
        tokenId: res.id || id,
        tokenName: resolvedName,
        plainTextSecret: secret,
        fingerprintOrPrefix: res.fingerprintOrPrefix,
        isRotated: true,
      });
    }
    await queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() });
    return secret;
  };

  const revokeToken = async (id: string): Promise<void> => {
    await deleteIntegrationItem({ kind: "pat", id });
    if (pendingReceipt?.tokenId === id) {
      clearPendingReceipt();
    }
    await queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() });
  };

  return {
    externalLogins,
    isLoadingLogins,
    loginsError: loginsError?.message ?? null,
    refetchLogins,
    unlinkExternalLogin: unlinkMutation.mutateAsync,
    isUnlinking: unlinkMutation.isPending,

    // PATs, Scope Catalog, Quota & Rate-Limit Telemetry
    personalTokens,
    availableScopes,
    scopeCatalog,
    rateLimitTelemetry: integrations?.rateLimitTelemetry ?? null,
    patQuota: integrations?.patQuota ?? null,
    integrationsFeatureEnabled: integrations?.integrationsFeatureEnabled ?? true,
    isLoadingIntegrations,
    isIntegrationsError,
    integrationsError,
    refetchIntegrations,
    isCreatingToken: isCreatingItem,
    isUpdatingToken: isUpdatingPat,
    isRollingToken: isRollingPat,
    isRevokingToken: isDeletingItem,
    pendingSecretReceipt: pendingReceipt,
    createdTokenSecret: pendingReceipt?.plainTextSecret ?? null,
    clearCreatedTokenSecret: clearPendingReceipt,
    generateToken,
    updateToken,
    rollToken,
    revokeToken,
  };
}
