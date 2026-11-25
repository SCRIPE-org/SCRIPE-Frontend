"use client";

import { useCallback, useEffect, useState } from "react";
import { getAuthContainer } from "@modules/auth/di";
import type {
  SsoCallbackResult,
  SsoProvider,
} from "@modules/auth/core/domain/entities/SsoProvider";

/**
 * Exported type in the auth/signin module.
 */
export type {
  SsoCallbackResult,
  SsoNoLinkedAccountError,
  SsoProvider,
} from "@modules/auth/core/domain/entities/SsoProvider";

interface UseSsoProvidersOptions {
  tenantId?: string | null;
  mode?: string;
  staySignedIn?: boolean;
  /** When false (e.g. tenant resolution still loading or failed), suppresses fetching so platform providers never leak onto tenant login pages. */
  enabled?: boolean;
}

function resolveDiscoveryErrorKey(err: unknown): string {
  if (err && typeof err === "object") {
    const candidate = err as {
      status?: unknown;
      response?: { status?: unknown };
      message?: unknown;
    };
    const status = candidate.status ?? candidate.response?.status;
    if (status === 429) return "auth.sso.discoveryRateLimited";
    if (
      typeof candidate.message === "string" &&
      /\b429\b|too many requests/i.test(candidate.message)
    ) {
      return "auth.sso.discoveryRateLimited";
    }
  }
  return "auth.sso.discoveryError";
}

/**
 * React hook/ViewModel orchestrating SSO provider discovery and login initiation.
 */
export function useSsoProviders(options: UseSsoProvidersOptions = {}) {
  const { tenantId, mode = "inherit", staySignedIn = false, enabled = true } = options;
  const [retryCount, setRetryCount] = useState(0);
  const requestKey = enabled ? `${tenantId ?? ""}:${mode}:${retryCount}` : null;
  const [fetched, setFetched] = useState<{
    key: string | null;
    providers: SsoProvider[];
    discoveryError: string | null;
  }>({
    key: null,
    providers: [],
    discoveryError: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestKey) return;

    let cancelled = false;

    async function fetchProviders(activeKey: string) {
      try {
        const data = await getAuthContainer().ssoRepository.getProviders({ tenantId, mode });
        if (!cancelled) setFetched({ key: activeKey, providers: data, discoveryError: null });
      } catch (err) {
        if (!cancelled) {
          setFetched({
            key: activeKey,
            providers: [],
            discoveryError: resolveDiscoveryErrorKey(err),
          });
        }
      }
    }

    void fetchProviders(requestKey);
    return () => {
      cancelled = true;
    };
  }, [requestKey, tenantId, mode]);

  const retryProviders = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const initiateSsoLogin = useCallback(
    async (providerId: string, protocol?: string) => {
      setError(null);
      try {
        if (tenantId || staySignedIn) {
          await getAuthContainer().ssoRepository.initiateLogin(providerId, protocol, {
            targetTenantId: tenantId ?? undefined,
            staySignedIn,
          });
        } else {
          await getAuthContainer().ssoRepository.initiateLogin(providerId, protocol);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start SSO login");
      }
    },
    [tenantId, staySignedIn]
  );

  const isMatched = Boolean(requestKey && fetched.key === requestKey);
  const providers = isMatched ? fetched.providers : [];
  const discoveryError = isMatched ? fetched.discoveryError : null;
  const isLoading = Boolean(requestKey && fetched.key !== requestKey);

  return {
    providers,
    isLoading,
    error,
    discoveryError,
    hasProviders: providers.length > 0,
    initiateSsoLogin,
    retryProviders,
  };
}

/**
 * Exchanges an OIDC callback code and state via the auth container's SSO repository.
 */
export function completeSsoCallback(code: string, state: string): Promise<SsoCallbackResult> {
  return getAuthContainer().ssoRepository.completeCallback(code, state);
}
