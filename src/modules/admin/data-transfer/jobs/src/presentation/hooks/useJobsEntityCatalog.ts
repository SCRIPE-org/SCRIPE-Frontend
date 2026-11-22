"use client";

import { useEntityCatalogLookup } from "../../../../entities/src/presentation/hooks/useEntityCatalogLookup";

/**
 * ViewModel helper hook that loads the live tenant Data Exchange entity catalog
 * via the shared entity catalog lookup hook.
 */
export function useJobsEntityCatalog() {
  return useEntityCatalogLookup();
}
