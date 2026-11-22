"use client";

import * as React from "react";
import { QueryClient, QueryClientContext, useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import type {
  LandingTargetCatalog,
  LandingTargetScopeMode,
} from "../../domain/entities/LandingTargetCatalog";
import type { INavigationRepository } from "../../domain/interfaces/INavigationRepository";

export interface UseLandingTargetCatalogArgs {
  repository?: Pick<INavigationRepository, "fetchLandingTargetCatalog"> | null;
  scopeMode: LandingTargetScopeMode;
  contextKey: string;
  enabled?: boolean;
}

/**
 * Lazily fetches and caches the landing target catalog per `(contextKey, scopeMode)`
 * using TanStack Query. Never executes during login bootstrap — only when a consumer
 * view such as `/account/preferences` or `/roles` mounts.
 */
export function useLandingTargetCatalog({
  repository,
  scopeMode,
  contextKey,
  enabled = true,
}: UseLandingTargetCatalogArgs) {
  const queryClient = React.useContext(QueryClientContext);
  const [fallbackClient] = React.useState(() => new QueryClient());
  const resolvedClient = queryClient ?? fallbackClient;
  const canFetch =
    Boolean(queryClient) &&
    enabled &&
    Boolean(contextKey) &&
    typeof repository?.fetchLandingTargetCatalog === "function";

  const query = useQuery<LandingTargetCatalog>(
    {
      queryKey: qk.navigation.landingTargets(contextKey, scopeMode),
      queryFn: () => repository!.fetchLandingTargetCatalog(scopeMode),
      enabled: canFetch,
      staleTime: 60_000,
    },
    resolvedClient
  );

  return {
    catalog: query.data ?? null,
    isLoading: canFetch ? query.isLoading : false,
    isFetching: canFetch ? query.isFetching : false,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
