"use client";

import {
  buildEntityFilterOptions,
  type EntityFilterOption,
  useEntityCatalogLookup,
} from "../../../../entities/src/presentation/hooks/useEntityCatalogLookup";

/** Localized entity filter option constructed from live catalog + observed presets. */
export type PresetEntityFilterOption = EntityFilterOption;

/**
 * Builds deduplicated sorted entity filter options from the union of live tenant catalog
 * entities and observed preset entityKeys (never relying on hardcoded lists).
 */
export const buildPresetEntityFilterOptions = buildEntityFilterOptions;

/**
 * ViewModel helper hook loading the live Data Exchange entity catalog via the shared
 * entity catalog lookup hook and resolving dynamic entity display names for Presets.
 */
export function usePresetsEntityCatalog() {
  return useEntityCatalogLookup();
}
