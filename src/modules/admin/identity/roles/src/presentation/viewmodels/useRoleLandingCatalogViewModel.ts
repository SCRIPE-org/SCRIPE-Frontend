"use client";

import { getCoreContainer } from "@core/di";
import { useLandingTargetCatalog, type LandingTargetScopeMode } from "@core/navigation";

/**
 * ViewModel hook lazily loading the unlocked workspace & menu landing catalog
 * for `/roles` and `/roles/[id]` via TanStack Query (cached per `contextKey` + `scopeMode`).
 */
export function useRoleLandingCatalogViewModel(
  scopeMode: LandingTargetScopeMode,
  contextKey: string,
  enabled = true
) {
  const { navigationRepository } = getCoreContainer();
  return useLandingTargetCatalog({
    repository: navigationRepository,
    scopeMode,
    contextKey,
    enabled,
  });
}
