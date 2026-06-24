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
}

/**
 * React hook/ViewModel managing logic, state, and repository queries for sso providers.
 */
export function useSsoProviders(options: UseSsoProvidersOptions = {}) {
  const { tenantId, mode = "inherit" } = options;
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProviders() {
      try {
        const data = await getAuthContainer().ssoRepository.getProviders({ tenantId, mode });
        if (!cancelled) setProviders(data);
      } catch {
        if (!cancelled) setProviders([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProviders();
    return () => {
      cancelled = true;
    };
  }, [tenantId, mode]);

  const initiateSsoLogin = useCallback(async (providerId: string, protocol?: string) => {
    setError(null);
    try {
      await getAuthContainer().ssoRepository.initiateLogin(providerId, protocol);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start SSO login");
    }
  }, []);

  return {
    providers,
    isLoading,
    error,
    hasProviders: providers.length > 0,
    initiateSsoLogin,
  };
}

/**
 * Utility function executing operational rules for complete sso callback.
 */
export function completeSsoCallback(code: string, state: string): Promise<SsoCallbackResult> {
  return getAuthContainer().ssoRepository.completeCallback(code, state);
}
