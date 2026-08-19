/**
 * Entity Types registry ViewModel — Wave 5 row 5.5
 *
 * Backs the read-only `/custom-fields/entity-types` page. Owns the
 * entity-types query and the per-key comparison between the backend's
 * `hasFrontendScreen` claim and this repo's own `entityScreenManifest`, so
 * the view stays a pure rendering of already-decided rows.
 *
 * Shares the exact query key `["customFields", "entityTypes"]` with
 * `useCustomFieldViewModel` on purpose: both read the same immutable
 * process-lifetime registry, and an admin arriving here from the definitions
 * screen should hit the warm cache rather than refetch. The 1-hour staleTime
 * is copied from there for the same reason.
 */
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomFieldsContainer } from "../../../../di";
import type { EntityTypeInfo } from "../../domain/entities/CustomField";
import { hasFrontendScreenInThisRepo } from "../entityScreenManifest";

/**
 * How one entity type's two claims line up.
 *
 * `aligned` covers BOTH agreements (screen/screen and none/none) — the page
 * shows the two claims in their own columns, so this value only has to say
 * whether they disagree and which way.
 *
 * Declared as a const array rather than a bare union so it can be iterated:
 * `entityTypeCatalog.locale.test.ts` asserts one `agreement.*` string per
 * member in both locales, the same enum-driven completeness gate this module
 * already uses for the value-type and validator-kind catalogs.
 */
export const ENTITY_TYPE_SCREEN_AGREEMENTS = [
  "aligned",
  "backendClaimsScreenOnly",
  "frontendScreenOnly",
] as const;

export type EntityTypeScreenAgreement = (typeof ENTITY_TYPE_SCREEN_AGREEMENTS)[number];

export interface EntityTypeCatalogRow {
  entityType: EntityTypeInfo;
  /** The backend registry's own `HasFrontendScreen` for this key. */
  backendClaimsScreen: boolean;
  /** Whether `entityScreenManifest.ts` lists this key. */
  frontendHasScreen: boolean;
  agreement: EntityTypeScreenAgreement;
}

export interface EntityTypeCatalogStats {
  total: number;
  withScreen: number;
  drift: number;
}

export function useEntityTypeCatalogViewModel() {
  const { customFieldRepository } = getCustomFieldsContainer();

  const {
    data: entityTypes = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60,
  });

  const rows = useMemo<EntityTypeCatalogRow[]>(
    () =>
      entityTypes.map((entityType) => {
        // `?? true` matches CustomFieldListView's identical fallback: a
        // response from an older backend omits the field entirely, and
        // treating that as "screenless" would mislabel every entity type at
        // once. Pre-feature behaviour was "everything has a screen", so that
        // is the honest default — and it makes the absent-field case read as
        // agreement rather than as 55 fabricated drift rows.
        const backendClaimsScreen = entityType.hasFrontendScreen ?? true;
        const frontendHasScreen = hasFrontendScreenInThisRepo(entityType.key);
        return {
          entityType,
          backendClaimsScreen,
          frontendHasScreen,
          agreement:
            backendClaimsScreen === frontendHasScreen
              ? "aligned"
              : backendClaimsScreen
                ? "backendClaimsScreenOnly"
                : "frontendScreenOnly",
        };
      }),
    [entityTypes]
  );

  const stats = useMemo<EntityTypeCatalogStats>(
    () => ({
      total: rows.length,
      withScreen: rows.filter((row) => row.backendClaimsScreen).length,
      drift: rows.filter((row) => row.agreement !== "aligned").length,
    }),
    [rows]
  );

  return { rows, stats, isLoading, isError, refetch };
}
