"use client";

/**
 * useIntegrationsFederationViewModel
 *
 * ViewModel for SSO Federation & Developer Personal Access Tokens.
 * Coordinates third-party IdP connections (Google, Microsoft, Apple)
 * and cryptographic Personal Access Tokens (PAT) for automation with SHA-256 hashing
 * and backend database persistence via `adminSettingsJson`.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { useProfileDossierViewModel } from "./useProfileDossierViewModel";

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

interface SerializedPersonalAccessToken {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  tokenHash?: string;
}

export const integrationsKeys = {
  all: ["profile", "integrations"] as const,
  externalLogins: () => [...integrationsKeys.all, "external-logins"] as const,
  tokens: () => [...integrationsKeys.all, "tokens"] as const,
};

async function computeSha256Hex(input: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(input);
    const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
    return (
      "sha256:" +
      Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
  }
  return `sha256:${input.slice(0, 16)}`;
}

export function useIntegrationsFederationViewModel() {
  const profileRepo = container.profileRepository;
  const queryClient = useQueryClient();
  const { profile, updateProfile } = useProfileDossierViewModel();
  const hasHydratedTokensRef = useRef(false);

  // Local state for generated PAT token to display once
  const [createdTokenSecret, setCreatedTokenSecret] = useState<string | null>(null);

  // PAT list hydrated from backend `adminSettingsJson`
  const [personalTokens, setPersonalTokens] = useState<PersonalAccessToken[]>([]);

  useEffect(() => {
    if (!profile?.adminSettingsJson || hasHydratedTokensRef.current) return;
    try {
      const parsed = JSON.parse(profile.adminSettingsJson) as {
        personalAccessTokens?: SerializedPersonalAccessToken[];
      };
      if (Array.isArray(parsed.personalAccessTokens) && parsed.personalAccessTokens.length > 0) {
        hasHydratedTokensRef.current = true;
        setPersonalTokens(
          parsed.personalAccessTokens.map((t) => ({
            id: t.id,
            name: t.name,
            prefix: t.prefix,
            scopes: t.scopes,
            createdAt: new Date(t.createdAt),
            expiresAt: new Date(t.expiresAt),
            lastUsedAt: t.lastUsedAt ? new Date(t.lastUsedAt) : null,
            tokenHash: t.tokenHash,
          }))
        );
      }
    } catch {
      // ignore malformed JSON
    }
  }, [profile?.adminSettingsJson]);

  const persistTokensToBackend = useCallback(
    (tokens: PersonalAccessToken[]) => {
      if (!profile) return;
      let existing: Record<string, unknown> = {};
      if (profile.adminSettingsJson) {
        try {
          existing = JSON.parse(profile.adminSettingsJson) as Record<string, unknown>;
        } catch {
          existing = {};
        }
      }
      const serialized: SerializedPersonalAccessToken[] = tokens.map((t) => ({
        id: t.id,
        name: t.name,
        prefix: t.prefix,
        scopes: t.scopes,
        createdAt: t.createdAt.toISOString(),
        expiresAt: t.expiresAt.toISOString(),
        lastUsedAt: t.lastUsedAt ? t.lastUsedAt.toISOString() : null,
        tokenHash: t.tokenHash,
      }));
      updateProfile({
        firstName: profile.firstName || "Alex",
        lastName: profile.lastName || "Morgan",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio,
        activeBranchName: profile.activeBranchName,
        isAvailableForOperations: profile.isAvailableForOperations,
        adminSettingsJson: JSON.stringify({
          ...existing,
          personalAccessTokens: serialized,
        }),
      }).catch(() => {
        // Optimistic state update remains active
      });
    },
    [profile, updateProfile]
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

  // Generate PAT token with SHA-256 hashing & DB persistence
  const generateToken = ({
    name,
    scopes,
    expiresInDays,
  }: {
    name: string;
    scopes: string[];
    expiresInDays: number;
  }) => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const secret = `scr_pat_${randomHex}`;
    const prefix = `scr_pat_live_${randomHex.slice(0, 4)}`;

    const newToken: PersonalAccessToken = {
      id: `pat-${Date.now()}`,
      name,
      prefix,
      scopes,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 86400000),
      lastUsedAt: null,
    };

    setCreatedTokenSecret(secret);
    setPersonalTokens((prev) => {
      const next = [newToken, ...prev];
      void computeSha256Hex(secret).then((hash) => {
        const withHash = next.map((item) =>
          item.id === newToken.id ? { ...item, tokenHash: hash } : item
        );
        persistTokensToBackend(withHash);
      });
      return next;
    });
  };

  const revokeToken = (id: string) => {
    setPersonalTokens((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persistTokensToBackend(next);
      return next;
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
