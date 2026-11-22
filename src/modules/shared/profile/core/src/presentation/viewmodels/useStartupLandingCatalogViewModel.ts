"use client";

import { getCoreContainer } from "@core/di";
import { useLandingTargetCatalog } from "@core/navigation";

/**
 * ViewModel hook lazily loading the unlocked workspace & menu landing catalog
 * for `/account/preferences` via TanStack Query (cached per `contextKey`).
 */
export function useStartupLandingCatalogViewModel(contextKey: string, enabled = true) {
  const { navigationRepository } = getCoreContainer();
  return useLandingTargetCatalog({
    repository: navigationRepository,
    scopeMode: "current_context",
    contextKey,
    enabled,
  });
}
