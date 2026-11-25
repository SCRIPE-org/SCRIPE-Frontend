"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { registerSessionCleanupCallback } from "@core/common/session-cleanup-registry";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type { CrmDealCommercialPackage } from "../../domain/models/crm-opportunity-quote.types";

const PACKAGE_MEMORY_CACHE = new Map<string, CrmDealCommercialPackage>();

/**
 * Purges volatile commercial quote packages from memory (invoked automatically on logout/identity swap).
 */
export function clearOpportunityCommercialPackageCache(): void {
  PACKAGE_MEMORY_CACHE.clear();
}

registerSessionCleanupCallback(clearOpportunityCommercialPackageCache);

function isAuthenticatedUserScope(userId: string): boolean {
  return Boolean(userId && userId !== "anon");
}

function buildStorageKey(tenantId: string, userId: string, opportunityId: string): string {
  return `scripe:crm:deal-package:${tenantId}:${userId}:${opportunityId}`;
}

function readScopedPackage(
  tenantId: string,
  userId: string,
  opportunityId: string
): CrmDealCommercialPackage | null {
  const key = buildStorageKey(tenantId, userId, opportunityId);
  const inMemory = PACKAGE_MEMORY_CACHE.get(key);
  if (inMemory) return inMemory;
  if (typeof window === "undefined" || !isAuthenticatedUserScope(userId)) return null;
  try {
    const raw = window.sessionStorage?.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CrmDealCommercialPackage;
    PACKAGE_MEMORY_CACHE.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeScopedPackage(
  tenantId: string,
  userId: string,
  opportunityId: string,
  pkg: CrmDealCommercialPackage
): CrmDealCommercialPackage {
  const key = buildStorageKey(tenantId, userId, opportunityId);
  PACKAGE_MEMORY_CACHE.set(key, pkg);
  if (typeof window !== "undefined" && isAuthenticatedUserScope(userId)) {
    try {
      window.sessionStorage?.setItem(key, JSON.stringify(pkg));
    } catch {
      /* sessionStorage quota exceeded or unavailable */
    }
  }
  return pkg;
}

/**
 * Opportunity-scoped commercial quote & Sports OS handoff state hook backed by TanStack Query v5.
 * Never mutates tenant-wide CRM settings (`PUT /v1/crm/settings/tenant`).
 */
export function useOpportunityCommercialPackage(opportunityId: string) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId, userId } = useCrmTenantScope();
  const queryKey = ["crm", tenantId, userId, "opportunity-commercial-package", opportunityId] as const;

  const packageQuery = useQuery<CrmDealCommercialPackage | null>(
    {
      queryKey,
      queryFn: () => readScopedPackage(tenantId, userId, opportunityId),
      initialData: () => readScopedPackage(tenantId, userId, opportunityId),
      staleTime: Infinity,
    },
    safeQueryClient
  );

  const packageMutation = useMutation(
    {
      mutationFn: async (next: CrmDealCommercialPackage) =>
        writeScopedPackage(tenantId, userId, opportunityId, next),
      onSuccess: (saved) => {
        safeQueryClient.setQueryData(queryKey, saved);
      },
    },
    safeQueryClient
  );

  const savePackage = useCallback(
    (
      updater:
        | CrmDealCommercialPackage
        | ((prev: CrmDealCommercialPackage | null) => CrmDealCommercialPackage)
    ) => {
      const latest = readScopedPackage(tenantId, userId, opportunityId);
      const next = typeof updater === "function" ? updater(latest) : updater;
      writeScopedPackage(tenantId, userId, opportunityId, next);
      safeQueryClient.setQueryData(queryKey, next);
      packageMutation.mutate(next);
    },
    [opportunityId, packageMutation, queryKey, safeQueryClient, tenantId, userId]
  );

  return {
    commercialPackage: packageQuery.data ?? null,
    savePackage,
    isSaving: packageMutation.isPending,
  };
}
