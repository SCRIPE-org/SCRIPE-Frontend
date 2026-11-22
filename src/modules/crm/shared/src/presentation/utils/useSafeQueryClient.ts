"use client";

import { useContext } from "react";
import { QueryClientContext, type QueryClient } from "@tanstack/react-query";
import { queryClient as appQueryClient } from "@core/query-client";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { useAppStore } from "@core/store/useAppStore";

/**
 * Resolves the active TanStack QueryClient from React context or falls back to
 * the shared application QueryClient so ViewModels remain resilient in unit tests
 * that mount without an outer QueryClientProvider.
 * @returns Active QueryClient instance.
 */
export function useSafeQueryClient(): QueryClient {
  return useContext(QueryClientContext) ?? appQueryClient;
}

/**
 * Resolves the active tenant and user identifiers for query keys and client storage isolation.
 * @returns Normalized `{ tenantId, userId, scopeKey }` strings.
 */
export function useCrmTenantScope(): {
  tenantId: string;
  userId: string;
  scopeKey: string;
} {
  const contextTenantId = useCurrentTenantId();
  const userTenantId = useAppStore((s) => s.user?.tenantId ?? null);
  const tenantCode = useAppStore((s) => s.tenantCode ?? null);
  const userId = useAppStore((s) => s.user?.id ?? "anon");
  const tenantId = contextTenantId || userTenantId || tenantCode || "platform";
  return {
    tenantId,
    userId,
    scopeKey: `${tenantId}:${userId}`,
  };
}
